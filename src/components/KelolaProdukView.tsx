import React, { useState } from "react";
import { PlusCircle, Search, Edit, Trash2, Filter, Sparkles, SlidersHorizontal, AlertCircle } from "lucide-react";
import { Product } from "../types";

interface KelolaProdukViewProps {
  products: Product[];
  onAddProductClick: () => void;
  onEditProductClick: (product: Product) => void;
  onDeleteProductClick: (id: string) => Promise<void>;
}

export default function KelolaProdukView({
  products,
  onAddProductClick,
  onEditProductClick,
  onDeleteProductClick
}: KelolaProdukViewProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Semua");
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  // Filter products based on search and category
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.nama.toLowerCase().includes(search.toLowerCase()) || 
                          (p.deskripsi && p.deskripsi.toLowerCase().includes(search.toLowerCase())) ||
                          (p.ukuran && p.ukuran.toLowerCase().includes(search.toLowerCase()));
    
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

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus produk ini dari database? Tindakan ini bersifat permanen.")) {
      setIsDeletingId(id);
      try {
        await onDeleteProductClick(id);
      } finally {
        setIsDeletingId(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Add button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-rose-500" />
            Kelola Katalog Produk
          </h2>
          <p className="text-xs text-slate-500">
            Tambah, edit, dan hapus koleksi pakaian & kecantikan B&F Chic Boutique
          </p>
        </div>
        <button
          id="add-product-btn"
          onClick={onAddProductClick}
          className="flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 transition-colors shadow-md shadow-rose-600/10 cursor-pointer"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Tambah Produk</span>
        </button>
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
            placeholder="Cari produk berdasarkan nama, deskripsi, atau ukuran..."
          />
        </div>

        {/* Category Selection */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm bg-white text-slate-700"
          >
            <option value="Semua">Semua Kategori</option>
            <option value="Pakaian">Pakaian Wanita</option>
            <option value="Kecantikan">Kecantikan</option>
          </select>
        </div>

        {/* Counter of shown items */}
        <div className="flex items-center justify-center bg-rose-50 text-rose-700 text-xs font-semibold px-3 py-2 rounded-xl border border-rose-100">
          <span>{filteredProducts.length} Produk ditampilkan</span>
        </div>
      </div>

      {/* Product Data Table */}
      <div className="bg-white rounded-3xl border border-rose-100 shadow-sm overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 px-4">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="font-serif text-base font-bold text-slate-700 mb-1">Produk Tidak Ditemukan</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Tidak ada produk yang cocok dengan pencarian atau filter Anda. Coba kata kunci lain atau tambahkan produk baru.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-rose-50/40 border-b border-rose-100 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                  <th className="p-4 w-20">Gambar</th>
                  <th className="p-4">Nama Produk</th>
                  <th className="p-4">Kategori</th>
                  <th className="p-4">Ukuran/Varian</th>
                  <th className="p-4 text-right">Harga</th>
                  <th className="p-4 text-center">Stok</th>
                  <th className="p-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-50/50">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-rose-50/10 transition-colors text-slate-700">
                    
                    {/* Product Image */}
                    <td className="p-4">
                      <img
                        src={p.urlGambar}
                        alt={p.nama}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&auto=format&fit=crop&q=80";
                        }}
                        className="w-12 h-12 object-cover rounded-xl border border-slate-200 shadow-xs"
                      />
                    </td>

                    {/* Name and Description */}
                    <td className="p-4 max-w-xs">
                      <p className="font-serif font-bold text-slate-800 truncate">{p.nama}</p>
                      <p className="text-xs text-slate-400 truncate max-w-xs">
                        {p.deskripsi || "Tidak ada deskripsi produk."}
                      </p>
                    </td>

                    {/* Category Badge */}
                    <td className="p-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        p.kategori === "Pakaian" 
                          ? "bg-rose-50 text-rose-700 border border-rose-100" 
                          : "bg-purple-50 text-purple-700 border border-purple-100"
                      }`}>
                        {p.kategori}
                      </span>
                    </td>

                    {/* Size */}
                    <td className="p-4 text-slate-500 text-xs">
                      {p.ukuran || "All Size"}
                    </td>

                    {/* Price */}
                    <td className="p-4 text-right font-bold text-slate-800">
                      {formatIDR(p.harga)}
                    </td>

                    {/* Stock status */}
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center rounded-lg px-2 py-1 text-xs font-semibold ${
                        p.stok === 0
                          ? "bg-red-50 text-red-700 border border-red-100"
                          : p.stok <= 5
                          ? "bg-amber-50 text-amber-700 border border-amber-100"
                          : "bg-green-50 text-green-700 border border-green-100"
                      }`}>
                        {p.stok} pcs
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onEditProductClick(p)}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-rose-100 hover:text-rose-700 transition-colors cursor-pointer"
                          title="Edit Produk"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          disabled={isDeletingId === p.id}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer disabled:opacity-50"
                          title="Hapus Produk"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
