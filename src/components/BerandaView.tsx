import React from "react";
import { Sparkles, Store, Heart, ShieldCheck, Truck, ArrowRight, Star } from "lucide-react";

interface BerandaViewProps {
  onExploreCatalog: () => void;
  buyerName: string;
}

export default function BerandaView({ onExploreCatalog, buyerName }: BerandaViewProps) {
  return (
    <div id="beranda-buyer-container" className="space-y-8 animate-fade-in">
      
      {/* Hero Elegant Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-rose-500 to-pink-600 p-8 text-white shadow-xl shadow-rose-500/10">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-xl"></div>
        <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-white/10 blur-xl"></div>
        
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: "5s" }} />
            <span>Boutique & Beauty Terpercaya</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold tracking-wide leading-tight">
            Hai, {buyerName}! Selamat Datang di B&F Chic Boutique ✨
          </h2>
          <p className="text-sm sm:text-base text-rose-50 font-light leading-relaxed">
            Temukan rahasia penampilan anggun dan menawan Anda hari ini. Kami menghadirkan koleksi busana muslimah elegan, pakaian modis modern, kosmetik premium impor, dan produk kecantikan terbaik khusus untuk menyempurnakan hari-hari indah Anda.
          </p>
          <div className="pt-2">
            <button
              onClick={onExploreCatalog}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 active:scale-95 transition-all shadow-md hover:shadow-lg cursor-pointer"
            >
              <span>Mulai Belanja Sekarang</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tentang Website / Toko Kami */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
        <div className="md:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-rose-100 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-serif text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Store className="h-6 w-6 text-rose-500" />
              <span>Tentang B&F Chic Boutique</span>
            </h3>
            <div className="w-16 h-1 border-t-4 border-rose-500 rounded-full"></div>
            <p className="text-sm text-slate-600 leading-relaxed">
              B&F Chic Boutique adalah destinasi belanja online modern dan berkelas yang dirancang khusus untuk memenuhi kebutuhan gaya hidup dan kecantikan Anda. Kami berkomitmen untuk selalu menghadirkan produk dengan kualitas terbaik, mulai dari pakaian anggun berpola indah hingga kosmetik terkurasi dari merk terkemuka.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Dengan sistem aplikasi kami yang terintegrasi langsung dengan database cloud dan WhatsApp Seller, Anda dapat melakukan pemesanan instan tanpa ribet, melacak riwayat transaksi Anda secara real-time, dan mendapatkan nota belanja resmi yang dapat diunduh kapan saja.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-4 items-center text-xs text-slate-500 bg-rose-50/40 p-3 rounded-2xl border border-rose-100/50">
            <div className="flex items-center gap-1.5">
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              <span>Kualitas Bintang 5</span>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
            <div className="flex items-center gap-1.5">
              <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
              <span>Produk Terpilih</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-5 bg-radial from-rose-50 to-pink-50 p-6 sm:p-8 rounded-3xl border border-rose-100 shadow-xs flex flex-col justify-center text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-rose-500 flex items-center justify-center text-white shadow-md shadow-rose-500/15">
            <Sparkles className="h-8 w-8 animate-pulse" />
          </div>
          <h4 className="font-serif text-xl font-bold text-slate-800">Tampil Anggun Setiap Hari</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            "Kecantikan sejati terpancar ketika Anda merasa nyaman dengan apa yang Anda kenakan dan aplikasikan pada kulit indah Anda. B&F Chic hadir untuk menjadi sahabat setia perjalanan kecantikan Anda."
          </p>
          <p className="text-xs font-bold text-rose-500 font-serif tracking-widest uppercase">- Meytha Daning (Founder)</p>
        </div>
      </div>

      {/* Keunggulan Toko Kami (3 Cards Grid) */}
      <div className="space-y-4">
        <h3 className="font-serif text-xl font-bold text-slate-800 text-center">
          Mengapa Belanja di B&F Chic Boutique?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          
          <div className="bg-white p-6 rounded-2xl border border-rose-100 hover:border-rose-300 hover:-translate-y-1 transition-all duration-300 shadow-xs flex flex-col space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
              <Heart className="h-5 w-5" />
            </div>
            <h4 className="font-serif font-bold text-slate-800">Koleksi Premium Terpilih</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Semua busana dan kosmetik dipilih secara ketat untuk menjamin kepuasan, kesesuaian bahan, dan kesempurnaan penggunaan Anda.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-rose-100 hover:border-rose-300 hover:-translate-y-1 transition-all duration-300 shadow-xs flex flex-col space-y-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h4 className="font-serif font-bold text-slate-800">Keamanan & Kemudahan</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Pesan mudah lewat website, konfirmasi cepat lewat WhatsApp resmi, dan pantau status serta nota pembelian online Anda kapan saja secara mandiri.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-rose-100 hover:border-rose-300 hover:-translate-y-1 transition-all duration-300 shadow-xs flex flex-col space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
              <Truck className="h-5 w-5" />
            </div>
            <h4 className="font-serif font-bold text-slate-800">Pengiriman Cepat & Aman</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Kami bekerja sama dengan berbagai kurir terpercaya untuk memastikan gaun indah dan kosmetik idaman Anda tiba dalam kondisi sempurna dan tepat waktu.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
