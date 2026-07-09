import React, { useState } from "react";
import { Search, ShoppingCart, Plus, Minus, Trash2, ArrowRight, Sparkles, Filter, X, Send, Printer } from "lucide-react";
import { Product, CartItem, Transaction, User } from "../types";

interface KasirViewProps {
  products: Product[];
  user: User;
  onCheckoutComplete: (trx: Transaction) => Promise<void>;
  onBackToBeranda?: () => void;
}

export default function KasirView({ products, user, onCheckoutComplete, onBackToBeranda }: KasirViewProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Semua");
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Checkout Modal states
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [buyerName, setBuyerName] = useState(user.nama);
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerEmail, setBuyerEmail] = useState(user.email);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Success Order states
  const [lastCreatedTrx, setLastCreatedTrx] = useState<Transaction | null>(null);

  // Sync cart items with fresh products list in real-time (price, stock, details)
  React.useEffect(() => {
    setCart((prevCart) => {
      let isChanged = false;
      const updatedCart = prevCart.map((item) => {
        const freshProduct = products.find((p) => p.id === item.id);
        if (freshProduct) {
          if (
            item.harga !== freshProduct.harga ||
            item.nama !== freshProduct.nama ||
            item.urlGambar !== freshProduct.urlGambar ||
            item.stok !== freshProduct.stok
          ) {
            isChanged = true;
            // Cap quantity if stock drops below selected quantity
            const newQty = Math.min(item.quantity, freshProduct.stok);
            return {
              ...item,
              ...freshProduct,
              quantity: newQty
            };
          }
        }
        return item;
      }).filter(item => item.quantity > 0); // Remove items if stock is 0 and qty got capped to 0

      return isChanged ? updatedCart : prevCart;
    });
  }, [products]);

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.nama.toLowerCase().includes(search.toLowerCase()) ||
                          (p.deskripsi && p.deskripsi.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = categoryFilter === "Semua" || p.kategori === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(num);
  };

  // Add item to cart
  const addToCart = (product: Product) => {
    if (product.stok <= 0) return;

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stok) {
          alert(`Stok produk terbatas! Anda hanya dapat membeli maksimal ${product.stok} pcs.`);
          return prevCart;
        }
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  // Decrease quantity or remove
  const decreaseQuantity = (productId: string) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === productId);
      if (existing && existing.quantity > 1) {
        return prevCart.map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      return prevCart.filter((item) => item.id !== productId);
    });
  };

  // Increase quantity manually with stock checks
  const increaseQuantity = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === productId);
      if (existing) {
        if (existing.quantity >= product.stok) {
          alert(`Stok produk terbatas! Anda hanya dapat membeli maksimal ${product.stok} pcs.`);
          return prevCart;
        }
        return prevCart.map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return prevCart;
    });
  };

  // Remove completely
  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  // Calculate cart total
  const cartTotal = cart.reduce((sum, item) => sum + item.harga * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Trigger checkout flow
  const handleOpenCheckout = () => {
    if (cart.length === 0) return;
    setBuyerName(user.nama);
    setBuyerEmail(user.email);
    setIsCheckoutOpen(true);
  };

  const handleProcessCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName.trim()) return alert("Nama pembeli wajib diisi.");
    
    setIsSubmitting(true);
    try {
      const trxId = `trx-${Date.now()}`;
      const newTrx: Transaction = {
        id: trxId,
        tanggal: new Date().toISOString(),
        totalHarga: cartTotal,
        itemDibeli: cart.map((item) => ({
          id: item.id,
          nama: item.nama,
          harga: item.harga,
          quantity: item.quantity,
          urlGambar: item.urlGambar,
          kategori: item.kategori,
          ukuran: item.ukuran
        })),
        status: "Menunggu Pembayaran",
        buyerName,
        buyerEmail,
        buyerPhone: buyerPhone || "+628..."
      };

      await onCheckoutComplete(newTrx);
      setLastCreatedTrx(newTrx);
      setCart([]); // Clear cart
      setIsCheckoutOpen(false);
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat memproses checkout.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate WhatsApp Message Link
  const getWhatsAppLink = (trx: Transaction) => {
    const sellerNumber = "628996967565"; // Standardized to international format without + or spaces
    const origin = window.location.origin;
    const notaUrl = `${origin}/nota/${trx.id}`;
    
    const itemsText = trx.itemDibeli
      .map((item) => `- ${item.nama} (Ukuran: ${item.ukuran || "All Size"}) x${item.quantity} : ${formatIDR(item.harga * item.quantity)}`)
      .join("%0A");

    const text = `Halo Sis/Gan Seller B&F Chic Boutique,%0A%0ASaya ingin melakukan konfirmasi checkout pesanan produk.%0A%0A*Detail Pesanan:*%0A${itemsText}%0A%0A*Total Pembayaran:* ${formatIDR(trx.totalHarga)}%0A*Nama Pembeli:* ${trx.buyerName}%0A*Nomor WA:* ${trx.buyerPhone || "-"}%0A%0A*Link Nota Online:* ${notaUrl}%0A%0AMohon konfirmasi rekening pembayarannya ya Sis/Gan, terima kasih! ✨`;
    
    return `https://wa.me/${sellerNumber}?text=${text}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* LEFT: Products Grid Card Filter list */}
      <div className="lg:col-span-2 space-y-4">
        
        {/* Search & Categories Bar */}
        <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-xs flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm placeholder-slate-400"
              placeholder="Cari pakaian anggun & produk kecantikan..."
            />
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setCategoryFilter("Semua")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                categoryFilter === "Semua"
                  ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-rose-50 hover:text-rose-600"
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setCategoryFilter("Pakaian")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                categoryFilter === "Pakaian"
                  ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-rose-50 hover:text-rose-600"
              }`}
            >
              👗 Pakaian
            </button>
            <button
              onClick={() => setCategoryFilter("Kecantikan")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                categoryFilter === "Kecantikan"
                  ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-rose-50 hover:text-rose-600"
              }`}
            >
              💄 Kecantikan
            </button>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredProducts.map((p) => {
            const isOutOfStock = p.stok <= 0;
            const inCartItem = cart.find((item) => item.id === p.id);
            const isMaxedOut = inCartItem ? inCartItem.quantity >= p.stok : false;

            return (
              <div
                key={p.id}
                onClick={() => !isOutOfStock && !isMaxedOut && addToCart(p)}
                className={`bg-white rounded-2xl border border-rose-100 p-3 shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer relative overflow-hidden group ${
                  isOutOfStock ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                {/* Category tag */}
                <div className="absolute top-2 left-2 z-10">
                  <span className={`text-[9px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5 shadow-xs border ${
                    p.kategori === "Pakaian" 
                      ? "bg-rose-50 text-rose-700 border-rose-100" 
                      : "bg-purple-50 text-purple-700 border-purple-100"
                  }`}>
                    {p.kategori}
                  </span>
                </div>

                {/* Stock Tag */}
                <div className="absolute top-2 right-2 z-10">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isOutOfStock 
                      ? "bg-red-500 text-white" 
                      : p.stok <= 5 
                      ? "bg-amber-400 text-slate-900" 
                      : "bg-green-500 text-white"
                  }`}>
                    {isOutOfStock ? "Habis" : `${p.stok} Stok`}
                  </span>
                </div>

                {/* Product Image */}
                <div className="aspect-square w-full rounded-xl overflow-hidden bg-slate-100 mb-2.5 relative">
                  <img
                    src={p.urlGambar}
                    alt={p.nama}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&auto=format&fit=crop&q=80";
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Cart count overlay */}
                  {inCartItem && (
                    <div className="absolute inset-0 bg-rose-600/10 flex items-center justify-center backdrop-blur-3xs">
                      <span className="bg-rose-600 text-white font-serif font-bold text-xs px-3 py-1.5 rounded-full shadow-lg">
                        Terpilih: {inCartItem.quantity}x
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-sm text-slate-800 line-clamp-1">{p.nama}</h4>
                  <p className="text-[10px] text-slate-400 font-mono">Size: {p.ukuran || "All Size"}</p>
                  <p className="text-xs text-slate-500 line-clamp-1">{p.deskripsi || "Simple & Elegant Collection"}</p>
                  
                  <div className="flex items-center justify-between pt-1 mt-1 border-t border-rose-50">
                    <span className="font-serif font-bold text-sm text-rose-600">
                      {formatIDR(p.harga)}
                    </span>
                    <button
                      disabled={isOutOfStock || isMaxedOut}
                      className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-semibold ${
                        isOutOfStock 
                          ? "bg-slate-100 text-slate-400" 
                          : isMaxedOut 
                          ? "bg-rose-50 text-rose-400 border border-rose-200" 
                          : "bg-rose-600 text-white hover:bg-rose-700 shadow-sm shadow-rose-600/10"
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* RIGHT: Shopping Cart List */}
      <div className="bg-white rounded-3xl border border-rose-100 p-4 shadow-sm flex flex-col h-[75vh] max-h-[600px] justify-between sticky top-20">
        <div>
          <div className="flex items-center justify-between border-b border-rose-50 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-rose-600" />
              <h3 className="font-serif text-base font-bold text-slate-800">Keranjang Belanja</h3>
            </div>
            <span className="bg-rose-50 text-rose-600 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {cartCount} item
            </span>
          </div>

          {/* Cart items scroll list */}
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-2">
              <div className="h-12 w-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-400">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <p className="text-xs text-slate-400 font-medium">Keranjang masih kosong.</p>
              <p className="text-[10px] text-slate-400">Klik produk di kiri untuk menambahkan.</p>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[380px] pr-1">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-2.5 p-2 rounded-xl border border-rose-50 hover:bg-rose-50/20 transition-colors">
                  <img
                    src={item.urlGambar}
                    alt={item.nama}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=100&auto=format&fit=crop&q=80";
                    }}
                    className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                  />
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <h4 className="text-xs font-serif font-bold text-slate-800 truncate">{item.nama}</h4>
                      <p className="text-[10px] text-slate-500 font-semibold">{formatIDR(item.harga)}</p>
                    </div>
                    
                    {/* Controls */}
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => decreaseQuantity(item.id)}
                          className="h-5 w-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded flex items-center justify-center cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-semibold text-slate-800 w-5 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => increaseQuantity(item.id)}
                          className="h-5 w-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded flex items-center justify-center cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer calculation */}
        <div className="border-t border-rose-100 pt-3 mt-3 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 font-medium">Subtotal Belanja</span>
            <span className="font-bold text-slate-800">{formatIDR(cartTotal)}</span>
          </div>
          <div className="flex items-center justify-between text-slate-800 font-bold border-t border-rose-50 pt-2 text-base">
            <span className="font-serif">Total Pembayaran</span>
            <span className="font-serif text-rose-600">{formatIDR(cartTotal)}</span>
          </div>

          <button
            id="cart-checkout-btn"
            disabled={cart.length === 0}
            onClick={handleOpenCheckout}
            className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white py-2.5 rounded-xl font-bold text-sm shadow-md shadow-rose-600/15 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* MODAL CHECKOUT DIALOG */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-rose-100 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-rose-50 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-rose-500" />
                <h3 className="font-serif text-lg font-bold text-slate-800">Lengkapi Data Checkout</h3>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProcessCheckout} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Nama Pembeli</label>
                <input
                  type="text"
                  required
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm"
                  placeholder="Contoh: Cantika Putri"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Nomor WhatsApp Aktif</label>
                <input
                  type="tel"
                  required
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm"
                  placeholder="Contoh: 08123456789"
                />
                <span className="text-[10px] text-slate-400">Digunakan untuk mengirim link invoice/nota via WhatsApp penjual</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Email Pembeli</label>
                <input
                  type="email"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm"
                  placeholder="name@example.com"
                />
              </div>

              <div className="bg-rose-50/50 p-3 rounded-2xl border border-rose-100/50 text-xs text-slate-600">
                <span className="font-semibold text-rose-600 block mb-1">Informasi Pemesanan:</span>
                <span>Pesanan Anda akan diteruskan ke penjual melalui WhatsApp. Status tagihan akan berubah menjadi 'Pembayaran Sukses' setelah Anda mengonfirmasi pembayaran di halaman nota online.</span>
              </div>

              <div className="border-t border-rose-50 pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 rounded-xl shadow-md transition-colors"
                >
                  {isSubmitting ? "Memproses..." : "Konfirmasi Checkout 🛒"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL SUCCESS TRANSACTION & WHATSAPP REDIRECT */}
      {lastCreatedTrx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-rose-100 p-6 text-center space-y-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
              <Sparkles className="w-7 h-7" />
            </div>
            
            <h3 className="font-serif text-xl font-bold text-slate-800">Checkout Berhasil! 🎉</h3>
            <p className="text-xs text-slate-500">
              Terima kasih, Kak <span className="font-semibold text-slate-700">{lastCreatedTrx.buyerName}</span>. Pesanan Anda telah tersimpan dengan nomor transaksi:
            </p>
            <p className="font-mono text-sm font-bold text-rose-600 bg-rose-50/50 px-4 py-1.5 rounded-xl inline-block border border-rose-100">
              #{lastCreatedTrx.id}
            </p>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left text-xs space-y-1.5">
              <span className="font-bold text-slate-700 block mb-1">Pratinjau Tagihan:</span>
              <div className="flex justify-between">
                <span>Total Belanja:</span>
                <span className="font-bold">{formatIDR(lastCreatedTrx.totalHarga)}</span>
              </div>
              <div className="flex justify-between">
                <span>Status Pembayaran:</span>
                <span className="text-amber-600 font-bold">{lastCreatedTrx.status}</span>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Silakan klik tombol di bawah untuk **konfirmasi pembayaran ke WhatsApp Penjual** (+628996967565) serta mendapatkan/mengirim link nota online pembayaran Anda.
            </p>

            <div className="flex flex-col gap-2 pt-2">
              <a
                id="whatsapp-confirm-link"
                href={getWhatsAppLink(lastCreatedTrx)}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl text-sm shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <Send className="w-4 h-4" />
                Hubungi WhatsApp Penjual 💬
              </a>
              
              <a
                id="nota-direct-link"
                href={`/nota/${lastCreatedTrx.id}`}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Printer className="w-4 h-4" />
                Lihat Nota Online Pembayaran 📄
              </a>

              <button
                id="close-success-trx-btn"
                onClick={() => setLastCreatedTrx(null)}
                className="text-xs text-slate-400 hover:text-slate-600 pt-1"
              >
                Selesai / Belanja Lagi
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
