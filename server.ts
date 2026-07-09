import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "database.json");

app.use(express.json());

// Initialize database if it doesn't exist
function initDatabase() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
      if (data.products && data.products.length >= 10) {
        return;
      }
    } catch (e) {
      console.error("Error reading database, re-initializing...", e);
    }
  }

  const initialProducts = [
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

  const initialUsers = [
    {
      email: "meythadaning05@gmail.com",
      password: "meyta1234",
      nama: "Meytha Daning",
      role: "admin"
    },
    {
      email: "meythadaning05@gmail.com",
      password: "meyta123",
      nama: "Meytha Daning",
      role: "admin"
    }
  ];

  const db = {
    products: initialProducts,
    transactions: [],
    users: initialUsers
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
}

initDatabase();

function readData() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      initDatabase();
    }
    return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
  } catch (e) {
    console.error("Read error, returning defaults", e);
    return { products: [], transactions: [], users: [] };
  }
}

function writeData(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Write error", e);
  }
}

// REST API Endpoints

// Products API
app.get("/api/products", (req, res) => {
  const db = readData();
  res.json(db.products || []);
});

app.post("/api/products", (req, res) => {
  const db = readData();
  const newProduct = {
    id: req.body.id || `prod-${Date.now()}`,
    nama: req.body.nama || "Produk Baru",
    harga: Number(req.body.harga) || 0,
    stok: Number(req.body.stok) || 0,
    kategori: req.body.kategori || "Pakaian",
    urlGambar: req.body.urlGambar || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80",
    deskripsi: req.body.deskripsi || "",
    ukuran: req.body.ukuran || "All Size"
  };
  db.products.push(newProduct);
  writeData(db);
  res.status(201).json(newProduct);
});

app.put("/api/products/:id", (req, res) => {
  const db = readData();
  const { id } = req.params;
  const index = db.products.findIndex((p: any) => p.id === id);
  if (index !== -1) {
    db.products[index] = {
      ...db.products[index],
      nama: req.body.nama !== undefined ? req.body.nama : db.products[index].nama,
      harga: req.body.harga !== undefined ? Number(req.body.harga) : db.products[index].harga,
      stok: req.body.stok !== undefined ? Number(req.body.stok) : db.products[index].stok,
      kategori: req.body.kategori !== undefined ? req.body.kategori : db.products[index].kategori,
      urlGambar: req.body.urlGambar !== undefined ? req.body.urlGambar : db.products[index].urlGambar,
      deskripsi: req.body.deskripsi !== undefined ? req.body.deskripsi : db.products[index].deskripsi,
      ukuran: req.body.ukuran !== undefined ? req.body.ukuran : db.products[index].ukuran
    };
    writeData(db);
    res.json(db.products[index]);
  } else {
    res.status(404).json({ error: "Product not found" });
  }
});

app.delete("/api/products/:id", (req, res) => {
  const db = readData();
  const { id } = req.params;
  const filtered = db.products.filter((p: any) => p.id !== id);
  if (filtered.length !== db.products.length) {
    db.products = filtered;
    writeData(db);
    res.json({ success: true, message: "Product deleted" });
  } else {
    res.status(404).json({ error: "Product not found" });
  }
});

// Users API
app.get("/api/users", (req, res) => {
  const db = readData();
  // Don't leak passwords in real prod, but this is fine for simplified testing in this context
  res.json(db.users || []);
});

app.post("/api/users", (req, res) => {
  const db = readData();
  const { email, password, nama, role } = req.body;
  
  if (!email || !password || !nama) {
    return res.status(400).json({ error: "Email, password, and nama are required" });
  }

  // Check if user exists
  const existing = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    // If password matches, return it, otherwise error
    if (existing.password === password) {
      return res.json(existing);
    } else {
      return res.status(400).json({ error: "Email sudah terdaftar dengan password lain." });
    }
  }

  const newUser = {
    email: email.toLowerCase(),
    password,
    nama,
    role: role || "buyer"
  };

  db.users.push(newUser);
  writeData(db);
  res.status(201).json(newUser);
});

// Transactions API
app.get("/api/transactions", (req, res) => {
  const db = readData();
  res.json(db.transactions || []);
});

app.post("/api/transactions", (req, res) => {
  const db = readData();
  const newTransaction = {
    id: req.body.id || `trx-${Date.now()}`,
    tanggal: req.body.tanggal || new Date().toISOString(),
    totalHarga: Number(req.body.totalHarga) || 0,
    itemDibeli: req.body.itemDibeli || [],
    status: req.body.status || "Menunggu Pembayaran", // 'Menunggu Pembayaran' or 'Pembayaran Sukses'
    buyerName: req.body.buyerName || "Pelanggan Umum",
    buyerEmail: req.body.buyerEmail || "",
    buyerPhone: req.body.buyerPhone || ""
  };

  db.transactions.push(newTransaction);
  writeData(db);
  res.status(201).json(newTransaction);
});

// Update Transaction Status & Decrement Stock when Payment is Confirmed
app.put("/api/transactions/:id/confirm", (req, res) => {
  const db = readData();
  const { id } = req.params;
  const txIndex = db.transactions.findIndex((t: any) => t.id === id);

  if (txIndex !== -1) {
    const transaction = db.transactions[txIndex];
    
    // Only decrement stock if the status transitions to 'Pembayaran Sukses'
    if (transaction.status !== "Pembayaran Sukses") {
      transaction.status = "Pembayaran Sukses";
      
      // Decrement stock for purchased items
      transaction.itemDibeli.forEach((item: any) => {
        const prodIndex = db.products.findIndex((p: any) => p.id === item.id);
        if (prodIndex !== -1) {
          const currentStock = db.products[prodIndex].stok;
          db.products[prodIndex].stok = Math.max(0, currentStock - item.quantity);
        }
      });
      
      writeData(db);
      res.json({ success: true, transaction });
    } else {
      res.json({ success: true, message: "Transaction already paid", transaction });
    }
  } else {
    res.status(404).json({ error: "Transaction not found" });
  }
});

// Setup Vite Dev Server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
