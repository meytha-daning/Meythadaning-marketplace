// Service database terpisah menggunakan IndexedDB dengan sinkronisasi ke Server API

const DB_NAME = "BnFChicBoutiqueDB";
const DB_VERSION = 1;

export interface Product {
  id: string;
  nama: string;
  harga: number;
  stok: number;
  kategori: string;
  urlGambar: string;
  deskripsi?: string;
  ukuran?: string;
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

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    nama: "Rosie Linen Flare Dress",
    harga: 349000,
    stok: 15,
    kategori: "Pakaian",
    urlGambar: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop&q=80",
    deskripsi: "Gaun linen dengan potongan flare anggun, bahan adem dan nyaman untuk segala ukuran dari S hingga Bigsize.",
    ukuran: "S, M, L, XL, XXL (Bigsize)"
  },
  {
    id: "prod-2",
    nama: "Luna Silk Satin Blouse",
    harga: 259000,
    stok: 12,
    kategori: "Pakaian",
    urlGambar: "https://images.unsplash.com/photo-1548624149-f9b1859aa7d0?w=600&auto=format&fit=crop&q=80",
    deskripsi: "Atasan satin sutra mewah dengan sentuhan kilau elegan, memberikan kesan berkelas saat dipakai ke pesta maupun santai.",
    ukuran: "M, L, XL, XXXL (Bigsize)"
  },
  {
    id: "prod-3",
    nama: "Amara Pleated Midi Skirt",
    harga: 219000,
    stok: 20,
    kategori: "Pakaian",
    urlGambar: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80",
    deskripsi: "Rok plisket midi premium dengan warna anggun dan bahan jatuh mewah, pas melengkapi gaya kasual formal.",
    ukuran: "All Size (Fit to XL/Bigsize)"
  },
  {
    id: "prod-4",
    nama: "Chic Oversized Trench Vest",
    harga: 299000,
    stok: 10,
    kategori: "Pakaian",
    urlGambar: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80",
    deskripsi: "Luar rajutan/vest panjang tanpa lengan dengan potongan oversized yang elegan dan menawan untuk style layer.",
    ukuran: "All Size (Fit to XXL/Bigsize)"
  },
  {
    id: "prod-5",
    nama: "Belle Floral Wrap Dress",
    harga: 389000,
    stok: 8,
    kategori: "Pakaian",
    urlGambar: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=600&auto=format&fit=crop&q=80",
    deskripsi: "Gaun model lilit (wrap dress) motif bunga cantik yang membentuk siluet tubuh anggun untuk semua ukuran.",
    ukuran: "S, M, L, XL, XXL, XXXL"
  },
  {
    id: "prod-6",
    nama: "Glow Essential Serum",
    harga: 189000,
    stok: 25,
    kategori: "Kecantikan",
    urlGambar: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80",
    deskripsi: "Serum pencerah kulit dengan kandungan vitamin C dan Niacinamide untuk mengembalikan kilau alami wajah Anda.",
    ukuran: "50ml"
  },
  {
    id: "prod-7",
    nama: "Velvet Rose Lip Velvet",
    harga: 99000,
    stok: 30,
    kategori: "Kecantikan",
    urlGambar: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&auto=format&fit=crop&q=80",
    deskripsi: "Pewarna bibir bertekstur lembut bagai beludru dengan rona mawar anggun yang tahan lama dan melembabkan.",
    ukuran: "4.5g"
  },
  {
    id: "prod-8",
    nama: "Chic Aura Cushion Foundation",
    harga: 245000,
    stok: 15,
    kategori: "Kecantikan",
    urlGambar: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80",
    deskripsi: "Cushion berdaya tutup tinggi dengan hasil akhir dewy berkilau alami, melindungi kulit sekaligus mempercantik.",
    ukuran: "15g"
  },
  {
    id: "prod-9",
    nama: "Hydra Moist Rose Water",
    harga: 79000,
    stok: 40,
    kategori: "Kecantikan",
    urlGambar: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&auto=format&fit=crop&q=80",
    deskripsi: "Penyegar wajah sari mawar murni untuk hidrasi instan dan menenangkan kulit lelah kapan saja.",
    ukuran: "100ml"
  },
  {
    id: "prod-10",
    nama: "Radiant Bloom Eyeshadow Palette",
    harga: 169000,
    stok: 18,
    kategori: "Kecantikan",
    urlGambar: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&auto=format&fit=crop&q=80",
    deskripsi: "Palet perona mata berpikmen tinggi dengan kombinasi warna hangat dan glitter elegan untuk sorot mata memukau.",
    ukuran: "12 Shades"
  }
];

// Inisialisasi Native IndexedDB
export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains("products")) {
        db.createObjectStore("products", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("transactions")) {
        db.createObjectStore("transactions", { keyPath: "id" });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

// === OPERATIONS FOR 'products' ===

export async function getAllProducts(): Promise<Product[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("products", "readonly");
    const store = transaction.objectStore("products");
    const request = store.getAll();

    request.onsuccess = async () => {
      const results = request.result;
      if (!results || results.length === 0) {
        // Seed default products
        try {
          const writeTx = db.transaction("products", "readwrite");
          const writeStore = writeTx.objectStore("products");
          for (const prod of INITIAL_PRODUCTS) {
            writeStore.put(prod);
          }
          writeTx.oncomplete = () => {
            resolve(INITIAL_PRODUCTS);
          };
        } catch (e) {
          console.warn("Gagal seeding default products ke IndexedDB", e);
          resolve(INITIAL_PRODUCTS);
        }
      } else {
        resolve(results);
      }
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function saveProduct(product: Product): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("products", "readwrite");
    const store = transaction.objectStore("products");
    const request = store.put(product);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function deleteProduct(id: string): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("products", "readwrite");
    const store = transaction.objectStore("products");
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function clearProducts(): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("products", "readwrite");
    const store = transaction.objectStore("products");
    const request = store.clear();

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

// === OPERATIONS FOR 'transactions' ===

export async function getAllTransactions(): Promise<Transaction[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("transactions", "readonly");
    const store = transaction.objectStore("transactions");
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function saveTransaction(trx: Transaction): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("transactions", "readwrite");
    const store = transaction.objectStore("transactions");
    const request = store.put(trx);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function deleteTransaction(id: string): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("transactions", "readwrite");
    const store = transaction.objectStore("transactions");
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function clearTransactions(): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("transactions", "readwrite");
    const store = transaction.objectStore("transactions");
    const request = store.clear();

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

// === SERVER SYNCHRONIZATION ===

// Fetch dari server & update IndexedDB lokal
export async function syncFromServer(): Promise<{ products: Product[], transactions: Transaction[] }> {
  try {
    // 1. Sync Products
    const prodRes = await fetch("/api/products");
    if (prodRes.ok) {
      const serverProducts: Product[] = await prodRes.json();
      if (serverProducts && serverProducts.length > 0) {
        await clearProducts();
        for (const prod of serverProducts) {
          await saveProduct(prod);
        }
      }
    }

    // 2. Sync Transactions
    const txRes = await fetch("/api/transactions");
    let serverTransactions: Transaction[] = [];
    if (txRes.ok) {
      serverTransactions = await txRes.json();
      if (serverTransactions && serverTransactions.length > 0) {
        await clearTransactions();
        for (const tx of serverTransactions) {
          await saveTransaction(tx);
        }
      }
    }

    const localProducts = await getAllProducts();
    const localTransactions = await getAllTransactions();
    return { products: localProducts, transactions: localTransactions };
  } catch (error) {
    console.error("Gagal sinkronisasi data dengan server:", error);
    // Fallback ke data lokal saja jika offline/gagal
    const localProducts = await getAllProducts();
    const localTransactions = await getAllTransactions();
    return { products: localProducts, transactions: localTransactions };
  }
}

// Kirim produk baru/edit ke server
export async function addOrUpdateProductOnServer(product: Product, isNew: boolean): Promise<boolean> {
  try {
    const method = isNew ? "POST" : "PUT";
    const url = isNew ? "/api/products" : `/api/products/${product.id}`;
    
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product)
    });

    if (res.ok) {
      const savedProd = await res.json();
      await saveProduct(savedProd);
      return true;
    }
    return false;
  } catch (e) {
    console.error("Gagal simpan produk ke server:", e);
    // Simpan lokal dulu
    await saveProduct(product);
    return false;
  }
}

// Hapus produk dari server
export async function deleteProductOnServer(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      await deleteProduct(id);
      return true;
    }
    return false;
  } catch (e) {
    console.error("Gagal hapus produk di server:", e);
    await deleteProduct(id);
    return false;
  }
}

// Kirim transaksi ke server (Checkout)
export async function createTransactionOnServer(trx: Transaction): Promise<boolean> {
  try {
    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(trx)
    });

    if (res.ok) {
      const savedTrx = await res.json();
      await saveTransaction(savedTrx);
      return true;
    }
    return false;
  } catch (e) {
    console.error("Gagal simpan transaksi ke server:", e);
    await saveTransaction(trx);
    return false;
  }
}

// Konfirmasi pembayaran di server
export async function confirmTransactionPaymentOnServer(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/transactions/${id}/confirm`, {
      method: "PUT"
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        await saveTransaction(data.transaction);
        return true;
      }
    }
    return false;
  } catch (e) {
    console.error("Gagal konfirmasi pembayaran di server:", e);
    // Update lokal saja sebagai fallback
    const localTxs = await getAllTransactions();
    const tx = localTxs.find(t => t.id === id);
    if (tx) {
      tx.status = "Pembayaran Sukses";
      await saveTransaction(tx);
    }
    return false;
  }
}
