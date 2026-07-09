import React, { useState } from "react";
import { 
  TrendingUp, 
  ClipboardList, 
  ShoppingBag, 
  DollarSign, 
  Sparkles, 
  Calendar, 
  FileText, 
  BarChart3, 
  Filter, 
  Search, 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  Printer,
  ChevronRight,
  RefreshCw,
  ShoppingBag as BagIcon,
  Tag
} from "lucide-react";
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
  
  const [activeTab, setActiveTab] = useState<"ringkasan" | "grafik" | "laporan">("ringkasan");
  
  // Laporan Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Tooltip state for interactive charts
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; label: string; value: number } | null>(null);

  // Calculate high-level metrics (Pembayaran Sukses only)
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

  // --- ANALYTICS CALCULATIONS ---
  
  // 1. Daily Sales for line chart (Last 7 Days)
  const getDailySalesData = () => {
    const dailyData: { dateStr: string; rawDate: Date; total: number; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
      dailyData.push({
        dateStr: dateString,
        rawDate: d,
        total: 0,
        count: 0
      });
    }

    transactions.forEach(t => {
      if (t.status === "Pembayaran Sukses") {
        const tDate = new Date(t.tanggal);
        dailyData.forEach(day => {
          if (
            tDate.getDate() === day.rawDate.getDate() &&
            tDate.getMonth() === day.rawDate.getMonth() &&
            tDate.getFullYear() === day.rawDate.getFullYear()
          ) {
            day.total += t.totalHarga;
            day.count += 1;
          }
        });
      }
    });

    return dailyData;
  };

  const dailySales = getDailySalesData();
  const maxSales = Math.max(...dailySales.map(d => d.total), 100000);

  // 2. Top-Selling Products
  const getTopSellingProducts = () => {
    const productSalesMap: { [id: string]: { name: string; quantity: number; revenue: number; category: string } } = {};
    
    transactions.forEach(t => {
      if (t.status === "Pembayaran Sukses" && t.itemDibeli) {
        t.itemDibeli.forEach(item => {
          if (productSalesMap[item.id]) {
            productSalesMap[item.id].quantity += item.quantity;
            productSalesMap[item.id].revenue += item.harga * item.quantity;
          } else {
            productSalesMap[item.id] = {
              name: item.nama,
              quantity: item.quantity,
              revenue: item.harga * item.quantity,
              category: item.kategori || "Pakaian"
            };
          }
        });
      }
    });

    return Object.values(productSalesMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  };

  const topProducts = getTopSellingProducts();

  // 3. Category Sales Summary
  const getCategorySales = () => {
    let pakaianTotal = 0;
    let kecantikanTotal = 0;

    transactions.forEach(t => {
      if (t.status === "Pembayaran Sukses" && t.itemDibeli) {
        t.itemDibeli.forEach(item => {
          const cat = item.kategori || "Pakaian";
          if (cat === "Pakaian") {
            pakaianTotal += item.harga * item.quantity;
          } else if (cat === "Kecantikan") {
            kecantikanTotal += item.harga * item.quantity;
          }
        });
      }
    });

    const total = pakaianTotal + kecantikanTotal || 1;
    return {
      pakaian: { amount: pakaianTotal, percent: Math.round((pakaianTotal / total) * 100) },
      kecantikan: { amount: kecantikanTotal, percent: Math.round((kecantikanTotal / total) * 100) }
    };
  };

  const categorySales = getCategorySales();

  // --- FILTERED TRANSACTIONS FOR LEDGER ---
  const filteredTransactions = transactions.filter(t => {
    // 1. Search filter
    const matchesSearch = 
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.buyerEmail && t.buyerEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.buyerPhone && t.buyerPhone.includes(searchQuery));

    // 2. Status filter
    const matchesStatus = statusFilter === "Semua" || t.status === statusFilter;

    // 3. Date filter
    let matchesDate = true;
    if (startDate) {
      const sDate = new Date(startDate);
      sDate.setHours(0, 0, 0, 0);
      const txDate = new Date(t.tanggal);
      if (txDate < sDate) matchesDate = false;
    }
    if (endDate) {
      const eDate = new Date(endDate);
      eDate.setHours(23, 59, 59, 999);
      const txDate = new Date(t.tanggal);
      if (txDate > eDate) matchesDate = false;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Calculate totals for currently filtered transactions
  const filteredTotalRevenue = filteredTransactions
    .filter(t => t.status === "Pembayaran Sukses")
    .reduce((sum, t) => sum + t.totalHarga, 0);

  const filteredPendingRevenue = filteredTransactions
    .filter(t => t.status === "Menunggu Pembayaran")
    .reduce((sum, t) => sum + t.totalHarga, 0);

  // Action: Print report using custom print stylesheet
  const handlePrintReport = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const tableRows = filteredTransactions.map((t, idx) => `
      <tr style="border-bottom: 1px solid #e2e8f0; font-size: 12px;">
        <td style="padding: 8px; font-family: monospace;">#${t.id.substring(4, 10)}</td>
        <td style="padding: 8px;">${new Date(t.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</td>
        <td style="padding: 8px; font-weight: bold;">${t.buyerName}</td>
        <td style="padding: 8px;">${t.itemDibeli ? t.itemDibeli.map(i => `${i.nama} (x${i.quantity})`).join(", ") : ""}</td>
        <td style="padding: 8px; font-weight: bold;">Rp ${t.totalHarga.toLocaleString("id-ID")}</td>
        <td style="padding: 8px;">
          <span style="padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: bold; background-color: ${t.status === "Pembayaran Sukses" ? "#d1fae5; color: #065f46;" : "#fef3c7; color: #92400e;"}">
            ${t.status}
          </span>
        </td>
      </tr>
    `).join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Laporan Penjualan B&F Chic Boutique</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 20px; color: #1e293b; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #f43f5e; padding-bottom: 15px; }
            .header h1 { font-size: 24px; margin: 0; color: #e11d48; }
            .header p { font-size: 12px; color: #64748b; margin: 5px 0 0 0; }
            .summary { display: flex; justify-content: space-between; margin-bottom: 25px; background-color: #fff1f2; padding: 15px; border-radius: 8px; }
            .summary-item { text-align: center; flex: 1; }
            .summary-item .title { font-size: 10px; text-transform: uppercase; color: #e11d48; font-weight: bold; }
            .summary-item .val { font-size: 18px; font-weight: bold; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background-color: #f1f5f9; padding: 10px; font-size: 12px; text-align: left; border-bottom: 2px solid #cbd5e1; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>LAPORAN ANALISIS PENJUALAN</h1>
            <p>B&F Chic Boutique & Beauty - Tanggal Cetak: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
          </div>
          <div class="summary">
            <div class="summary-item">
              <div class="title">Total Transaksi</div>
              <div class="val">${filteredTransactions.length}</div>
            </div>
            <div class="summary-item">
              <div class="title">Omset Lunas (Sukses)</div>
              <div class="val">Rp ${filteredTotalRevenue.toLocaleString("id-ID")}</div>
            </div>
            <div class="summary-item">
              <div class="title">Belum Lunas (Pending)</div>
              <div class="val">Rp ${filteredPendingRevenue.toLocaleString("id-ID")}</div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>ID Invoice</th>
                <th>Tanggal</th>
                <th>Pelanggan</th>
                <th>Daftar Belanja</th>
                <th>Total Harga</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <div style="margin-top: 40px; text-align: right; font-size: 12px;">
            <p>Disetujui Oleh,</p>
            <br/><br/><br/>
            <p><strong>Meytha Daning</strong><br/>Owner B&F Chic Boutique</p>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      
      {/* Dashboard Top Tabs Navigation */}
      <div className="flex border-b border-rose-100 bg-white/60 backdrop-blur-md p-1.5 rounded-2xl gap-1">
        <button
          onClick={() => setActiveTab("ringkasan")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "ringkasan"
              ? "bg-rose-500 text-white shadow-md shadow-rose-200"
              : "text-slate-500 hover:bg-rose-50 hover:text-rose-600"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Ringkasan Toko
        </button>
        <button
          onClick={() => setActiveTab("grafik")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "grafik"
              ? "bg-rose-500 text-white shadow-md shadow-rose-200"
              : "text-slate-500 hover:bg-rose-50 hover:text-rose-600"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Grafik Analisis Penjualan
        </button>
        <button
          onClick={() => setActiveTab("laporan")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "laporan"
              ? "bg-rose-500 text-white shadow-md shadow-rose-200"
              : "text-slate-500 hover:bg-rose-50 hover:text-rose-600"
          }`}
        >
          <FileText className="w-4 h-4" />
          Laporan Pembukuan Penjualan
        </button>
      </div>

      {/* VIEW 1: RINGKASAN TOKO (OVERVIEW) */}
      {activeTab === "ringkasan" && (
        <div className="space-y-6 animate-fadeIn">
          
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
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Pendapatan (Lunas)</p>
                <h3 className="font-serif text-lg font-bold text-slate-800">{formatIDR(totalRevenue)}</h3>
                <p className="text-[10px] text-orange-500 font-semibold mt-1">
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
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Transaksi Lunas</p>
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
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Katalog Boutique</p>
                <h3 className="font-serif text-lg font-bold text-slate-800">{products.length} Produk</h3>
                <p className="text-[10px] text-rose-500 font-semibold mt-1">
                  {clothesCount} Pakaian • {beautyCount} Kecantikan
                </p>
              </div>
              <div className="h-11 w-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>

          </div>

          {/* Quick Analytics Breakdown Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Recent Transactions List */}
            <div className="bg-white rounded-3xl border border-rose-100 p-6 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-base font-bold text-slate-800">Transaksi Terbaru</h3>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-emerald-100 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  SINKRON CLOUD (VERCEL)
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
                        <tr key={tx.id} className="text-slate-700 hover:bg-rose-50/20 transition-colors">
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

            {/* Quick Summary Right Panel */}
            <div className="bg-white rounded-3xl border border-rose-100 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-serif text-base font-bold text-slate-800 mb-4">Informasi Bisnis</h3>
                
                <div className="space-y-4">
                  {/* Category share summary */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Pakaian Wanita (S - Bigsize)</span>
                      <span>{categorySales.pakaian.percent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div 
                        className="bg-rose-500 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${categorySales.pakaian.percent}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">{formatIDR(categorySales.pakaian.amount)} Lunas</span>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Kecantikan & Kosmetik</span>
                      <span>{categorySales.kecantikan.percent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${categorySales.kecantikan.percent}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">{formatIDR(categorySales.kecantikan.amount)} Lunas</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-rose-50 pt-4 text-xs text-slate-500">
                <span className="font-semibold text-rose-600 block mb-1">Status Vercel Deployment:</span>
                <span>Data catalog & transaksi otomatis terhubung ke KVDB Cloud secara sinkron & real-time di serverless Vercel!</span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* VIEW 2: GRAFIK ANALISIS PENJUALAN */}
      {activeTab === "grafik" && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Main Visual Sales Chart */}
          <div className="bg-white rounded-3xl border border-rose-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-serif text-base font-bold text-slate-800">Tren Pendapatan Harian</h3>
                <p className="text-[10px] text-slate-400">Analisis penjualan sukses 7 hari terakhir</p>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-rose-500 bg-rose-50 font-bold px-2.5 py-1 rounded-full border border-rose-100">
                <TrendingUp className="w-3.5 h-3.5" />
                Dihitung Otomatis
              </div>
            </div>

            {/* Line Chart Draw Area */}
            <div className="relative w-full h-64 flex flex-col justify-end">
              
              {/* Tooltip Hover Overlay */}
              {hoveredPoint && (
                <div 
                  className="absolute bg-slate-800 text-white p-2.5 rounded-xl text-xs shadow-xl border border-slate-700 z-10 pointer-events-none transition-all duration-150"
                  style={{ 
                    left: `${hoveredPoint.x + 10}px`, 
                    top: `${hoveredPoint.y - 60}px` 
                  }}
                >
                  <p className="font-bold text-[10px] text-rose-300 uppercase tracking-wider">{hoveredPoint.label}</p>
                  <p className="font-semibold text-white mt-0.5">{formatIDR(hoveredPoint.value)}</p>
                </div>
              )}

              {/* The SVG Chart */}
              <div className="w-full h-48 bg-slate-50/50 rounded-2xl border border-slate-100 p-2 overflow-hidden relative">
                <svg viewBox="0 0 500 180" width="100%" height="100%" className="overflow-visible">
                  {/* Grid Lines */}
                  <line x1="40" y1="20" x2="460" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="40" y1="65" x2="460" y2="65" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="40" y1="110" x2="460" y2="110" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="40" y1="155" x2="460" y2="155" stroke="#cbd5e1" strokeWidth="1.5" />

                  {/* SVG Coordinates Calculation */}
                  {(() => {
                    const chartWidth = 500;
                    const chartHeight = 180;
                    const paddingX = 40;
                    const paddingY = 25;
                    
                    const points = dailySales.map((day, idx) => {
                      const x = paddingX + (idx * (chartWidth - paddingX * 2)) / 6;
                      const y = chartHeight - paddingY - (day.total / maxSales) * (chartHeight - paddingY * 2);
                      return { x, y, day };
                    });

                    const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
                    const areaPath = `${linePath} L ${points[points.length - 1].x} 155 L ${points[0].x} 155 Z`;

                    return (
                      <>
                        {/* Area Fill */}
                        <path d={areaPath} fill="url(#roseGradient)" opacity="0.15" />
                        
                        {/* Line Path */}
                        <path d={linePath} fill="none" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                        {/* Interactive Circles / Hover targets */}
                        {points.map((p, i) => (
                          <g key={i} className="cursor-pointer group">
                            {/* Hover Radius expanded */}
                            <circle 
                              cx={p.x} 
                              cy={p.y} 
                              r="15" 
                              fill="transparent" 
                              onMouseEnter={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const container = e.currentTarget.ownerDocument.documentElement;
                                setHoveredPoint({
                                  x: p.x * (rect.width / 15), 
                                  y: p.y,
                                  label: p.day.dateStr,
                                  value: p.day.total
                                });
                              }}
                              onMouseLeave={() => setHoveredPoint(null)}
                            />
                            {/* Small visible glowing dot */}
                            <circle 
                              cx={p.x} 
                              cy={p.y} 
                              r={p.day.total > 0 ? "5" : "3.5"} 
                              fill={p.day.total > 0 ? "#f43f5e" : "#cbd5e1"} 
                              stroke="#ffffff" 
                              strokeWidth="1.5" 
                              className="transition-all duration-150 group-hover:scale-150"
                            />
                          </g>
                        ))}

                        {/* X-axis Labels */}
                        {points.map((p, i) => (
                          <text 
                            key={i} 
                            x={p.x} 
                            y="172" 
                            textAnchor="middle" 
                            fontSize="8" 
                            fill="#64748b" 
                            className="font-medium"
                          >
                            {p.day.dateStr}
                          </text>
                        ))}

                        {/* Y-axis helper values */}
                        <text x="35" y="23" textAnchor="end" fontSize="7" fill="#94a3b8" className="font-mono">
                          {formatIDR(maxSales)}
                        </text>
                        <text x="35" y="88" textAnchor="end" fontSize="7" fill="#94a3b8" className="font-mono">
                          {formatIDR(maxSales / 2)}
                        </text>
                        <text x="35" y="158" textAnchor="end" fontSize="7" fill="#94a3b8" className="font-mono">
                          Rp 0
                        </text>

                        {/* Gradient definition */}
                        <defs>
                          <linearGradient id="roseGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f43f5e" />
                            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                      </>
                    );
                  })()}
                </svg>
              </div>

              {/* Summary Indicator line */}
              <div className="flex justify-between items-center mt-3 text-[10px] text-slate-400 font-mono px-2">
                <span>← 7 Hari Lalu</span>
                <span className="text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-md">Omset Tertinggi: {formatIDR(maxSales)}</span>
                <span>Hari Ini →</span>
              </div>
            </div>
          </div>

          {/* Top Selling Products & Category Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Top 5 Products Bar Chart List */}
            <div className="bg-white rounded-3xl border border-rose-100 p-6 shadow-sm">
              <h3 className="font-serif text-base font-bold text-slate-800 mb-1">Katalog Paling Laris (Top-5)</h3>
              <p className="text-[10px] text-slate-400 mb-4">Produk dengan kuantitas penjualan tertinggi</p>

              {topProducts.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  Belum ada produk yang terjual.
                </div>
              ) : (
                <div className="space-y-4">
                  {topProducts.map((p, idx) => {
                    const maxQty = topProducts[0].quantity || 1;
                    const fillPercent = Math.round((p.quantity / maxQty) * 100);

                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-2">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                              idx === 0 ? "bg-amber-100 text-amber-800" :
                              idx === 1 ? "bg-slate-100 text-slate-700" :
                              "bg-rose-50 text-rose-700"
                            }`}>
                              {idx + 1}
                            </span>
                            <span className="font-semibold text-slate-800">{p.name}</span>
                          </div>
                          <span className="font-bold text-rose-600">{p.quantity} Pcs</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                              p.category === "Pakaian" ? "bg-rose-500" : "bg-purple-500"
                            }`}
                            style={{ width: `${fillPercent}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Kategori: {p.category}</span>
                          <span>Omset: {formatIDR(p.revenue)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Performance Indicators & Advice Card */}
            <div className="bg-gradient-to-br from-rose-50/50 to-purple-50/50 rounded-3xl border border-rose-100 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-serif text-base font-bold text-slate-800 mb-1">Rekomendasi Bisnis & Performa</h3>
                <p className="text-[10px] text-slate-400 mb-4">Rangkuman algoritma analitik pakaian & kosmetik</p>

                <div className="space-y-4">
                  
                  {/* Performance point 1 */}
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                      <BagIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Performa Stok Produk</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                        Kategori <span className="font-bold text-rose-600">Pakaian Wanita</span> menyumbang {categorySales.pakaian.percent}% dari total transaksi sukses. Pastikan variasi ukuran S hingga Bigsize selalu restock menjelang akhir pekan.
                      </p>
                    </div>
                  </div>

                  {/* Performance point 2 */}
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                      <Tag className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Kecantikan & Kosmetik Glow</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                        Kontribusi penjualan kosmetik sebesar {categorySales.kecantikan.percent}%. Promosikan lip velvet dan serum mawar sebagai paket bundel hadiah untuk meningkatkan nilai transaksi rata-rata belanja.
                      </p>
                    </div>
                  </div>

                  {/* Performance point 3 */}
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Efisiensi Transaksi WhatsApp</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                        Sebanyak <span className="font-bold text-green-600">{totalSalesCount}</span> tagihan lunas diarsipkan. Pastikan admin segera merubah status transaksi dari 'Menunggu Pembayaran' menjadi 'Pembayaran Sukses' saat dana masuk ke rekening bank Anda.
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              <div className="mt-6 border-t border-rose-100 pt-4 flex gap-2 justify-between items-center">
                <div className="text-[10px] text-slate-400">Rekomendasi diupdate secara real-time</div>
                <button 
                  onClick={onNavigateToKasir}
                  className="bg-slate-800 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-slate-700 transition-colors"
                >
                  Kasir POS
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* VIEW 3: LAPORAN PENJUALAN DETAIL (PEMBUKUAN) */}
      {activeTab === "laporan" && (
        <div className="bg-white rounded-3xl border border-rose-100 shadow-sm overflow-hidden animate-fadeIn">
          
          {/* Filter Header Panel */}
          <div className="p-6 border-b border-rose-50 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h3 className="font-serif text-base font-bold text-slate-800">Laporan Pembukuan Penjualan</h3>
                <p className="text-[10px] text-slate-400">Unduh atau cetak laporan keuangan dan tagihan toko secara aman</p>
              </div>
              <button
                onClick={handlePrintReport}
                className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2 shadow-md shadow-rose-200 transition-all self-start"
              >
                <Printer className="w-4 h-4" />
                Cetak Laporan / PDF 🖨️
              </button>
            </div>

            {/* Grid of Search, Date, and Status Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
              
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari ID/Pelanggan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-10 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-400 font-medium text-slate-700"
                />
              </div>

              {/* Status Selector */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-400 font-medium text-slate-700 appearance-none bg-white"
                >
                  <option value="Semua">Semua Status</option>
                  <option value="Pembayaran Sukses">Pembayaran Sukses (Lunas)</option>
                  <option value="Menunggu Pembayaran">Menunggu Pembayaran (Pending)</option>
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>

              {/* Start Date */}
              <div className="flex items-center border border-slate-200 rounded-xl px-2 bg-white">
                <Calendar className="w-3.5 h-3.5 text-slate-400 mr-2" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-[10px] focus:outline-none font-medium text-slate-600 border-none bg-transparent"
                  placeholder="Mulai"
                />
              </div>

              {/* End Date */}
              <div className="flex items-center border border-slate-200 rounded-xl px-2 bg-white">
                <Calendar className="w-3.5 h-3.5 text-slate-400 mr-2" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full text-[10px] focus:outline-none font-medium text-slate-600 border-none bg-transparent"
                  placeholder="Selesai"
                />
              </div>

            </div>
          </div>

          {/* Quick Ledger Metrics */}
          <div className="bg-rose-50/30 px-6 py-4 border-b border-rose-50 flex flex-wrap justify-between gap-4 text-xs font-semibold text-slate-700">
            <div>
              Transaksi Sesuai Filter: <span className="font-bold text-rose-600">{filteredTransactions.length}</span>
            </div>
            <div className="flex gap-4">
              <div>
                Omset Filtered: <span className="font-bold text-green-600">{formatIDR(filteredTotalRevenue)}</span>
              </div>
              <div>
                Pending Filtered: <span className="font-bold text-amber-600">{formatIDR(filteredPendingRevenue)}</span>
              </div>
            </div>
          </div>

          {/* Ledger Table */}
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-sm font-medium space-y-2">
              <ClipboardList className="w-12 h-12 text-rose-200 mx-auto" />
              <p>Tidak ditemukan transaksi pencatatan dengan filter ini.</p>
              <button 
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("Semua");
                  setStartDate("");
                  setEndDate("");
                }}
                className="text-xs text-rose-500 font-bold hover:underline"
              >
                Reset Semua Filter
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-wider font-bold border-b border-rose-50">
                    <th className="px-6 py-3.5">Invoice ID</th>
                    <th className="px-6 py-3.5">Waktu / Tanggal</th>
                    <th className="px-6 py-3.5">Nama Pelanggan</th>
                    <th className="px-6 py-3.5">Produk Belanja</th>
                    <th className="px-6 py-3.5">Nominal Belanja</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Nota Cetak</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="text-slate-700 hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-rose-600 font-bold">
                        #{tx.id.substring(4, 10)}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {new Date(tx.tanggal).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{tx.buyerName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{tx.buyerEmail || tx.buyerPhone || "Pelanggan PoS"}</div>
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate text-xs text-slate-600">
                        {tx.itemDibeli ? tx.itemDibeli.map(item => `${item.nama} (x${item.quantity})`).join(", ") : ""}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800">
                        {formatIDR(tx.totalHarga)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold gap-1 ${
                          tx.status === "Pembayaran Sukses"
                            ? "bg-green-50 text-green-700 border border-green-100"
                            : "bg-amber-50 text-amber-700 border border-amber-100"
                        }`}>
                          {tx.status === "Pembayaran Sukses" ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <a
                          href={`/nota/${tx.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600 font-bold hover:underline"
                        >
                          Buka Nota 
                          <ArrowRight className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
