import React, { useState } from "react";
import { Search, ClipboardList, Eye, Trash2, Printer, ExternalLink, Sparkles, Filter, AlertCircle } from "lucide-react";
import { Transaction } from "../types";

interface HistoryViewProps {
  transactions: Transaction[];
  onDeleteTransactionClick?: (id: string) => Promise<void>;
}

export default function HistoryView({ transactions, onDeleteTransactionClick }: HistoryViewProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Filter transactions
  const filteredTxs = transactions.filter((tx) => {
    const matchesSearch = tx.id.toLowerCase().includes(search.toLowerCase()) ||
                          tx.buyerName.toLowerCase().includes(search.toLowerCase()) ||
                          (tx.buyerPhone && tx.buyerPhone.includes(search.toLowerCase()));
    
    const matchesStatus = statusFilter === "Semua" || tx.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(num);
  };

  const handlePrint = (tx: Transaction) => {
    const printWindow = window.open(`/nota/${tx.id}`, "_blank");
    if (printWindow) {
      printWindow.focus();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="font-serif text-2xl font-bold text-slate-800 flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-rose-500" />
          Riwayat Transaksi & Invoice
        </h2>
        <p className="text-xs text-slate-500">
          Pantau riwayat checkout, status pembayaran (Sukses/Menunggu), dan cetak nota online untuk pelanggan
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 bg-white p-4 rounded-2xl border border-rose-100 shadow-xs">
        
        {/* Search */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm placeholder-slate-400"
            placeholder="Cari transaksi berdasarkan ID, nama pembeli, nomor WA..."
          />
        </div>

        {/* Status Selection */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm bg-white text-slate-700"
          >
            <option value="Semua">Semua Status</option>
            <option value="Menunggu Pembayaran">Menunggu Pembayaran</option>
            <option value="Pembayaran Sukses">Pembayaran Sukses</option>
          </select>
        </div>

        {/* Counter */}
        <div className="flex items-center justify-center bg-rose-50 text-rose-700 text-xs font-semibold px-3 py-2 rounded-xl border border-rose-100">
          <span>{filteredTxs.length} Transaksi</span>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-3xl border border-rose-100 shadow-sm overflow-hidden">
        {filteredTxs.length === 0 ? (
          <div className="text-center py-12 px-4">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="font-serif text-base font-bold text-slate-700 mb-1">Tidak ada transaksi ditemukan</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Belum ada riwayat pesanan yang cocok dengan pencarian Anda.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-rose-50/40 border-b border-rose-100 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                  <th className="p-4">ID Transaksi</th>
                  <th className="p-4">Tanggal & Waktu</th>
                  <th className="p-4">Nama Pembeli</th>
                  <th className="p-4">Nomor WhatsApp</th>
                  <th className="p-4 text-right">Total Tagihan</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Detail / Nota</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-50/50">
                {filteredTxs.map((tx) => (
                  <tr key={tx.id} className="hover:bg-rose-50/10 transition-colors text-slate-700">
                    
                    {/* ID */}
                    <td className="p-4 font-mono font-bold text-xs text-rose-600">
                      #{tx.id}
                    </td>

                    {/* Date */}
                    <td className="p-4 text-slate-500 text-xs">
                      {new Date(tx.tanggal).toLocaleString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </td>

                    {/* Buyer Name */}
                    <td className="p-4 font-medium text-slate-800">
                      {tx.buyerName}
                    </td>

                    {/* Phone */}
                    <td className="p-4 text-slate-500 text-xs">
                      {tx.buyerPhone || "-"}
                    </td>

                    {/* Total Price */}
                    <td className="p-4 text-right font-bold text-slate-800">
                      {formatIDR(tx.totalHarga)}
                    </td>

                    {/* Status badge */}
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                        tx.status === "Pembayaran Sukses"
                          ? "bg-green-50 text-green-700 border-green-100"
                          : "bg-amber-50 text-amber-700 border-amber-100 animate-pulse"
                      }`}>
                        {tx.status}
                      </span>
                    </td>

                    {/* Detail trigger & external link */}
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedTx(tx)}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-rose-100 hover:text-rose-700 transition-colors cursor-pointer"
                          title="Lihat Detail Belanja"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        <a
                          href={`/nota/${tx.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Buka Nota Online"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>

                        {onDeleteTransactionClick && (
                          <button
                            onClick={() => {
                              if (confirm("Apakah Anda yakin ingin menghapus data transaksi ini?")) {
                                onDeleteTransactionClick(tx.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
                            title="Hapus Transaksi"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DETAIL TRANSAKSI */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-rose-100 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            
            {/* Header detail */}
            <div className="flex items-center justify-between border-b border-rose-50 pb-3">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-rose-500" />
                <h3 className="font-serif text-lg font-bold text-slate-800">Detail Pesanan #{selectedTx.id.substring(4, 10)}</h3>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                Tutup
              </button>
            </div>

            {/* Info Pelanggan */}
            <div className="grid grid-cols-2 gap-4 bg-rose-50/40 p-4 rounded-2xl border border-rose-100/50 text-xs text-slate-600">
              <div>
                <span className="text-slate-400 block uppercase tracking-wider font-semibold">Nama Pembeli</span>
                <span className="font-bold text-slate-800 text-sm">{selectedTx.buyerName}</span>
                <span className="block text-[10px] text-slate-400 mt-1">WA: {selectedTx.buyerPhone || "-"}</span>
              </div>
              <div>
                <span className="text-slate-400 block uppercase tracking-wider font-semibold">Waktu Pemesanan</span>
                <span className="font-medium text-slate-800 text-sm">
                  {new Date(selectedTx.tanggal).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                  })}
                </span>
                <span className="block text-[10px] text-slate-400 mt-1">Status: <span className="font-bold text-rose-600">{selectedTx.status}</span></span>
              </div>
            </div>

            {/* Purchased Items list */}
            <div className="space-y-2.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Item Yang Dibeli</span>
              
              <div className="divide-y divide-rose-50 max-h-[250px] overflow-y-auto pr-1">
                {selectedTx.itemDibeli.map((item, idx) => (
                  <div key={idx} className="flex gap-3 py-2">
                    <img
                      src={item.urlGambar}
                      alt={item.nama}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=100&auto=format&fit=crop&q=80";
                      }}
                      className="w-10 h-10 object-cover rounded-lg border border-slate-100"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-serif font-bold text-slate-800 truncate">{item.nama}</h4>
                      <p className="text-[10px] text-slate-400">Ukuran/Varian: {item.ukuran || "All Size"}</p>
                      <div className="flex justify-between items-center mt-0.5">
                        <span className="text-[11px] text-slate-500">
                          {formatIDR(item.harga)} x {item.quantity}
                        </span>
                        <span className="text-xs font-semibold text-slate-800">
                          {formatIDR(item.harga * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Summary */}
            <div className="border-t border-rose-50 pt-3 space-y-1.5 text-right">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Subtotal Item</span>
                <span>{formatIDR(selectedTx.totalHarga)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-800 border-t border-rose-50 pt-1.5">
                <span className="font-serif">Total Tagihan</span>
                <span className="font-serif text-rose-600">{formatIDR(selectedTx.totalHarga)}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pt-2 border-t border-rose-50">
              <a
                href={`/nota/${selectedTx.id}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                Cetak Nota Online
              </a>
              <button
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl"
              >
                Tutup Detail
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
