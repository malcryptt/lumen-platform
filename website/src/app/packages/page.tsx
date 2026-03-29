"use client";
import React, { useState, useEffect } from 'react';
import { Package, Search, Download, Clock, User, ArrowRight, HelpCircle } from 'lucide-react';
import HelpModal from '@/components/HelpModal';

export default function PackagesPage() {
    const [packages, setPackages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/packages`);
                if (res.ok) {
                    const data = await res.json();
                    setPackages(data);
                }
            } catch (e) {
                console.error("Registry connection error:", e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPackages();
    }, []);

    return (
        <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] font-sans selection:bg-[#388bfd33]">
            {/* Header */}
            <header className="border-b border-[#30363d] bg-[#161b22]/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <img src="/logo.png" alt="Lumen Logo" className="w-8 h-8" />
                        <span className="text-xl font-bold text-white tracking-tight">Lumen Registry</span>
                    </div>
                    <div className="flex-1 max-w-xl mx-8 px-4 py-2 bg-[#010409] border border-[#30363d] rounded-full flex items-center space-x-3 group focus-within:border-blue-500 transition-colors">
                        <Search className="text-[#8b949e] group-focus-within:text-blue-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search for lumen packages..."
                            className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-[#8b949e]"
                        />
                    </div>
                    <nav className="flex items-center space-x-6 text-sm font-medium">
                        <a href="/docs" className="hover:text-white transition-colors">Docs</a>
                        <a href="/play" className="hover:text-white transition-colors">Playground</a>
                        <button className="bg-[#238636] hover:bg-[#2ea043] text-white px-4 py-1.5 rounded-md font-bold transition-all text-xs">
                            Publish
                        </button>
                        <button
                            onClick={() => setIsHelpModalOpen(true)}
                            className="hover:text-blue-400 transition-colors flex items-center gap-1.5 text-sm font-medium"
                        >
                            <HelpCircle size={14} /> Help
                        </button>
                    </nav>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-extrabold text-white">Registry Packages</h1>
                    <div className="text-sm text-[#8b949e]">
                        {packages.length} results found
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-[#161b22] h-48 rounded-2xl border border-[#30363d]" />
                        ))}
                    </div>
                ) : packages.length === 0 ? (
                    <div className="text-center py-20 bg-[#161b22] rounded-3xl border border-[#30363d] border-dashed">
                        <Package className="mx-auto text-[#30363d] mb-4" size={64} />
                        <h3 className="text-xl font-bold text-white mb-2">No packages yet</h3>
                        <p className="text-[#8b949e] max-w-sm mx-auto mb-8">
                            Be the first to publish a package to the Lumen Registry! It's as simple as `lumen publish`.
                        </p>
                        <a href="/docs#registry" className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 font-bold">
                            <span>Learn how to publish</span>
                            <ArrowRight size={16} />
                        </a>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {packages.map((pkg) => (
                            <div key={pkg.id} className="bg-[#161b22] p-6 rounded-2xl border border-[#30363d] hover:border-blue-500/50 transition-all hover:bg-[#1c2128] group cursor-pointer">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="bg-blue-500/10 p-2 rounded-lg group-hover:bg-blue-500/20">
                                        <Package className="text-blue-400" size={20} />
                                    </div>
                                    <span className="text-xs font-mono text-purple-400 font-bold bg-purple-400/10 px-2 py-0.5 rounded">
                                        v{pkg.versions[0]?.version || '0.1.0'}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">{pkg.name}</h3>
                                <p className="text-sm text-[#8b949e] mb-6 line-clamp-2 leading-relaxed">
                                    {pkg.description || "No description provided."}
                                </p>
                                <div className="pt-4 border-t border-[#30363d] flex items-center justify-between text-xs font-medium text-[#8b949e]">
                                    <div className="flex items-center space-x-2">
                                        <User size={14} />
                                        <span>{pkg.owner}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Clock size={14} />
                                        <span>2h ago</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="border-t border-[#30363d] bg-[#0d1117] py-12 mt-24">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-[#8b949e] text-sm">© 2026 Lumen Unified Registry. Secured and Distributed.</p>
                </div>
            </footer>
            <HelpModal
                isOpen={isHelpModalOpen}
                onClose={() => setIsHelpModalOpen(false)}
            />
        </div>
    );
}
