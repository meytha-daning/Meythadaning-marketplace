import React from "react";
import { Menu, ShoppingCart, User as UserIcon, Settings, LogOut, ArrowLeft } from "lucide-react";
import { User } from "../types";

interface HeaderProps {
  user: User;
  onMenuToggle: () => void;
  cartCount: number;
  onCartToggle?: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export default function Header({
  user,
  onMenuToggle,
  cartCount,
  onCartToggle,
  activeTab,
  setActiveTab,
  onLogout
}: HeaderProps) {
  const isAdmin = user.role === "admin";
  const isInCatalog = activeTab === "catalog" || activeTab === "my-history";

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-rose-100 bg-white px-4 shadow-xs sm:px-6">
      {/* Left side: Menu toggle & Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden focus:outline-none"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="hidden sm:flex flex-col">
          <h1 className="font-serif text-lg font-bold tracking-wider text-slate-800">
            B&F CHIC BOUTIQUE
          </h1>
          <p className="text-[10px] uppercase font-sans tracking-widest text-rose-500 font-semibold leading-none">
            Simply Elegant & Beauty
          </p>
        </div>
      </div>

      {/* Right side: Cart, Admin Panel link, User welcome, Logout */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* User name next to icons */}
        <div className="flex items-center gap-2 text-slate-700 bg-rose-50/50 px-3 py-1.5 rounded-full border border-rose-100/30">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-500 text-white font-serif font-bold text-xs">
            {user.nama.charAt(0)}
          </div>
          <span className="hidden md:inline text-xs font-medium text-slate-800">
            Hai, {user.nama}
          </span>
        </div>

        {/* Admin Panel button (only shown if email is meythadaning05@gmail.com and we are on the Catalog page) */}
        {isAdmin && isInCatalog && (
          <button
            id="header-admin-panel-btn"
            onClick={() => setActiveTab("dashboard")}
            className="flex items-center gap-1.5 rounded-full bg-slate-950 text-white text-xs font-semibold px-4 py-2 hover:bg-rose-600 transition-all shadow-md cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Admin Panel</span>
          </button>
        )}

        {/* Back to Store button (shown if in Admin views) */}
        {isAdmin && !isInCatalog && (
          <button
            id="header-back-to-store-btn"
            onClick={() => setActiveTab("catalog")}
            className="flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold px-4 py-2 hover:bg-rose-100 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Beranda Toko</span>
          </button>
        )}

        {/* Cart Icon (only relevant or functional when browsing catalog) */}
        {isInCatalog && onCartToggle && (
          <button
            id="header-cart-toggle-btn"
            onClick={onCartToggle}
            className="relative rounded-full p-2 text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors focus:outline-none cursor-pointer"
          >
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span id="cart-count-badge" className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs border border-white">
                {cartCount}
              </span>
            )}
          </button>
        )}

        {/* Quick Logout for Mobile / Desktop */}
        <button
          id="header-logout-btn"
          onClick={onLogout}
          title="Logout"
          className="rounded-full p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors focus:outline-none cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
