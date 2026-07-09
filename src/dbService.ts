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

const KVDB_URL = "https://kvdb.io/BnFChicBoutiqueApp_7dd7a2d5";

// Helper to fetch from KVDB Cloud
async function fetchFromCloud(key: "products" | "transactions"): Promise<any> {
  const res = await fetch(`${KVDB_URL}/${key}`);
  if (res.ok) {
    return await res.json();
  }
  if (res.status === 404) {
    return null;
  }
  throw new Error(`Cloud fetch failed with status ${res.status}`);
}

// Helper to write to KVDB Cloud
async function saveToCloud(key: "products" | "transactions", data: any): Promise<boolean> {
  try {
    const res = await fetch(`${KVDB_URL}/${key}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return res.ok;
  } catch (e) {
    console.error(`Gagal upload ${key} ke cloud:`, e);
    return false;
  }
}

// Fetch dari server & update IndexedDB lokal
export async function syncFromServer(): Promise<{ products: Product[], transactions: Transaction[] }> {
  let products: Product[] = [];
  let transactions: Transaction[] = [];
  let useCloudFallback = false;

  try {
    // 1. Coba sync lewat Express server local dulu
    const prodRes = await fetch("/api/products");
    if (prodRes.ok) {
      products = await prodRes.json();
    } else {
      useCloudFallback = true;
    }

    const txRes = await fetch("/api/transactions");
    if (txRes.ok) {
      transactions = await txRes.json();
    } else {
      useCloudFallback = true;
    }
  } catch (error) {
    console.warn("Express server offline atau tidak merespon, beralih ke KVDB Cloud...");
    useCloudFallback = true;
  }

  // Jika Express API offline atau mengembalikan error (seperti di Vercel), gunakan cloud fallback
  if (useCloudFallback) {
    try {
      let cloudProducts = await fetchFromCloud("products");
      let cloudTransactions = await fetchFromCloud("transactions");

      if (!cloudProducts) {
        // Jika data di cloud kosong, seed dengan INITIAL_PRODUCTS
        cloudProducts = INITIAL_PRODUCTS;
        await saveToCloud("products", INITIAL_PRODUCTS);
      }
      if (!cloudTransactions) {
        cloudTransactions = [];
        await saveToCloud("transactions", []);
      }

      products = cloudProducts;
      transactions = cloudTransactions;
    } catch (cloudErr) {
      console.error("Gagal sinkronisasi dengan KVDB Cloud, menggunakan data IndexedDB lokal:", cloudErr);
      products = await getAllProducts();
      transactions = await getAllTransactions();
      return { products, transactions };
    }
  }

  // Simpan data terbaru ke IndexedDB lokal agar sinkron
  if (products && products.length > 0) {
    await clearProducts();
    for (const prod of products) {
      await saveProduct(prod);
    }
  }

  await clearTransactions();
  if (transactions && transactions.length > 0) {
    for (const tx of transactions) {
      await saveTransaction(tx);
    }
  }

  return { products, transactions };
}

// Kirim produk baru/edit ke server atau cloud
export async function addOrUpdateProductOnServer(product: Product, isNew: boolean): Promise<boolean> {
  // Selalu simpan ke IndexedDB lokal dulu agar langsung terasa perubahannya
  await saveProduct(product);

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
  } catch (e) {
    console.warn("Server API offline/gagal, menulis langsung ke KVDB Cloud...");
  }

  // Fallback Vercel: sinkronisasikan seluruh list produk lokal ke Cloud
  try {
    const allProducts = await getAllProducts();
    const success = await saveToCloud("products", allProducts);
    return success;
  } catch (err) {
    console.error("Gagal sinkronisasi produk ke KVDB Cloud:", err);
    return false;
  }
}

// Hapus produk dari server atau cloud
export async function deleteProductOnServer(id: string): Promise<boolean> {
  await deleteProduct(id);

  try {
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      return true;
    }
  } catch (e) {
    console.warn("Server API offline/gagal, menghapus lewat KVDB Cloud...");
  }

  try {
    const allProducts = await getAllProducts();
    const success = await saveToCloud("products", allProducts);
    return success;
  } catch (err) {
    console.error("Gagal sinkronisasi hapus produk ke KVDB Cloud:", err);
    return false;
  }
}

// Kirim transaksi ke server atau cloud (Checkout)
export async function createTransactionOnServer(trx: Transaction): Promise<boolean> {
  await saveTransaction(trx);

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
  } catch (e) {
    console.warn("Server API offline/gagal, menyimpan transaksi ke KVDB Cloud...");
  }

  try {
    const allTransactions = await getAllTransactions();
    const success = await saveToCloud("transactions", allTransactions);
    return success;
  } catch (err) {
    console.error("Gagal sinkronisasi transaksi ke KVDB Cloud:", err);
    return false;
  }
}

// Konfirmasi pembayaran di server atau cloud
export async function confirmTransactionPaymentOnServer(id: string): Promise<boolean> {
  const localTxs = await getAllTransactions();
  const tx = localTxs.find(t => t.id === id);
  if (tx) {
    tx.status = "Pembayaran Sukses";
    await saveTransaction(tx);
  }

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
  } catch (e) {
    console.warn("Server API offline/gagal, konfirmasi transaksi ke KVDB Cloud...");
  }

  try {
    const allTransactions = await getAllTransactions();
    const success = await saveToCloud("transactions", allTransactions);
    return success;
  } catch (err) {
    console.error("Gagal sinkronisasi konfirmasi pembayaran ke KVDB Cloud:", err);
    return false;
  }
}

// Hapus transaksi dari server atau cloud
export async function deleteTransactionOnServer(id: string): Promise<boolean> {
  await deleteTransaction(id);

  try {
    const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    if (res.ok) {
      return true;
    }
  } catch (e) {
    console.warn("Server API offline/gagal, menghapus transaksi lewat KVDB Cloud...");
  }

  try {
    const allTransactions = await getAllTransactions();
    const success = await saveToCloud("transactions", allTransactions);
    return success;
  } catch (err) {
    console.error("Gagal sinkronisasi hapus transaksi ke KVDB Cloud:", err);
    return false;
  }
}
