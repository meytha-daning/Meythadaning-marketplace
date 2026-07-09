import React, { useState, useEffect } from "react";
import { X, Sparkles, AlertCircle } from "lucide-react";
import { Product } from "../types";

interface ModalProductProps {
  product: Product | null; // Null if adding new
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product, isNew: boolean) => Promise<void>;
}

const CATEGORIES = ["Pakaian", "Kecantikan"];

// Helpful image suggestion options
const IMAGE_SUGGESTIONS = [
  { label: "Dress", url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop&q=80" },
  { label: "Satin Blouse", url: "https://images.unsplash.com/photo-1548624149-f9b1859aa7d0?w=600&auto=format&fit=crop&q=80" },
  { label: "Skirt", url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80" },
  { label: "Serum", url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80" },
  { label: "Lipstick/Velvet", url: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&auto=format&fit=crop&q=80" },
  { label: "Cushion", url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80" }
];

export default function ModalProduct({ product, isOpen, onClose, onSave }: ModalProductProps) {
  const [nama, setNama] = useState("");
  const [harga, setHarga] = useState(0);
  const [stok, setStok] = useState(0);
  const [kategori, setKategori] = useState("Pakaian");
  const [urlGambar, setUrlGambar] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [ukuran, setUkuran] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setNama(product.nama);
      setHarga(product.harga);
      setStok(product.stok);
      setKategori(product.kategori);
      setUrlGambar(product.urlGambar);
      setDeskripsi(product.deskripsi || "");
      setUkuran(product.ukuran || "");
    } else {
      // Clear fields for new
      setNama("");
      setHarga(0);
      setStok(0);
      setKategori("Pakaian");
      setUrlGambar("");
      setDeskripsi("");
      setUkuran("");
    }
    setError("");
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!nama.trim()) return setError("Nama produk wajib diisi.");
    if (harga <= 0) return setError("Harga produk harus lebih besar dari 0.");
    if (stok < 0) return setError("Stok tidak boleh negatif.");
    if (!urlGambar.trim()) return setError("URL Gambar wajib diisi.");

    setIsSubmitting(true);
    try {
      const newOrUpdatedProduct: Product = {
        id: product ? product.id : `prod-${Date.now()}`,
        nama,
        harga: Number(harga),
        stok: Number(stok),
        kategori,
        urlGambar,
        deskripsi,
        ukuran: ukuran || (kategori === "Pakaian" ? "S, M, L, XL, XXL (Bigsize)" : "N/A")
      };

      await onSave(newOrUpdatedProduct, !product);
      onClose();
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan produk.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-rose-100 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-rose-50 bg-rose-50/50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-rose-500" />
            <h3 className="font-serif text-lg font-bold text-slate-800">
              {product ? "Edit Produk B&F" : "Tambah Produk Baru"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-100 hover:text-rose-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content / Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 text-xs p-3 rounded-xl border border-red-100">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Nama Produk */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Nama Produk</label>
            <input
              type="text"
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm"
              placeholder="Contoh: Rosie Linen Flare Dress"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Harga */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Harga (Rupiah)</label>
              <input
                type="number"
                required
                min="0"
                value={harga || ""}
                onChange={(e) => setHarga(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm"
                placeholder="IDR 349000"
              />
            </div>

            {/* Stok */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Stok</label>
              <input
                type="number"
                required
                min="0"
                value={stok !== undefined ? stok : ""}
                onChange={(e) => setStok(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm"
                placeholder="15"
              />
            </div>
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Kategori</label>
            <div className="flex gap-4">
              {CATEGORIES.map((cat) => (
                <label key={cat} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="kategori"
                    checked={kategori === cat}
                    onChange={() => setKategori(cat)}
                    className="text-rose-600 focus:ring-rose-500 h-4 w-4 border-slate-300"
                  />
                  <span>{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Ukuran / Size / Varian */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Ukuran / Varian / Detail Kemasan
            </label>
            <input
              type="text"
              value={ukuran}
              onChange={(e) => setUkuran(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm"
              placeholder={kategori === "Pakaian" ? "Contoh: S, M, L, XL, XXL (Bigsize)" : "Contoh: 50ml / 15g"}
            />
          </div>

          {/* Gambar URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">URL Gambar Produk</label>
            <input
              type="url"
              required
              value={urlGambar}
              onChange={(e) => setUrlGambar(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm"
              placeholder="https://images.unsplash.com/..."
            />
            
            {/* Quick Suggestions */}
            <div className="mt-1.5">
              <span className="text-[10px] text-slate-500 block mb-1">Gunakan URL contoh cepat jika tidak ada gambar:</span>
              <div className="flex flex-wrap gap-1.5">
                {IMAGE_SUGGESTIONS.map((img) => (
                  <button
                    key={img.label}
                    type="button"
                    onClick={() => setUrlGambar(img.url)}
                    className="text-[10px] bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium px-2 py-0.5 rounded-full border border-rose-100"
                  >
                    + {img.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Image Preview */}
          {urlGambar && (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <img
                src={urlGambar}
                alt="Pratinjau"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&auto=format&fit=crop&q=80";
                }}
                className="w-16 h-16 object-cover rounded-xl border border-slate-200 shadow-xs"
              />
              <div className="text-xs">
                <span className="text-slate-500 font-medium block">Pratinjau Gambar</span>
                <span className="text-green-600 font-semibold block">Gambar termuat sukses ✔</span>
              </div>
            </div>
          )}

          {/* Deskripsi */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Deskripsi Produk</label>
            <textarea
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm"
              placeholder="Tulis detail kelebihan produk, bahan, cara pakai, dll..."
            />
          </div>
        </form>

        {/* Footer Modal */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-rose-50 bg-rose-50/25">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 rounded-xl shadow-md cursor-pointer transition-colors"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Produk"}
          </button>
        </div>

      </div>
    </div>
  );
}
