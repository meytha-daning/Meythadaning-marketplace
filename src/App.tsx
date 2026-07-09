import React, { useState, useEffect } from "react";
import { Sparkles, ShoppingBag, Store, ClipboardList, LogOut, Heart, Search } from "lucide-react";

import { Product, Transaction, User } from "./types";
import { 
  syncFromServer, 
  addOrUpdateProductOnServer, 
  deleteProductOnServer, 
  createTransactionOnServer,
  getAllProducts,
  getAllTransactions,
  deleteTransactionOnServer,
  confirmTransactionPaymentOnServer,
  listenToProducts,
  listenToTransactions
} from "./dbService";

// Import modular views
import LoginView from "./components/LoginView";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import DashboardView from "./components/DashboardView";
import KelolaProdukView from "./components/KelolaProdukView";
import KasirView from "./components/KasirView";
import HistoryView from "./components/HistoryView";
import ModalProduct from "./components/ModalProduct";
import InvoiceDetail from "./components/InvoiceDetail";
import BerandaView from "./components/BerandaView";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("beranda");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Database States
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Custom Router Parsing
  const pathName = window.location.pathname;
  const isInvoiceRoute = pathName.startsWith("/nota/");
  const invoiceId = isInvoiceRoute ? pathName.split("/nota/")[1] : null;

  // 1. Initial Load, Session Restore, and Real-Time Active Synchronization
  useEffect(() => {
    // Restore session
    const savedUser = localStorage.getItem("bnf_user_session");
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        setUser(u);
        // Default admin to dashboard, buyers to beranda
        setActiveTab(u.role === "admin" ? "dashboard" : "beranda");
      } catch (e) {
        console.error("Gagal mengurai sesi user.", e);
      }
    }

    // Subscribe to products real-time
    const unsubscribeProducts = listenToProducts((latestProducts) => {
      setProducts(latestProducts);
    });

    // Subscribe to transactions real-time
    const unsubscribeTransactions = listenToTransactions((latestTransactions) => {
      setTransactions(latestTransactions);
    });

    return () => {
      unsubscribeProducts();
      unsubscribeTransactions();
    };
  }, []);

  const syncData = async () => {
    const data = await syncFromServer();
    setProducts(data.products);
    setTransactions(data.transactions);
  };

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem("bnf_user_session", JSON.stringify(loggedInUser));
    setActiveTab(loggedInUser.role === "admin" ? "dashboard" : "beranda");
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("bnf_user_session");
    setActiveTab("beranda");
  };

  // Product CRUD Handlers
  const handleAddProductClick = () => {
    setSelectedProduct(null);
    setIsProductModalOpen(true);
  };

  const handleEditProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (product: Product, isNew: boolean) => {
    const success = await addOrUpdateProductOnServer(product, isNew);
    if (success) {
      await syncData(); // Refresh local list
    } else {
      alert("Gagal sinkronisasi produk dengan server, data disimpan secara lokal.");
      await syncData();
    }
  };

  const handleDeleteProduct = async (id: string) => {
    const success = await deleteProductOnServer(id);
    if (success) {
      await syncData();
    } else {
      alert("Gagal menghapus produk dari server.");
    }
  };

  const handleCheckoutComplete = async (trx: Transaction) => {
    const success = await createTransactionOnServer(trx);
    if (success) {
      await syncData();
    } else {
      alert("Pemesanan berhasil disimpan lokal. Segera hubungi penjual via WhatsApp.");
      await syncData();
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      const success = await deleteTransactionOnServer(id);
      if (success) {
        await syncData();
      }
    } catch (e) {
      console.error("Gagal menghapus transaksi:", e);
    }
  };

  const handleConfirmTransaction = async (id: string) => {
    try {
      const success = await confirmTransactionPaymentOnServer(id);
      if (success) {
        await syncData();
      } else {
        alert("Gagal konfirmasi pembayaran transaksi.");
      }
    } catch (e) {
      console.error("Gagal konfirmasi pembayaran:", e);
    }
  };

  // Render Public Invoice Route without needing login
  if (isInvoiceRoute && invoiceId) {
    return (
      <InvoiceDetail 
        transactionId={invoiceId} 
        onBackToApp={() => {
          // Go back to the catalog if they click go back
          window.history.pushState({}, "", "/");
          window.location.reload();
        }}
      />
    );
  }

  // Render Auth screen if not logged in
  if (!user) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  // Active View Router
  const renderActiveView = () => {
    switch (activeTab) {
      case "beranda":
        return (
          <BerandaView
            onExploreCatalog={() => setActiveTab("catalog")}
            buyerName={user?.nama || "Pelanggan"}
          />
        );
      case "dashboard":
        return (
          <DashboardView
            products={products}
            transactions={transactions}
            onNavigateToProducts={() => setActiveTab("products")}
            onNavigateToKasir={() => setActiveTab("kasir")}
          />
        );
      case "products":
        return (
          <KelolaProdukView
            products={products}
            onAddProductClick={handleAddProductClick}
            onEditProductClick={handleEditProductClick}
            onDeleteProductClick={handleDeleteProduct}
          />
        );
      case "kasir":
      case "catalog":
        return (
          <KasirView
            products={products}
            user={user!}
            onCheckoutComplete={handleCheckoutComplete}
            onBackToBeranda={() => setActiveTab("beranda")}
          />
        );
      case "transactions":
      case "my-history":
        // Filter transactions for buyer
        const filteredTxs = user.role === "admin" 
          ? transactions 
          : transactions.filter((t) => t.buyerEmail === user.email);

        return (
          <HistoryView
            transactions={filteredTxs}
            onDeleteTransactionClick={user.role === "admin" ? handleDeleteTransaction : undefined}
            onConfirmTransactionClick={user.role === "admin" ? handleConfirmTransaction : undefined}
          />
        );
      default:
        return (
          <KasirView
            products={products}
            user={user}
            onCheckoutComplete={handleCheckoutComplete}
          />
        );
    }
  };

  return (
    <div id="app-wrapper" className="flex h-screen w-screen overflow-hidden bg-rose-50/20 font-sans">
      
      {/* Sidebar Navigation */}
      <Sidebar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onLogout={handleLogout}
      />

      {/* Main Panel Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        
        {/* Top Header */}
        <Header
          user={user}
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          cartCount={0} // Managed inside KasirView but placeholder here
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={handleLogout}
        />

        {/* Content Section */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Modals & Overlays */}
      <ModalProduct
        product={selectedProduct}
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={handleSaveProduct}
      />

    </div>
  );
}
