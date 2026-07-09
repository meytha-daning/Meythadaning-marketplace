import React, { useState, useEffect } from "react";
import { Sparkles, Printer, Send, CheckCircle2, Clock, ArrowLeft, RefreshCw, PhoneCall } from "lucide-react";
import { Transaction } from "../types";
import { confirmTransactionPaymentOnServer } from "../dbService";

interface InvoiceDetailProps {
  transactionId: string;
  onBackToApp?: () => void;
}

export default function InvoiceDetail({ transactionId, onBackToApp }: InvoiceDetailProps) {
  const [trx, setTrx] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState("");

  const fetchTransaction = async () => {
    setIsLoading(true);
    setError("");
    try {
      // Fetch directly from server API (supports viewing without being logged in)
      const res = await fetch("/api/transactions");
      if (res.ok) {
        const list: Transaction[] = await res.json();
        const found = list.find((t) => t.id === transactionId);
        if (found) {
          setTrx(found);
        } else {
          setError("Nota tidak ditemukan. Pastikan ID transaksi benar.");
        }
      } else {
        setError("Gagal memuat database dari server.");
      }
    } catch (e) {
      setError("Gagal memuat data transaksi.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (transactionId) {
      fetchTransaction();
    }
  }, [transactionId]);

  const handlePrint = () => {
    window.print();
  };

  const handleConfirmPayment = async () => {
    if (!trx) return;
    setIsConfirming(true);
    try {
      const success = await confirmTransactionPaymentOnServer(trx.id);
      if (success) {
        // Reload trx data
        await fetchTransaction();
        
        // Connect to WA to notify payment
        const sellerNumber = "628996967565";
        const text = `Halo Sis/Gan Seller B&F Chic Boutique!%0A%0ASaya sudah melakukan konfirmasi pembayaran sebesar *${formatIDR(trx.totalHarga)}* untuk Nomor Pesanan *#${trx.id}*.%0A%0AMohon divalidasi dan segera diproses pengirimannya ya Sis/Gan. Terima kasih! ✨💖`;
        window.open(`https://wa.me/${sellerNumber}?text=${text}`, "_blank");
      } else {
        alert("Gagal melakukan konfirmasi pembayaran.");
      }
    } catch (e) {
      alert("Terjadi kesalahan sistem saat konfirmasi pembayaran.");
    } finally {
      setIsConfirming(false);
    }
  };

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(num);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-rose-50/50 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-rose-500 animate-spin" />
          <p className="text-sm font-medium text-slate-600">Memuat Nota Online Pembayaran...</p>
        </div>
      </div>
    );
  }

  if (error || !trx) {
    return (
      <div className="min-h-screen bg-rose-50/50 flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-white p-8 rounded-3xl border border-rose-100 shadow-xl max-w-md space-y-4">
          <div className="h-12 w-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg font-bold text-slate-800">Nota Tidak Ditemukan</h3>
          <p className="text-xs text-slate-500">{error || "Data pesanan tidak dapat dimuat."}</p>
          {onBackToApp && (
            <button
              onClick={onBackToApp}
              className="mt-4 bg-rose-600 text-white font-semibold text-xs px-4 py-2 rounded-xl"
            >
              Kembali ke Aplikasi
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-rose-50/50 py-8 px-4 sm:px-6 lg:px-8">
      
      {/* Outer Wrapper for Print Constraints */}
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* Navigation / Toolbar - HIDDEN IN PRINT */}
        <div className="flex items-center justify-between print:hidden">
          {onBackToApp ? (
            <button
              onClick={onBackToApp}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Aplikasi</span>
            </button>
          ) : (
            <a
              href="/"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Masuk Aplikasi B&F Boutique</span>
            </a>
          )}

          <div className="flex gap-2">
            <button
              onClick={fetchTransaction}
              className="p-1.5 bg-white border border-rose-100 rounded-lg hover:bg-rose-50 text-slate-500 transition-colors"
              title="Segarkan Nota"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-white border border-rose-100 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-rose-50 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Nota</span>
            </button>
          </div>
        </div>

        {/* INVOICE CARD */}
        <div className="bg-white rounded-3xl border border-rose-100 shadow-xl p-6 sm:p-8 space-y-6 relative overflow-hidden print:shadow-none print:border-none print:p-0">
          
          {/* Decorative Pink Top Frame */}
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-rose-400 to-rose-600 print:hidden"></div>

          {/* Boutique Header */}
          <div className="text-center space-y-1 pb-4 border-b border-rose-50">
            <div className="flex items-center justify-center gap-1.5 text-rose-600">
              <Sparkles className="w-5 h-5 text-rose-500" />
              <span className="font-serif text-2xl font-bold tracking-widest text-slate-800">B&F CHIC BOUTIQUE</span>
            </div>
            <p className="text-[10px] font-sans tracking-widest uppercase font-semibold text-rose-500">
              Elegant Style & Beauty for Every Woman
            </p>
            <p className="text-[10px] text-slate-400">
              WhatsApp: +628996967565 • Karawang, Jawa Barat
            </p>
          </div>

          {/* Invoice ID & Metadata */}
          <div className="grid grid-cols-2 gap-4 text-xs text-slate-600 pb-4 border-b border-rose-50">
            <div>
              <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[9px]">ID Transaksi</span>
              <span className="font-mono font-bold text-slate-800 text-sm">#{trx.id}</span>
              <span className="block text-[10px] text-slate-400 mt-1">
                Tanggal: {new Date(trx.tanggal).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric"
                })}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[9px]">Pelanggan</span>
              <span className="font-serif font-bold text-slate-800 text-sm">{trx.buyerName}</span>
              <span className="block text-[10px] text-slate-400 mt-1">WA: {trx.buyerPhone || "-"}</span>
            </div>
          </div>

          {/* Status Alert Frame */}
          <div className={`p-4 rounded-2xl flex items-center justify-between border ${
            trx.status === "Pembayaran Sukses"
              ? "bg-green-50 text-green-800 border-green-100"
              : "bg-amber-50 text-amber-800 border-amber-100"
          }`}>
            <div className="flex items-center gap-3">
              {trx.status === "Pembayaran Sukses" ? (
                <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
              ) : (
                <Clock className="w-6 h-6 text-amber-500 shrink-0 animate-pulse" />
              )}
              <div>
                <p className="text-xs font-bold uppercase tracking-wide">Status Tagihan</p>
                <p className="text-sm font-serif font-bold">{trx.status}</p>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
              trx.status === "Pembayaran Sukses"
                ? "bg-green-200 text-green-900"
                : "bg-amber-200 text-amber-900 animate-pulse"
            }`}>
              {trx.status === "Pembayaran Sukses" ? "LUNAS ✔" : "BELUM BAYAR ⏳"}
            </span>
          </div>

          {/* Purchased Items List */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Daftar Belanja</h4>
            
            <div className="divide-y divide-rose-50 border-y border-rose-50 py-1.5">
              {trx.itemDibeli.map((item, idx) => (
                <div key={idx} className="flex justify-between py-2.5 items-center">
                  <div className="min-w-0 flex-1 pr-4">
                    <h5 className="text-xs font-serif font-bold text-slate-800 truncate">{item.nama}</h5>
                    <p className="text-[10px] text-slate-400">
                      Kategori: {item.kategori || "Pakaian"} • Ukuran/Varian: {item.ukuran || "All Size"}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {formatIDR(item.harga)} x {item.quantity}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-800 shrink-0">
                    {formatIDR(item.harga * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Totals */}
          <div className="space-y-1.5 text-right">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Subtotal Item</span>
              <span>{formatIDR(trx.totalHarga)}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>Pajak & Layanan</span>
              <span>Rp 0</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-800 border-t border-rose-50 pt-2">
              <span className="font-serif text-slate-700">Total Pembayaran</span>
              <span className="font-serif text-lg text-rose-600">{formatIDR(trx.totalHarga)}</span>
            </div>
          </div>

          {/* Bank / Payment Instructions */}
          {trx.status === "Menunggu Pembayaran" && (
            <div className="bg-rose-50/30 p-4 rounded-2xl border border-rose-100/50 text-xs space-y-2 text-slate-600">
              <span className="font-serif font-bold text-slate-800 block">💳 Panduan Pembayaran Transfer:</span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="block text-slate-400 font-semibold uppercase tracking-wider text-[8px]">BANK MANDIRI</span>
                  <span className="font-bold text-slate-800 font-mono">109-00123-45678</span>
                  <span className="block text-slate-500">a.n. B&F Chic Boutique</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-semibold uppercase tracking-wider text-[8px]">DANA / OVO</span>
                  <span className="font-bold text-slate-800 font-mono">0899-6967-565</span>
                  <span className="block text-slate-500">a.n. Meytha Daning</span>
                </div>
              </div>
            </div>
          )}

          {/* ACTIONS FOR BUYER - HIDDEN IN PRINT */}
          {trx.status === "Menunggu Pembayaran" && (
            <div className="flex flex-col gap-2 pt-2 print:hidden">
              <button
                onClick={handleConfirmPayment}
                disabled={isConfirming}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-2xl text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Konfirmasi Pembayaran Lunas 💳</span>
              </button>
              <span className="text-[10px] text-center text-slate-400">
                Klik tombol di atas untuk mengubah status nota menjadi LUNAS dan meneruskan konfirmasi ke WhatsApp Penjual secara otomatis.
              </span>
            </div>
          )}

          {/* Footer Receipt Note */}
          <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-rose-50/50">
            <p className="font-serif italic text-slate-500 font-medium">✨ Terima kasih telah berbelanja di B&F Chic Boutique ✨</p>
            <p className="mt-1">Pakaian berkualitas mewah dan kosmetik pilihan membuat Anda tampak lebih anggun dan percaya diri.</p>
          </div>

        </div>

        {/* Back to Home action - HIDDEN IN PRINT */}
        <div className="text-center print:hidden">
          <p className="text-xs text-slate-500">
            Butuh bantuan? Silakan hubungi admin kami di{" "}
            <a
              href="https://wa.me/628996967565"
              target="_blank"
              rel="noreferrer"
              className="text-rose-600 font-bold hover:underline"
            >
              +628996967565
            </a>
          </p>
        </div>

      </div>

    </div>
  );
}
