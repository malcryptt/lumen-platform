"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Terminal, Zap, Shield, Cpu, Github, ExternalLink, User as UserIcon, LogOut } from 'lucide-react';
import AuthModal from '@/components/AuthModal';

export default function LandingPage() {
  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('lumen_user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  return (
    <div className="bg-[#0d1117] text-[#c9d1d9] min-h-screen font-sans">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto border-b border-[#30363d]">
        <div className="flex items-center space-x-2">
          <img src="/logo.png" alt="Lumen Logo" className="w-8 h-8 object-contain" />
          <span className="text-2xl font-bold text-white tracking-tight">Lumen</span>
        </div>
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
          <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
          <Link href="/packages" className="hover:text-white transition-colors">Packages</Link>
          <Link href="/copilot" className="text-cyan-400 hover:text-cyan-300 transition-colors font-bold flex items-center gap-1"><Zap size={14} /> Copilot</Link>
          <Link href="/benchmarks" className="hover:text-white transition-colors">Benchmarks</Link>
          <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="https://github.com/malcryptt/lumen-platform" className="text-[#8b949e] hover:text-white transition-colors">
            <Github size={20} />
          </Link>

          {user ? (
            <div className="flex items-center space-x-3 bg-[#161b22] border border-[#30363d] px-4 py-1.5 rounded-full">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                {user.username.slice(0, 2)}
              </div>
              <span className="text-xs font-bold text-white hidden lg:inline">{user.username}</span>
              <button
                onClick={() => {
                  localStorage.removeItem('lumen_user');
                  setUser(null);
                }}
                className="p-1 hover:text-red-400 transition-colors"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="text-[#8b949e] hover:text-white transition-colors text-sm font-bold"
            >
              Sign In
            </button>
          )}

          <Link href="/play" className="bg-[#238636] hover:bg-[#2ea043] text-white px-5 py-2 rounded-md font-bold text-sm transition-all shadow-md shadow-green-900/10">
            Try in Browser
          </Link>
        </div>
      </nav>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={setUser}
      />


      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-8 py-24 md:py-32 flex flex-col md:flex-row items-center justify-between gap-16">
        <div className="flex-1 space-y-8">
          <h2 className="text-5xl md:text-7xl font-extrabold text-white leading-tight">
            A fast, secure, <br />
            <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-green-400 bg-clip-text text-transparent">
              multipurpose language
            </span>
          </h2>
          <p className="text-xl text-[#8b949e] max-w-xl leading-relaxed">
            10–30x faster than Python. Built-in cryptography, anonymity, and AI.
            One language for everything from web servers to tensor math.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link href="/docs#cli" className="bg-white text-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-[#f0f0f0] transition-all flex items-center justify-center space-x-2">
              <span>Install Lumen</span>
            </Link>
            <Link href="/play" className="bg-[#21262d] text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-[#30363d] transition-all border border-[#30363d] flex items-center justify-center space-x-2">
              <span>Try the Web IDE</span>
            </Link>
          </div>
        </div>

        {/* Code Showcase Terminal */}
        <div className="flex-1 w-full max-w-2xl bg-[#161b22] rounded-xl border border-[#30363d] shadow-2xl overflow-hidden font-mono text-sm leading-relaxed">
          <div className="bg-[#21262d] px-4 py-2 border-b border-[#30363d] flex items-center justify-between">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
            </div>
            <span className="text-[#8b949e] text-xs">server.lm</span>
          </div>
          <div className="p-6 text-[#c9d1d9]">
            <div className="flex space-x-3">
              <span className="text-[#ff7b72]">import</span>
              <span className="text-[#a5d6ff]">pixel-web</span>
            </div>
            <div className="mt-2 flex space-x-3">
              <span className="text-[#ff7b72]">let</span>
              <span className="text-[#d2a8ff]">app</span>
              <span className="text-white">=</span>
              <span className="text-[#a5d6ff]">web.create_app()</span>
            </div>
            <div className="mt-4 text-[#8b949e]">-- Simple REST API</div>
            <div className="mt-1">
              <span className="text-[#ff7b72]">app.get</span>
              <span className="text-white">(</span>
              <span className="text-[#a5ff90]">"/greet/:name"</span>
              <span className="text-white">, </span>
              <span className="text-[#ff7b72]">fn</span>
              <span className="text-white">(req, res) {"{"}</span>
            </div>
            <div className="pl-6 mt-1">
              <span className="text-[#ff7b72]">return</span>
              <span className="text-[#a5ff90]">"Hello, {"{"}req.params.name{"}"}!"</span>
            </div>
            <div className="mt-1">
              <span className="text-white">{"}"})</span>
            </div>
            <div className="mt-4">
              <span className="text-[#ff7b72]">app.listen</span>
              <span className="text-white">(</span>
              <span className="text-[#79c0ff]">8080</span>
              <span className="text-white">)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-8 py-24 border-t border-[#30363d]">
        <div className="grid md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <Zap className="text-yellow-400" size={32} />
            <h3 className="text-xl font-bold text-white">Maximum Performance</h3>
            <p className="text-[#8b949e] leading-relaxed">
              JIT compiled with a high-performance VM. Outperforms major interpreted languages
              while maintaining developer productivity.
            </p>
          </div>
          <div className="space-y-4">
            <Shield className="text-blue-400" size={32} />
            <h3 className="text-xl font-bold text-white">Security by Design</h3>
            <p className="text-[#8b949e] leading-relaxed">
              Built-in cryptography and capability-based security model.
              Secure by default, audited for production readiness.
            </p>
          </div>
          <div className="space-y-4">
            <Cpu className="text-purple-400" size={32} />
            <h3 className="text-xl font-bold text-white">Built for AI</h3>
            <p className="text-[#8b949e] leading-relaxed">
              First-class support for tensors, ONNX models, and local LLM inference.
              Build AI applications without heavy C++ dependencies.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
