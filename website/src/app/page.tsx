"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Terminal, Zap, Shield, Cpu, Github, ExternalLink,
  User as UserIcon, LogOut, HelpCircle, ChevronRight,
  ArrowRight, Check, Activity, BarChart3, Globe,
  Lock, Binary, Workflow, FlaskConical, Code2, Users, Server
} from 'lucide-react';
import AuthModal from '@/components/AuthModal';
import HelpModal from '@/components/HelpModal';

export default function LandingPage() {
  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('web');

  useEffect(() => {
    const storedUser = localStorage.getItem('lumen_user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const codeSnippets = {
    web: `import pixel-web

let app = web.create_app()

app.get("/greet/:name", fn(req, res) {
    return "Hello, {req.params.name}!"
})

-- Fast, native, zero-config
app.listen(8080)`,
    crypto: `import crypto
import capability

-- Enable network but block file system
capability.enable("net.server")
capability.disable("fs.write")

let secret = "Top Secret"
let hashed = crypto.sha256(secret)

print("SHA256: " .. hashed)`,
    ai: `import tensor as ts

-- First-class tensor operations
let a = ts.matrix([[1, 2], [3, 4]])
let b = ts.matrix([[5, 6], [7, 8]])

-- Native matrix multiply (@)
let result = a @ b

print("Result: " .. ts.to_string(result))`
  };

  return (
    <div className="bg-[#03060b] text-[#c9d1d9] min-h-screen font-sans selection:bg-cyan-500/30">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light" />
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-[60] backdrop-blur-md bg-[#03060b]/80 border-b border-white/5 px-6 lg:px-12 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2 group">
              <img src="/logo.png" alt="Lumen Logo" className="w-8 h-8 object-contain group-hover:scale-110 transition-transform drop-shadow-md" />
              <span className="text-xl font-black text-white tracking-tighter uppercase italic">Lumen</span>
            </Link>
            <div className="hidden lg:flex items-center gap-8 text-[13px] font-semibold tracking-wide uppercase text-[#8b949e]">
              <Link href="/docs" className="hover:text-cyan-400 transition-colors">Docs</Link>
              <Link href="/packages" className="hover:text-cyan-400 transition-colors">Packages</Link>
              <Link href="/copilot" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5"><Zap size={14} className="text-yellow-400" /> Copilot</Link>
              <Link href="/benchmarks" className="hover:text-cyan-400 transition-colors">Benchmarks</Link>
              <Link href="/blog" className="hover:text-cyan-400 transition-colors">Blog</Link>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-4 border-r border-white/10 pr-6">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#161b22] border border-white/10 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                    {user.username.slice(0, 2)}
                  </div>
                  <button onClick={() => { localStorage.removeItem('lumen_user'); setUser(null); }} className="text-[#8b949e] hover:text-red-400 transition-colors"><LogOut size={16} /></button>
                </div>
              ) : (
                <button onClick={() => setIsAuthModalOpen(true)} className="text-[13px] font-bold text-white hover:text-cyan-400 transition-colors uppercase tracking-widest">Sign In</button>
              )}
            </div>
            <Link href="/play" className="bg-white text-black px-5 py-2 rounded-full text-[13px] font-black uppercase tracking-tighter hover:bg-cyan-400 hover:text-black transition-all shadow-xl shadow-cyan-500/10">
              Try in Browser
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative z-10 pt-24 pb-32 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-8 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400">v0.4 — Now with AI stdlib</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-8 leading-[0.9]">
            A fast, secure, <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent italic">
              multipurpose language
            </span>
          </h1>

          <p className="text-xl text-[#8b949e] max-w-2xl mx-auto leading-relaxed mb-12 font-medium">
            Built for systems programmers, backend engineers, security researchers, and AI developers who refuse to compromise. One language. Every layer of the stack.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 animate-slide-up">
            <Link href="/docs" className="group relative bg-white text-black px-10 py-5 rounded-sm font-black uppercase tracking-tighter text-lg hover:bg-cyan-400 transition-all w-full sm:w-auto overflow-hidden">
              <span className="relative z-10 flex items-center gap-3">Install Lumen <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></span>
            </Link>
            <Link href="/play" className="bg-[#161b22] text-white px-10 py-5 rounded-sm font-black uppercase tracking-tighter text-lg border border-white/5 hover:bg-[#21262d] hover:border-white/20 transition-all w-full sm:w-auto">
              Try the Web IDE
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto pt-10 border-t border-white/5">
            {[
              { label: 'Performance', value: '10–30x faster', sub: 'than Python' },
              { label: 'Security', value: '5 built-in', sub: 'security primitives' },
              { label: 'Runtime', value: '0 runtime', sub: 'dependencies' }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#484f58] mb-1">{stat.label}</div>
                <div className="text-2xl font-black text-white tracking-tighter">{stat.value}</div>
                <div className="text-sm text-[#8b949e]">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* SECTION 1 — WHY LUMEN */}
      <section className="relative z-10 py-32 px-6 border-t border-white/5 bg-[#03060b]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest mb-6">The problem</div>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight mb-8">
              You shouldn't need five languages <br className="hidden md:block" /> to build one system.
            </h2>
            <div className="prose prose-invert max-w-none text-[#8b949e] space-y-6 text-lg font-medium leading-relaxed">
              <p>
                Python for AI. Go for servers. C for performance. Bash for scripting. A different tool for every layer — each with its own ecosystem, its own quirks, and its own security model.
              </p>
              <p>
                Lumen collapses that stack into one language that is fast enough for systems work, expressive enough for AI, and secure enough for cryptography. No compromises. No glue code.
              </p>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-transparent blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-[#0d1117] p-8 rounded-2xl border border-white/5 shadow-2xl">
              <div className="flex gap-4 mb-8">
                {['py', 'go', 'c', 'sh'].map(tag => (
                  <div key={tag} className="w-12 h-12 rounded-lg bg-[#161b22] border border-white/5 flex items-center justify-center font-bold text-[#484f58] uppercase text-xs">{tag}</div>
                ))}
              </div>
              <div className="h-[2px] w-full bg-white/5 mb-8 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-cyan-500 text-black px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">Collapsed by Lumen</div>
              </div>
              <div className="flex items-center gap-4">
                <img src="/logo.png" alt="Lumen Logo" className="w-16 h-16 object-contain drop-shadow-[0_10px_15px_rgba(6,182,212,0.2)]" />
                <div className="space-y-1">
                  <div className="text-white font-bold tracking-tight">One toolchain. One mental model.</div>
                  <div className="text-sm text-cyan-400">Integrated Everywhere</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — FEATURES */}
      <section className="relative z-10 py-32 px-6 bg-[#060a12]/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <Lock className="text-cyan-400" />, title: 'Built-in Cryptography', body: 'SHA256, AES, and more are first-class stdlib calls. No third-party libraries. No version drift. Cryptographic primitives ship with the language.' },
              { icon: <Shield className="text-blue-500" />, title: 'Capability-Based Security', body: 'Control exactly what your program can access at runtime. Enable or disable net, io, and ffi per module. Security is structural, not bolted on.' },
              { icon: <Binary className="text-purple-500" />, title: 'Native Binary Compilation', body: 'Lumen compiles to native binaries. No interpreter overhead. No VM warmup. Ship a single executable that runs anywhere.' },
              { icon: <Workflow className="text-green-400" />, title: 'Pipeline Operator', body: 'Chain transformations with |>. Write data flows that read like sentences. Less nesting, more clarity.' },
              { icon: <Cpu className="text-blue-400" />, title: 'AI & Tensor Stdlib', body: 'Tensor operations, model inference, and vector math built into the standard library. No Python bridge required.' },
              { icon: <Activity className="text-cyan-500" />, title: 'Multipurpose by Design', body: 'Web servers, CLI tools, security tooling, tensor math — one language, one toolchain, one mental model across your entire stack.' }
            ].map((f, i) => (
              <div key={i} className="group p-8 rounded-2xl bg-[#0d1117]/50 border border-white/5 hover:border-cyan-500/20 hover:bg-[#0d1117] transition-all flex flex-col gap-6">
                <div className="w-12 h-12 rounded-xl bg-[#161b22] flex items-center justify-center group-hover:scale-110 group-hover:bg-cyan-500/10 transition-all">
                  {f.icon}
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-white tracking-tight">{f.title}</h3>
                  <p className="text-[#8b949e] leading-relaxed text-sm font-medium">{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3 — CODE SHOWCASE */}
      <section className="relative z-10 py-32 px-6 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 text-[10px] font-bold uppercase tracking-widest mb-6">See it in action</div>
            <h2 className="text-5xl font-black text-white tracking-tighter mb-4">Clean syntax. Real power.</h2>
          </div>

          <div className="grid lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-4 space-y-4">
              {[
                { id: 'web', label: 'Web Server', icon: <Globe size={18} /> },
                { id: 'crypto', label: 'Cryptography', icon: <Lock size={18} /> },
                { id: 'ai', label: 'AI / Tensor', icon: <Cpu size={18} /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl border transition-all text-left ${activeTab === tab.id
                    ? 'bg-white text-black border-white shadow-lg shadow-white/5'
                    : 'bg-[#0d1117] text-[#8b949e] border-white/5 hover:border-white/20'
                    }`}
                >
                  {tab.icon}
                  <span className="font-bold tracking-tight">{tab.label}</span>
                  {activeTab === tab.id && <ArrowRight size={18} className="ml-auto" />}
                </button>
              ))}
              <div className="pt-6">
                <p className="text-sm text-[#484f58] leading-relaxed italic">
                  Lumen reads like a high-level language and runs like a systems language. The pipeline operator, first-class crypto, and capability model are not libraries — they are part of the language.
                </p>
              </div>
            </div>

            <div className="lg:col-span-8">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200" />
                <div className="relative bg-[#161b22] rounded-xl border border-white/10 shadow-2xl overflow-hidden font-mono text-[15px] leading-relaxed">
                  <div className="bg-[#21262d] px-4 py-3 border-b border-white/5 flex items-center justify-between">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                      <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                      <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                    </div>
                    <span className="text-[#8b949e] text-xs font-semibold tracking-widest uppercase">
                      {activeTab === 'web' ? 'server.lm' : activeTab === 'crypto' ? 'secure_module.lm' : 'ml_model.lm'}
                    </span>
                  </div>
                  <div className="p-8 text-[#c9d1d9] min-h-[300px]">
                    <pre className="whitespace-pre-wrap">
                      {codeSnippets[activeTab as keyof typeof codeSnippets]}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — BENCHMARKS */}
      <section className="relative z-10 py-32 px-6 bg-[#03060b]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between gap-12 lg:items-end mb-20">
            <div className="max-w-2xl">
              <div className="inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-bold uppercase tracking-widest mb-6">Performance</div>
              <h2 className="text-5xl font-black text-white tracking-tighter mb-6">Fast is not a feature. <br />It's a requirement.</h2>
              <p className="text-xl text-[#8b949e] font-medium leading-relaxed">
                Lumen compiles to native binaries with zero runtime overhead. Benchmarked against Python 3.12, Node.js 20, and Go 1.22 on equivalent workloads.
              </p>
            </div>
            <div className="text-[#484f58] text-[11px] uppercase tracking-widest font-bold border-l border-white/5 pl-8 py-2 italic whitespace-pre-wrap">
              Benchmarks run on Ubuntu 24.04, <br />Intel i7-12700, 16GB RAM. <br />Full methodology on GitHub.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                label: 'HTTP throughput',
                metric: 'req/sec',
                desc: 'Lumen vs Node.js vs Go',
                data: [
                  { name: 'Lumen', val: 98, color: 'bg-cyan-400' },
                  { name: 'Go', val: 92, color: 'bg-[#00add8]' },
                  { name: 'Node.js', val: 65, color: 'bg-green-500' }
                ]
              },
              {
                label: 'Cryptographic hashing',
                metric: 'ms',
                desc: 'SHA256, 1M ops (Lower is better)',
                data: [
                  { name: 'Lumen', val: 12, color: 'bg-cyan-400' },
                  { name: 'Go', val: 14, color: 'bg-[#00add8]' },
                  { name: 'Python', val: 180, color: 'bg-blue-600' }
                ]
              },
              {
                label: 'Tensor operations',
                metric: 'GFLOPS',
                desc: 'matrix multiply, 1024x1024',
                data: [
                  { name: 'Lumen', val: 850, max: 1000, color: 'bg-cyan-400' },
                  { name: 'NumPy', val: 790, max: 1000, color: 'bg-blue-300' },
                  { name: 'Python (Pure)', val: 2, max: 1000, color: 'bg-gray-700' }
                ]
              }
            ].map((b, i) => (
              <div key={i} className="bg-[#0d1117] p-8 rounded-2xl border border-white/5 flex flex-col justify-between group">
                <div className="mb-10">
                  <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-2">{b.label}</div>
                  <div className="text-[#8b949e] text-xs font-semibold">{b.desc}</div>
                </div>
                <div className="space-y-6">
                  {b.data.map((d, j) => {
                    const max = Math.max(...b.data.map(x => x.val));
                    const width = (d.val / max) * 100;
                    return (
                      <div key={j} className="space-y-2">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                          <span className={d.name === 'Lumen' ? 'text-white' : 'text-[#484f58]'}>{d.name}</span>
                          <span className="text-white">{d.val}</span>
                        </div>
                        <div className="h-2 w-full bg-[#161b22] rounded-full overflow-hidden">
                          <div className={`h-full ${d.color} group-hover:brightness-110 transition-all`} style={{ width: `${width}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5 — WHO IT'S FOR */}
      <section className="relative z-10 py-32 px-6 bg-[#060a12]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-block px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold uppercase tracking-widest mb-6">Built for</div>
            <h2 className="text-6xl font-black text-white tracking-tighter">Every kind of builder. One language.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                role: 'Systems Developers',
                text: 'If you write C, C++, or Rust — Lumen gives you native performance with a syntax that does not fight you. Built-in security primitives mean your tooling is hardened by default.',
                icon: <Code2 />
              },
              {
                role: 'Backend Engineers',
                text: "Coming from Node, Python, or Go? Lumen's web stdlib handles routing, middleware, and HTTP natively. Deploy with the Lumen Copilot in minutes.",
                icon: <Server />
              },
              {
                role: 'Security Researchers',
                text: 'Cryptography, capability isolation, and anonymity primitives are first-class. Build offensive and defensive tooling in the same language you use for everything else.',
                icon: <Shield />
              },
              {
                role: 'AI & ML Engineers',
                text: 'Tensor math, model inference, and vector operations without leaving the language. No Python bridge. No NumPy dependency. Native speed.',
                icon: <Cpu size={20} />
              }
            ].map((a, i) => (
              <div key={i} className="bg-[#0d1117] p-8 rounded-2xl border border-white/5 flex flex-col gap-8 hover:-translate-y-2 transition-transform h-full">
                <div className="w-10 h-10 rounded-lg bg-[#161b22] flex items-center justify-center text-cyan-400">
                  {a.icon}
                </div>
                <div className="flex flex-col gap-4">
                  <h3 className="text-lg font-black text-white tracking-tight uppercase italic">{a.role}</h3>
                  <p className="text-sm text-[#8b949e] leading-relaxed font-medium">
                    {a.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 — LUMEN COPILOT CTA */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-700 rounded-3xl blur-[100px] opacity-20" />
            <div className="relative bg-[#0d1117] border border-white/10 p-12 md:p-20 rounded-3xl overflow-hidden">
              <div className="absolute top-0 right-0 p-8">
                <Zap size={120} className="text-white/5 -rotate-12 translate-x-1/4 -translate-y-1/4" />
              </div>
              <div className="max-w-2xl relative z-10">
                <div className="inline-block px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] font-bold uppercase tracking-widest mb-8">Deploy</div>
                <h2 className="text-5xl font-black text-white tracking-tighter mb-8 leading-none">Built something? <br className="hidden md:block" />Ship it.</h2>
                <p className="text-xl text-[#8b949e] font-medium leading-relaxed mb-12">
                  Lumen Copilot scans your repo, generates a deploy config in Lumen's own config syntax, and pushes it to a live cloud service. No YAML. No Dockerfile. No DevOps degree required.
                </p>
                <Link href="/copilot" className="inline-flex items-center gap-4 bg-cyan-400 text-black px-10 py-5 rounded-sm font-black uppercase tracking-tighter text-lg hover:bg-white transition-all">
                  Try Lumen Copilot <ArrowRight size={24} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7 — COMMUNITY */}
      <section className="relative z-10 py-32 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <div className="inline-block px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-bold uppercase tracking-widest mb-6">Open source</div>
              <h2 className="text-5xl font-black text-white tracking-tighter mb-8 italic">Join the people <br />building with Lumen.</h2>
              <p className="text-xl text-[#8b949e] font-medium leading-relaxed mb-12">
                Lumen is open source and actively developed. The community lives on Discord — ask questions, share projects, report bugs, and shape the language's direction.
              </p>
              <div className="flex flex-wrap gap-8 items-center text-sm font-black uppercase tracking-widest">
                <Link href="https://github.com" className="flex items-center gap-2 hover:text-white transition-colors"><Github size={20} /> GitHub</Link>
                <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                <Link href="https://discord.com" className="flex items-center gap-2 hover:text-white transition-colors text-blue-400 font-black"><Globe size={20} /> Discord</Link>
                <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                <Link href="/docs" className="flex items-center gap-2 hover:text-white transition-colors">Docs</Link>
                <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                <Link href="/packages" className="flex items-center gap-2 hover:text-white transition-colors">Packages</Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'GitHub Stars', value: '4.2k' },
                { label: 'Discord Members', value: '1,850' },
                { label: 'Packages Published', value: '142' },
                { label: 'Contributors', value: '28' }
              ].map((s, i) => (
                <div key={i} className="bg-[#0d1117] p-8 rounded-2xl border border-white/5 text-center">
                  <div className="text-3xl font-black text-white tracking-tighter mb-1">{s.value}</div>
                  <div className="text-[10px] font-bold text-[#484f58] uppercase tracking-widest">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 py-20 px-6 border-t border-white/5 bg-[#03060b]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 mb-20">
            <div className="col-span-full lg:col-span-2 space-y-8">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="Lumen Logo" className="w-8 h-8 object-contain drop-shadow-md" />
                <span className="text-xl font-black text-white tracking-tighter uppercase italic">Lumen</span>
              </div>
              <p className="text-sm text-[#8b949e] font-medium max-w-xs leading-relaxed">
                A fast, secure, multipurpose language built for the future of systems and AI.
              </p>
            </div>

            <div className="space-y-6">
              <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Language</h4>
              <ul className="space-y-4 text-sm font-medium text-[#8b949e]">
                <li><Link href="/docs" className="hover:text-cyan-400 transition-colors">Docs</Link></li>
                <li><Link href="/benchmarks" className="hover:text-cyan-400 transition-colors">Benchmarks</Link></li>
                <li><Link href="/changelog" className="hover:text-cyan-400 transition-colors">Changelog</Link></li>
                <li><Link href="/roadmap" className="hover:text-cyan-400 transition-colors">Roadmap</Link></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Platform</h4>
              <ul className="space-y-4 text-sm font-medium text-[#8b949e]">
                <li><Link href="/copilot" className="hover:text-cyan-400 transition-colors">Copilot</Link></li>
                <li><Link href="/packages" className="hover:text-cyan-400 transition-colors">Packages</Link></li>
                <li><Link href="/play" className="hover:text-cyan-400 transition-colors">Playground</Link></li>
                <li><Link href="/status" className="hover:text-cyan-400 transition-colors">Status</Link></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Community</h4>
              <ul className="space-y-4 text-sm font-medium text-[#8b949e]">
                <li><Link href="https://discord.com" className="hover:text-cyan-400 transition-colors">Discord</Link></li>
                <li><Link href="https://github.com" className="hover:text-cyan-400 transition-colors">GitHub</Link></li>
                <li><Link href="/blog" className="hover:text-cyan-400 transition-colors">Blog</Link></li>
                <li><Link href="/contributing" className="hover:text-cyan-400 transition-colors">Contributing</Link></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between pt-10 border-t border-white/5 gap-6">
            <div className="text-[11px] font-bold text-[#484f58] uppercase tracking-widest whitespace-nowrap">
              © 2025 Lumen · Built by mal4crypt · MIT License
            </div>
            <div className="flex gap-8">
              <Link href="/privacy" className="text-[11px] font-bold text-[#484f58] uppercase tracking-widest hover:text-cyan-400 transition-colors">Privacy</Link>
              <Link href="/terms" className="text-[11px] font-bold text-[#484f58] uppercase tracking-widest hover:text-cyan-400 transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={setUser}
      />

      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }
        .animate-slide-up {
          animation: slide-up 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
