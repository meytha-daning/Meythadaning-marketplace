import React, { useState } from "react";
import { Mail, Lock, User as UserIcon, Sparkles } from "lucide-react";
import { User } from "../types";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth, googleProvider } from "../firebase";
import { signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { handleFirestoreError, OperationType } from "../dbService";

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
}

const formatAuthError = (err: any): string => {
  const errMsg = err?.message || String(err);
  const errCode = err?.code;
  
  if (
    errCode === "auth/unauthorized-domain" ||
    errMsg.includes("auth/unauthorized-domain") ||
    errMsg.includes("unauthorized domain") ||
    errMsg.includes("authorized domain")
  ) {
    return "Login dengan Google diblokir oleh Firebase karena domain web ini belum terdaftar di Authorized Domains pada Firebase Console Anda.\n\n" +
           "Cara Mengatasinya:\n" +
           "1. Buka Firebase Console Anda -> Klik \"Authentication\" -> Pilih tab \"Settings\" -> Klik \"Authorized domains\".\n" +
           "2. Klik tombol \"Add domain\" lalu masukkan domain berikut:\n" +
           `👉 ${window.location.hostname}\n\n` +
           "💡 Sebagai alternatif, Anda tetap dapat mendaftar & masuk dengan cepat menggunakan formulir \"Alamat Email\" dan \"Kata Sandi\" di atas!";
  }
  return errMsg || "Gagal masuk menggunakan Akun Google.";
};

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nama, setNama] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Check for Google Sign-In redirect result on mount
  React.useEffect(() => {
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          setIsLoading(true);
          const user = result.user;
          if (user.email) {
            const emailLower = user.email.toLowerCase();
            const userRef = doc(db, "users", emailLower);
            
            let userSnap;
            try {
              userSnap = await getDoc(userRef);
            } catch (err: any) {
              handleFirestoreError(err, OperationType.GET, `users/${emailLower}`);
              throw err;
            }

            let userData;
            if (userSnap.exists()) {
              const existingData = userSnap.data();
              userData = {
                email: emailLower,
                nama: existingData.nama || user.displayName || "Pelanggan B&F",
                role: (existingData.role === "admin" ? "admin" : "buyer") as "admin" | "buyer"
              };
            } else {
              userData = {
                email: emailLower,
                nama: user.displayName || "Pelanggan B&F",
                role: "buyer" as const
              };
              try {
                await setDoc(userRef, userData);
              } catch (err: any) {
                handleFirestoreError(err, OperationType.WRITE, `users/${emailLower}`);
                throw err;
              }
            }

            onLoginSuccess({
              email: userData.email,
              nama: userData.nama,
              role: userData.role
            });
          }
        }
      } catch (err: any) {
        console.error("Error getting redirect result:", err);
        setError(formatAuthError(err));
      } finally {
        setIsLoading(false);
      }
    };
    checkRedirect();
  }, [onLoginSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const emailLower = email.toLowerCase();
      if (isRegister) {
        // Register flow via Firestore
        const userRef = doc(db, "users", emailLower);
        let userSnap;
        try {
          userSnap = await getDoc(userRef);
        } catch (err: any) {
          handleFirestoreError(err, OperationType.GET, `users/${emailLower}`);
          throw err;
        }
        
        if (userSnap.exists()) {
          throw new Error("Email sudah terdaftar. Silakan login.");
        }

        const userData = {
          email: emailLower,
          password,
          nama: nama || email.split("@")[0],
          role: "buyer" as const
        };

        try {
          await setDoc(userRef, userData);
        } catch (err: any) {
          handleFirestoreError(err, OperationType.WRITE, `users/${emailLower}`);
          throw err;
        }
        onLoginSuccess({
          email: userData.email,
          nama: userData.nama,
          role: userData.role
        });
      } else {
        // Login flow via Firestore
        // Admin override
        if (emailLower === "meythadaning05@gmail.com" && (password === "meyta123" || password === "meyta1234")) {
          onLoginSuccess({
            email: "meythadaning05@gmail.com",
            nama: "Meytha Daning",
            role: "admin",
          });
          return;
        }

        const userRef = doc(db, "users", emailLower);
        let userSnap;
        try {
          userSnap = await getDoc(userRef);
        } catch (err: any) {
          handleFirestoreError(err, OperationType.GET, `users/${emailLower}`);
          throw err;
        }

        if (userSnap.exists()) {
          const userData = userSnap.data();
          if (userData.password === password) {
            onLoginSuccess({
              email: userData.email,
              nama: userData.nama,
              role: (userData.role === "admin" ? "admin" : "buyer") as "admin" | "buyer"
            });
            return;
          } else {
            throw new Error("Password salah. Silakan coba lagi.");
          }
        } else {
          // Jika user tidak ditemukan, lakukan auto-register agar proses checkout lancar bagi pembeli baru
          const userData = {
            email: emailLower,
            password,
            nama: email.split("@")[0],
            role: "buyer" as const
          };
          try {
            await setDoc(userRef, userData);
          } catch (err: any) {
            handleFirestoreError(err, OperationType.WRITE, `users/${emailLower}`);
            throw err;
          }
          onLoginSuccess({
            email: userData.email,
            nama: userData.nama,
            role: userData.role
          });
        }
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan sistem.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminQuickLogin = () => {
    setEmail("meythadaning05@gmail.com");
    setPassword("meyta123");
    setIsRegister(false);
    setError("");
  };

  const handleGoogleLogin = async () => {
    setError("");
    setIsLoading(true);
    try {
      // Check if user is on mobile or if we are embedded in an iframe
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isIframe = window.self !== window.top;

      if (isMobile && !isIframe) {
        // Use redirect on mobile for a smoother experience without popup blocking
        await signInWithRedirect(auth, googleProvider);
      } else {
        // Try popup on desktop or in iframe
        try {
          const result = await signInWithPopup(auth, googleProvider);
          const user = result.user;
          if (!user || !user.email) {
            throw new Error("Gagal mendapatkan email dari Akun Google.");
          }

          const emailLower = user.email.toLowerCase();
          const userRef = doc(db, "users", emailLower);
          
          let userSnap;
          try {
            userSnap = await getDoc(userRef);
          } catch (err: any) {
            handleFirestoreError(err, OperationType.GET, `users/${emailLower}`);
            throw err;
          }

          let userData;
          if (userSnap.exists()) {
            const existingData = userSnap.data();
            userData = {
              email: emailLower,
              nama: existingData.nama || user.displayName || "Pelanggan B&F",
              role: (existingData.role === "admin" ? "admin" : "buyer") as "admin" | "buyer"
            };
          } else {
            userData = {
              email: emailLower,
              nama: user.displayName || "Pelanggan B&F",
              role: "buyer" as const
            };
            try {
              await setDoc(userRef, userData);
            } catch (err: any) {
              handleFirestoreError(err, OperationType.WRITE, `users/${emailLower}`);
              throw err;
            }
          }

          onLoginSuccess({
            email: userData.email,
            nama: userData.nama,
            role: userData.role
          });
        } catch (popupErr: any) {
          console.warn("Popup blocked or failed, trying redirect fallback:", popupErr);
          // If popup is blocked or fails, fall back to redirect if not in iframe
          if (!isIframe) {
            await signInWithRedirect(auth, googleProvider);
          } else {
            throw new Error(
              "Popup masuk Google diblokir oleh browser Anda. Silakan buka aplikasi ini di tab baru (bukan di dalam frame preview) untuk masuk menggunakan Google."
            );
          }
        }
      }
    } catch (err: any) {
      console.error("Google login error:", err);
      setError(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="login-container" className="min-h-screen bg-rose-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center gap-2 text-rose-600">
          <Sparkles className="w-8 h-8 animate-pulse text-rose-500" />
          <span className="font-serif text-3xl font-bold tracking-widest text-slate-800">B&F CHIC</span>
        </div>
        <h2 className="mt-2 text-center text-sm font-sans tracking-widest uppercase text-rose-500 font-semibold">
          Boutique & Beauty
        </h2>
        <h3 className="mt-4 text-center text-xl font-serif text-slate-700">
          {isRegister ? "Buat Akun Pelanggan Baru" : "Masuk ke Akun Anda"}
        </h3>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-2xl border border-rose-100 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div id="login-error" className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100 whitespace-pre-line leading-relaxed">
                {error}
              </div>
            )}

            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 text-sm placeholder-slate-400"
                    placeholder="Contoh: Cantika Putri"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Alamat Email</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 text-sm placeholder-slate-400"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Kata Sandi (Password)</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 text-sm placeholder-slate-400"
                  placeholder="Min. 6 karakter"
                />
              </div>
            </div>

            <div>
              <button
                id="submit-auth-btn"
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 cursor-pointer transition-colors"
              >
                {isLoading ? "Memproses..." : isRegister ? "Daftar Akun Baru" : "Masuk"}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-y-0 flex items-center w-full">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">Atau masuk dengan</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3">
              <button
                id="google-login-btn"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 rounded-xl bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 cursor-pointer transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.516 5.516 0 0 1 8.5 13a5.516 5.516 0 0 1 5.49-5.514c2.25 0 3.882.91 4.717 1.714l3.195-3.195C19.96 4.135 17.15 3 14 3 8.477 3 4 7.477 4 13s4.477 10 10 10c6.104 0 9.873-4.305 9.873-10a9.23 9.23 0 0 0-.14-1.715H12.24z"
                  />
                </svg>
                Masuk dengan Google
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center justify-center gap-4 text-xs">
            <button
              id="switch-auth-mode-btn"
              onClick={() => {
                setIsRegister(!isRegister);
                setError("");
              }}
              className="text-rose-600 hover:text-rose-700 font-medium hover:underline focus:outline-none"
            >
              {isRegister ? "Sudah punya akun? Masuk di sini" : "Belum punya akun? Daftar gratis sekarang"}
            </button>

            <div className="border-t border-rose-50 w-full my-1"></div>

            <button
              id="admin-quick-login-btn"
              onClick={handleAdminQuickLogin}
              className="text-slate-500 hover:text-rose-600 font-semibold transition-colors"
            >
              Uji Coba Cepat sebagai Admin B&F Boutique 👩‍💼
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
