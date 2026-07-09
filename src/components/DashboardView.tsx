import React from "react";
import { TrendingUp, ClipboardList, ShoppingBag, DollarSign, Sparkles } from "lucide-react";
import { Product, Transaction } from "../types";

interface DashboardViewProps {
  products: Product[];
  transactions: Transaction[];
  onNavigateToProducts: () => void;
  onNavigateToKasir: () => void;
}

export default function DashboardView({
  products,
  transactions,
  onNavigateToProducts,
  onNavigateToKasir
}: DashboardViewProps) {
  
  // Calculate analytics
  const totalRevenue = transactions
    .filter(t => t.status === "Pembayaran Sukses")
    .reduce((sum, t) => sum + t.totalHarga, 0);

  const pendingRevenue = transactions
    .filter(t => t.status === "Menunggu Pembayaran")
    .reduce((sum, t) => sum + t.totalHarga, 0);

  const totalSalesCount = transactions.filter(t => t.status === "Pembayaran Sukses").length;
  const totalTransactionsCount = transactions.length;
  const activeProductsCount = products.filter(p => p.stok > 0).length;

  const clothesCount = products.filter(p => p.kategori === "Pakaian").length;
  const beautyCount = products.filter(p => p.kategori === "Kecantikan").length;

  // Format IDR Currency
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(num);
  };

  // Recent transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-rose-500 to-rose-600 p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 bottom-0 top-0 opacity-10 flex items-center pr-8 pointer-events-none">
          <Sparkles className="w-48 h-48 animate-pulse text-white" />
        </div>
        <div className="relative z-10 max-w-lg">
          <h2 className="font-serif text-2xl font-bold mb-1">Selamat Datang di Admin Panel B&F Chic Boutique ✨</h2>
          <p className="text-xs text-rose-100 leading-relaxed mb-4">
            Kelola stok pakaian elegan (S - Bigsize) dan produk kecantikan Anda secara real-time. Pantau penjualan harian dan kelola tagihan pembayaran pembeli dengan mudah.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onNavigateToKasir}
              className="bg-white text-rose-600 text-xs font-bold px-4 py-2 rounded-xl shadow-md hover:bg-rose-50 transition-colors"
            >
              Buka Kasir PoS 🛒
            </button>
            <button
              onClick={onNavigateToProducts}
              className="bg-rose-700/40 text-white border border-rose-400 text-xs font-bold px-4 py-2 rounded-xl hover:bg-rose-700/60 transition-colors"
            >
              Kelola Produk 👗
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Card 1: Total Revenue */}
        <div className="rounded-2xl bg-white p-5 border border-rose-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Pendapatan</p>
            <h3 className="font-serif text-lg font-bold text-slate-800">{formatIDR(totalRevenue)}</h3>
            <p className="text-[10px] text-orange-500 font-medium mt-1">
              Menunggu: {formatIDR(pendingRevenue)}
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Total Sukses Transaksi */}
        <div className="rounded-2xl bg-white p-5 border border-rose-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Transaksi Sukses</p>
            <h3 className="font-serif text-lg font-bold text-slate-800">{totalSalesCount} Penjualan</h3>
            <p className="text-[10px] text-slate-400 mt-1">
              Dari {totalTransactionsCount} total checkout
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ClipboardList className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Produk Aktif */}
        <div className="rounded-2xl bg-white p-5 border border-rose-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Produk Aktif</p>
            <h3 className="font-serif text-lg font-bold text-slate-800">{activeProductsCount} Items</h3>
            <p className="text-[10px] text-slate-400 mt-1">
              Stok &gt; 0 saat ini
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Kategori Produk */}
        <div className="rounded-2xl bg-white p-5 border border-rose-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Kategori Produk</p>
            <h3 className="font-serif text-lg font-bold text-slate-800">{products.length} Katalog</h3>
            <p className="text-[10px] text-rose-500 font-semibold mt-1">
              {clothesCount} Pakaian • {beautyCount} Kecantikan
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Analytics Breakdown Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Transactions List */}
        <div className="bg-white rounded-3xl border border-rose-100 p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-base font-bold text-slate-800">Transaksi Terbaru</h3>
            <span className="text-xs bg-rose-50 text-rose-600 font-semibold px-2.5 py-1 rounded-full">
              Real-time Sync
            </span>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              Belum ada transaksi pembelian tercatat.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-rose-50 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="pb-2">Invoice ID</th>
                    <th className="pb-2">Tanggal</th>
                    <th className="pb-2">Pelanggan</th>
                    <th className="pb-2">Total</th>
                    <th className="pb-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-50/50">
                  {recentTransactions.map((tx) => (
                    <tr key={tx.id} className="text-slate-700">
                      <td className="py-2.5 font-mono text-xs text-rose-600 font-semibold">
                        #{tx.id.substring(4, 10)}
                      </td>
                      <td className="py-2.5 text-xs text-slate-500">
                        {new Date(tx.tanggal).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </td>
                      <td className="py-2.5 font-medium">{tx.buyerName}</td>
                      <td className="py-2.5 font-semibold text-slate-800">{formatIDR(tx.totalHarga)}</td>
                      <td className="py-2.5 text-right">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          tx.status === "Pembayaran Sukses"
                            ? "bg-green-50 text-green-700 border border-green-100"
                            : "bg-amber-50 text-amber-700 border border-amber-100"
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Category Share & Boutique Info */}
        <div className="bg-white rounded-3xl border border-rose-100 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-serif text-base font-bold text-slate-800 mb-4">Proporsi Katalog</h3>
            
            <div className="space-y-4">
              {/* Clothing bar */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Pakaian Wanita (S - Bigsize)</span>
                  <span>{clothesCount} Produk</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div 
                    className="bg-rose-500 h-2 rounded-full" 
                    style={{ width: `${products.length > 0 ? (clothesCount / products.length) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Beauty bar */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Produk Kecantikan Wanita</span>
                  <span>{beautyCount} Produk</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full" 
                    style={{ width: `${products.length > 0 ? (beautyCount / products.length) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-rose-50 pt-4 text-xs text-slate-500">
            <span className="font-semibold text-rose-600 block mb-1">Pemberitahuan Sistem:</span>
            <span>Semua harga, stok, dan deskripsi produk terhubung langsung secara real-time ke semua pelanggan di perangkat apa pun.</span>
          </div>
        </div>

      </div>

    </div>
  );
}
