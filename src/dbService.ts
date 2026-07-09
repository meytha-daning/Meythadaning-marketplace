// Service database terpisah menggunakan IndexedDB dengan sinkronisasi ke Server API
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  onSnapshot
} from "firebase/firestore";
import { db, auth } from "./firebase";

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

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

// === SERVER SYNCHRONIZATION WITH FIREBASE FIRESTORE ===

// Fetch dari Firestore & update IndexedDB lokal
export async function syncFromServer(): Promise<{ products: Product[], transactions: Transaction[] }> {
  let products: Product[] = [];
  let transactions: Transaction[] = [];

  try {
    // 1. Ambil produk dari Firestore
    const prodCol = collection(db, "products");
    let prodSnapshot;
    try {
      prodSnapshot = await getDocs(prodCol);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.GET, "products");
      throw err;
    }
    
    if (prodSnapshot.empty) {
      console.log("Seeding INITIAL_PRODUCTS ke Firestore...");
      for (const prod of INITIAL_PRODUCTS) {
        try {
          await setDoc(doc(db, "products", prod.id), prod);
        } catch (err: any) {
          handleFirestoreError(err, OperationType.WRITE, `products/${prod.id}`);
        }
      }
      products = [...INITIAL_PRODUCTS];
    } else {
      prodSnapshot.forEach((docSnap) => {
        products.push(docSnap.data() as Product);
      });
    }

    // 2. Ambil transaksi dari Firestore
    const txCol = collection(db, "transactions");
    let txSnapshot;
    try {
      txSnapshot = await getDocs(txCol);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.GET, "transactions");
      throw err;
    }
    txSnapshot.forEach((docSnap) => {
      transactions.push(docSnap.data() as Transaction);
    });

    // 3. Simpan data terbaru ke IndexedDB lokal agar sinkron & mendukung offline
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
  } catch (err) {
    console.error("Gagal sinkronisasi data dari Firestore, menggunakan data IndexedDB lokal:", err);
    const localProducts = await getAllProducts();
    const localTransactions = await getAllTransactions();
    return { products: localProducts, transactions: localTransactions };
  }
}

// Kirim produk baru/edit ke Firestore
export async function addOrUpdateProductOnServer(product: Product, isNew: boolean): Promise<boolean> {
  // Simpan ke IndexedDB lokal dulu
  await saveProduct(product);

  try {
    const docRef = doc(db, "products", product.id);
    await setDoc(docRef, product);
    return true;
  } catch (err) {
    console.error("Gagal menyimpan produk ke Firestore:", err);
    handleFirestoreError(err, OperationType.WRITE, `products/${product.id}`);
    return false;
  }
}

// Hapus produk dari Firestore
export async function deleteProductOnServer(id: string): Promise<boolean> {
  // Hapus dari IndexedDB lokal dulu
  await deleteProduct(id);

  try {
    const docRef = doc(db, "products", id);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error("Gagal menghapus produk dari Firestore:", err);
    handleFirestoreError(err, OperationType.DELETE, `products/${id}`);
    return false;
  }
}

// Kirim transaksi ke Firestore (Checkout)
export async function createTransactionOnServer(trx: Transaction): Promise<boolean> {
  // Simpan ke IndexedDB lokal dulu
  await saveTransaction(trx);

  try {
    const docRef = doc(db, "transactions", trx.id);
    await setDoc(docRef, trx);
    return true;
  } catch (err) {
    console.error("Gagal menyimpan transaksi ke Firestore:", err);
    handleFirestoreError(err, OperationType.WRITE, `transactions/${trx.id}`);
    return false;
  }
}

// Konfirmasi pembayaran di Firestore & Potong Stok Produk
export async function confirmTransactionPaymentOnServer(id: string): Promise<boolean> {
  const localTxs = await getAllTransactions();
  const tx = localTxs.find(t => t.id === id);
  if (tx) {
    tx.status = "Pembayaran Sukses";
    await saveTransaction(tx);
  }

  try {
    const txRef = doc(db, "transactions", id);
    let txSnap;
    try {
      txSnap = await getDoc(txRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `transactions/${id}`);
      throw err;
    }
    if (txSnap && txSnap.exists()) {
      const transactionData = txSnap.data() as Transaction;
      if (transactionData.status !== "Pembayaran Sukses") {
        // Update status di Firestore
        try {
          await updateDoc(txRef, { status: "Pembayaran Sukses" });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `transactions/${id}`);
          throw err;
        }
        
        // Kurangi stok produk di Firestore untuk item yang dibeli
        if (transactionData.itemDibeli && transactionData.itemDibeli.length > 0) {
          for (const item of transactionData.itemDibeli) {
            const prodRef = doc(db, "products", item.id);
            let prodSnap;
            try {
              prodSnap = await getDoc(prodRef);
            } catch (err) {
              handleFirestoreError(err, OperationType.GET, `products/${item.id}`);
              throw err;
            }
            if (prodSnap && prodSnap.exists()) {
              const prodData = prodSnap.data() as Product;
              const newStok = Math.max(0, (prodData.stok || 0) - (item.quantity || 0));
              try {
                await updateDoc(prodRef, { stok: newStok });
              } catch (err) {
                handleFirestoreError(err, OperationType.UPDATE, `products/${item.id}`);
                throw err;
              }
            }
          }
        }
      }
    }
    return true;
  } catch (err) {
    console.error("Gagal konfirmasi pembayaran di Firestore:", err);
    return false;
  }
}

// Hapus transaksi dari Firestore
export async function deleteTransactionOnServer(id: string): Promise<boolean> {
  // Hapus dari IndexedDB lokal dulu
  await deleteTransaction(id);

  try {
    const docRef = doc(db, "transactions", id);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error("Gagal menghapus transaksi dari Firestore:", err);
    handleFirestoreError(err, OperationType.DELETE, `transactions/${id}`);
    return false;
  }
}

// === REAL-TIME SYNCHRONIZATION WITH FIRESTORE ===

// Real-time listener untuk produk dari Firestore
export function listenToProducts(callback: (products: Product[]) => void, onError?: (error: any) => void) {
  const prodCol = collection(db, "products");
  return onSnapshot(prodCol, async (snapshot) => {
    let products: Product[] = [];
    snapshot.forEach((docSnap) => {
      products.push(docSnap.data() as Product);
    });

    // Jika Firestore masih kosong, gunakan data awal lokal sebagai fallback
    if (snapshot.empty) {
      products = [...INITIAL_PRODUCTS];
    }

    // Update data terbaru ke IndexedDB lokal untuk dukungan offline
    try {
      await clearProducts();
      for (const prod of products) {
        await saveProduct(prod);
      }
    } catch (e) {
      console.warn("Gagal sinkronisasi produk snapshot ke IndexedDB lokal:", e);
    }

    callback(products);
  }, (error) => {
    console.error("Gagal sinkronisasi real-time produk dari Firestore:", error);
    try {
      handleFirestoreError(error, OperationType.LIST, "products");
    } catch (err) {
      if (onError) onError(err);
    }
  });
}

// Real-time listener untuk transaksi dari Firestore
export function listenToTransactions(callback: (transactions: Transaction[]) => void, onError?: (error: any) => void) {
  const txCol = collection(db, "transactions");
  return onSnapshot(txCol, async (snapshot) => {
    const transactions: Transaction[] = [];
    snapshot.forEach((docSnap) => {
      transactions.push(docSnap.data() as Transaction);
    });

    // Update data terbaru ke IndexedDB lokal untuk dukungan offline
    try {
      await clearTransactions();
      for (const tx of transactions) {
        await saveTransaction(tx);
      }
    } catch (e) {
      console.warn("Gagal sinkronisasi transaksi snapshot ke IndexedDB lokal:", e);
    }

    callback(transactions);
  }, (error) => {
    console.error("Gagal sinkronisasi real-time transaksi dari Firestore:", error);
    try {
      handleFirestoreError(error, OperationType.LIST, "transactions");
    } catch (err) {
      if (onError) onError(err);
    }
  });
}
