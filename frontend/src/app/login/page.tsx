'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { UserCircleIcon, KeyIcon, EnvelopeIcon, SparklesIcon } from '@heroicons/react/24/solid';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true); // Controla se é Login ou Cadastro
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Dados do formulário
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const baseUrl = "http://127.0.0.1:8000";
    
    try {
      if (isLogin) {
        // --- LÓGICA DE LOGIN ---
        const res = await fetch(`${baseUrl}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: formData.username, password: formData.password }),
        });

        const data = await res.json();
        
        if (!res.ok) throw new Error(data.detail || "Erro ao entrar");

        // Salva o token no navegador (Memória do Usuário)
        localStorage.setItem("anihub_token", data.access_token);
        localStorage.setItem("anihub_user", data.username);
        
        router.push("/"); // Manda de volta pra Home
      } else {
        // --- LÓGICA DE CADASTRO ---
        const res = await fetch(`${baseUrl}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.detail || "Erro ao criar conta");

        setSuccess("Conta criada com sucesso! Faça login agora.");
        setIsLogin(true); // Muda para a aba de login automaticamente
        setFormData({ username: "", email: "", password: "" });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Fundo Decorativo */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://wallpapers.com/images/hd/anime-scenery-1920-x-1080-36962.jpg')] bg-cover opacity-20 blur-sm z-0"></div>
      
      <div className="z-10 w-full max-w-md bg-gray-800/80 backdrop-blur-xl p-8 rounded-3xl border border-gray-700 shadow-2xl animate-fade-in-up">
        
        {/* CABEÇALHO */}
        <div className="text-center mb-8">
            <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
                AniHub
            </h1>
            <p className="text-gray-400">Sua jornada otaku começa aqui.</p>
        </div>

        {/* ABAS (LOGIN / CADASTRO) */}
        <div className="flex bg-gray-900/50 p-1 rounded-xl mb-6">
            <button 
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isLogin ? 'bg-gray-700 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
            >
                Entrar
            </button>
            <button 
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isLogin ? 'bg-purple-600 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
            >
                Criar Conta
            </button>
        </div>

        {/* MENSAGENS DE ERRO/SUCESSO */}
        {error && <div className="bg-red-500/20 border border-red-500/50 text-red-200 text-sm p-3 rounded-lg mb-4 text-center">{error}</div>}
        {success && <div className="bg-green-500/20 border border-green-500/50 text-green-200 text-sm p-3 rounded-lg mb-4 text-center">{success}</div>}

        {/* FORMULÁRIO */}
        <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="relative">
                <UserCircleIcon className="w-5 h-5 absolute left-3 top-3.5 text-gray-500" />
                <input 
                    type="text" 
                    name="username"
                    placeholder="Nome de Usuário"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full bg-gray-900/50 border border-gray-600 rounded-xl py-3 pl-10 pr-4 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                />
            </div>

            {!isLogin && (
                <div className="relative animate-fade-in">
                    <EnvelopeIcon className="w-5 h-5 absolute left-3 top-3.5 text-gray-500" />
                    <input 
                        type="email" 
                        name="email"
                        placeholder="Seu Email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-gray-900/50 border border-gray-600 rounded-xl py-3 pl-10 pr-4 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                    />
                </div>
            )}

            <div className="relative">
                <KeyIcon className="w-5 h-5 absolute left-3 top-3.5 text-gray-500" />
                <input 
                    type="password" 
                    name="password"
                    placeholder="Senha Secreta"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-gray-900/50 border border-gray-600 rounded-xl py-3 pl-10 pr-4 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                />
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 rounded-xl shadow-lg transform active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
                {loading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                ) : (
                    isLogin ? "Acessar Portal" : "Cadastrar Agora"
                )}
            </button>

        </form>

        <p className="text-center text-gray-500 text-xs mt-6">
            Ao continuar, você concorda em maratonar animes o dia todo.
        </p>

      </div>
    </main>
  );
}