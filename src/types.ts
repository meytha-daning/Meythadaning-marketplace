export interface Product {
  id: string;
  nama: string;
  harga: number;
  stok: number;
  kategori: string; // 'Pakaian' | 'Kecantikan'
  urlGambar: string;
  deskripsi?: string;
  ukuran?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Transaction {
  id: string;
  tanggal: string;
  totalHarga: number;
  itemDibeli: Array<{
    id: string;
    nama: string;
    harga: number;
    quantity: number;
    urlGambar?: string;
    kategori?: string;
    ukuran?: string;
  }>;
  status: string; // "Menunggu Pembayaran" | "Pembayaran Sukses"
  buyerName: string;
  buyerEmail?: string;
  buyerPhone?: string;
}

export interface User {
  email: string;
  nama: string;
  role: "admin" | "buyer";
}
