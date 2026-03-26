"use client";
import React from 'react';
import { BookOpen, Terminal, Box, Cloud, Code } from 'lucide-react';

export default function DocsPage() {
    return (
        <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] font-sans selection:bg-[#388bfd33]">
            {/* Header */}
            <header className="border-b border-[#30363d] bg-[#161b22]/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <img src="/logo.png" alt="Lumen Logo" className="w-8 h-8" />
                        <span className="text-xl font-bold text-white tracking-tight">Lumen Platform</span>
                    </div>
                    <nav className="flex items-center space-x-8 text-sm font-medium">
                        <a href="/" className="hover:text-blue-400 transition-colors">Home</a>
                        <a href="/play" className="hover:text-blue-400 transition-colors">Playground</a>
                        <a href="/docs" className="text-blue-400">Docs</a>
                        <a href="https://github.com/malcryptt/lumen-platform" className="hover:text-blue-400 transition-colors">GitHub</a>
                    </nav>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-6 py-12 flex">
                {/* Sidebar */}
                <aside className="w-64 pr-12 hidden lg:block border-r border-[#30363d]">
                    <div className="space-y-8">
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-[#8b949e] mb-4">Getting Started</h4>
                            <ul className="space-y-3 text-sm">
                                <li><a href="#introduction" className="text-blue-400 font-medium">Introduction</a></li>
                                <li><a href="#quick-start" className="hover:text-white transition-colors">Quick Start</a></li>
                                <li><a href="#cli" className="hover:text-white transition-colors">CLI Installation</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-[#8b949e] mb-4">Concepts</h4>
                            <ul className="space-y-3 text-sm">
                                <li><a href="#syntax" className="hover:text-white transition-colors">Language Syntax</a></li>
                                <li><a href="#package-manager" className="hover:text-white transition-colors">Registry & Packages</a></li>
                            </ul>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 lg:pl-12 max-w-3xl">
                    <section id="introduction" className="mb-16">
                        <h1 className="text-4xl font-extrabold text-white mb-6">Introduction</h1>
                        <p className="text-lg text-[#8b949e] leading-relaxed mb-6">
                            Lumen is a high-performance, concurrent programming language designed for modern cloud architectures.
                            The platform provides a complete ecosystem including a multi-threaded compiler, a package registry, and a web-based IDE.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                            <div className="bg-[#161b22] p-5 rounded-xl border border-[#30363d] hover:border-blue-500/50 transition-colors">
                                <Terminal className="text-blue-400 mb-3" size={24} />
                                <h3 className="text-white font-bold mb-1">Fast Execution</h3>
                                <p className="text-sm text-[#8b949e]">Compiled natively for zero-overhead performance.</p>
                            </div>
                            <div className="bg-[#161b22] p-5 rounded-xl border border-[#30363d] hover:border-purple-500/50 transition-colors">
                                <Box className="text-purple-400 mb-3" size={24} />
                                <h3 className="text-white font-bold mb-1">Modern Registry</h3>
                                <p className="text-sm text-[#8b949e]">Integrated package management with strong versioning.</p>
                            </div>
                        </div>
                    </section>

                    <section id="quick-start" className="mb-16">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
                            <BookOpen className="text-blue-500" size={24} />
                            <span>Quick Start</span>
                        </h2>
                        <p className="text-[#8b949e] mb-4">You can write your first Lumen program in seconds using the online playground:</p>
                        <div className="bg-[#010409] rounded-xl p-6 border border-[#30363d] font-mono text-sm group">
                            <div className="flex justify-between mb-4">
                                <span className="text-[#8b949e]">hello.lm</span>
                                <Code size={16} className="text-[#8b949e] group-hover:text-white transition-colors cursor-pointer" />
                            </div>
                            <code className="block text-green-400">print("Hello, Lumen!")</code>
                        </div>
                    </section>

                    <section id="cli" className="mb-16">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
                            <Cloud className="text-pink-500" size={24} />
                            <span>CLI Installation</span>
                        </h2>
                        <p className="text-[#8b949e] mb-6">The Lumen CLI tool handles everything from compiling binaries to installing packages from the registry.</p>
                        <div className="bg-[#010409] rounded-xl p-6 border border-[#30363d] font-mono text-sm relative">
                            <span className="absolute top-4 right-4 text-xs text-[#8b949e]">One-line Install</span>
                            <div className="text-blue-400">curl -fsSL https://lumen-platform-beta.vercel.app/install.sh | sh</div>
                        </div>
                        <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-sm text-blue-300">
                            <strong>Note:</strong> We currently support Linux (x86_64) and macOS (Apple Silicon). Windows support is coming soon.
                        </div>
                    </section>
                </main>
            </div>

            {/* Footer */}
            <footer className="border-t border-[#30363d] bg-[#0d1117] py-12 mt-24">
                <div className="max-w-6xl mx-auto px-6 text-center">
                    <p className="text-[#8b949e] text-sm">© 2026 Lumen Programming Language Platform. Built for the modern web.</p>
                </div>
            </footer>
        </div>
    );
}
