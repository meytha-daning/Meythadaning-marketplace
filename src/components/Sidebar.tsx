import React from "react";
import { 
  TrendingUp, 
  ShoppingBag, 
  ClipboardList, 
  Store, 
  X, 
  Sparkles,
  LogOut,
  Home
} from "lucide-react";
import { User } from "../types";

interface SidebarProps {
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onLogout: () => void;
}

export default function Sidebar({ 
  user, 
  activeTab, 
  setActiveTab, 
  isOpen, 
  setIsOpen,
  onLogout
}: SidebarProps) {
  const isAdmin = user.role === "admin";

  const menuItems = isAdmin 
    ? [
        { id: "dashboard", label: "Dashboard", icon: TrendingUp },
        { id: "products", label: "Kelola Produk", icon: ShoppingBag },
        { id: "kasir", label: "Kasir / PoS", icon: Store },
        { id: "transactions", label: "Riwayat Transaksi", icon: ClipboardList },
      ]
    : [
        { id: "catalog", label: "Katalog Belanja", icon: Store },
        { id: "my-history", label: "Riwayat Pembelian", icon: ClipboardList },
      ];

  return (
    <>
      {/* Backdrop for Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white border-r border-rose-100 px-5 py-6 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header/Logo */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 text-rose-600">
            <Sparkles className="w-6 h-6 text-rose-500 animate-pulse" />
            <span className="font-serif text-xl font-bold tracking-wider text-slate-800">B&F CHIC</span>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info Card */}
        <div className="mb-6 p-4 rounded-2xl bg-rose-50/70 border border-rose-100/50">
          <p className="text-xs text-rose-500 font-semibold uppercase tracking-wider mb-1">
            {isAdmin ? "Administrator 👩‍💼" : "Pelanggan Cantik ✨"}
          </p>
          <p className="font-serif text-slate-800 font-bold truncate">{user.nama}</p>
          <p className="text-xs text-slate-500 truncate">{user.email}</p>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`menu-item-${item.id}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? "bg-rose-600 text-white shadow-md shadow-rose-600/10" 
                    : "text-slate-600 hover:bg-rose-50/50 hover:text-rose-700"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-500 hover:text-rose-600"}`} />
                {item.label}
              </button>
            );
          })}

          {/* Quick toggle to buyer store view for Admin */}
          {isAdmin && (
            <button
              id="menu-item-store-toggle"
              onClick={() => {
                setActiveTab("catalog");
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === "catalog"
                  ? "bg-rose-600 text-white shadow-md shadow-rose-600/10"
                  : "text-rose-600 bg-rose-50 hover:bg-rose-100"
              }`}
            >
              <Home className="w-5 h-5" />
              Lihat Toko (Katalog)
            </button>
          )}
        </nav>

        {/* Footer Actions */}
        <div className="border-t border-rose-50 pt-4 mt-auto">
          <button
            id="sidebar-logout-btn"
            onClick={onLogout}
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-5 h-5 text-red-500" />
            Keluar (Logout)
          </button>
        </div>
      </aside>
    </>
  );
}
