"use client";
import React from 'react';
import { Zap, Activity, Cpu, Database, BarChart3, TrendingUp } from 'lucide-react';

export default function BenchmarksPage() {
    const benchmarks = [
        { label: "Matrix Multiplication", lumen: 85, python: 210, unit: "ms (Lower is best)" },
        { label: "Concurrent HTTP Requests", lumen: 1240, python: 320, unit: "req/sec (Higher is best)" },
        { label: "JSON Serialization", lumen: 42, python: 180, unit: "ms (Lower is best)" },
        { label: "Fibonacci (Recursive)", lumen: 0.8, python: 12.5, unit: "s (Lower is best)" }
    ];

    return (
        <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] font-sans selection:bg-[#388bfd33]">
            {/* Header */}
            <header className="border-b border-[#30363d] bg-[#161b22]/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <img src="/logo.png" alt="Lumen Logo" className="w-8 h-8" />
                        <span className="text-xl font-bold text-white tracking-tight">Lumen Performance</span>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-16">
                <header className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center space-x-2 bg-yellow-500/10 text-yellow-500 px-4 py-1.5 rounded-full border border-yellow-500/20 text-xs font-bold uppercase tracking-widest">
                        <Zap size={14} />
                        <span>Live Performance Metrics</span>
                    </div>
                    <h1 className="text-5xl font-extrabold text-white">Faster than Python. <br /> Simpler than C++.</h1>
                    <p className="max-w-2xl mx-auto text-lg text-[#8b949e]">
                        Lumen was designed from day one with a focus on high-concurrency systems and raw performance.
                        See how it compares against industry standards.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    <div className="bg-[#161b22] p-8 rounded-3xl border border-[#30363d] space-y-4 hover:border-blue-500/30 transition-all">
                        <Cpu className="text-blue-400 mb-2" size={32} />
                        <h3 className="text-2xl font-bold text-white">Parallel Execution</h3>
                        <p className="text-[#8b949e] leading-relaxed">
                            Lumen's multithreaded scheduler handles thousands of micro-threads with zero overhead, outperforming asyncio and threading models.
                        </p>
                    </div>
                    <div className="bg-[#161b22] p-8 rounded-3xl border border-[#30363d] space-y-4 hover:border-purple-500/30 transition-all">
                        <Database className="text-purple-400 mb-2" size={32} />
                        <h3 className="text-2xl font-bold text-white">Direct Memory Ops</h3>
                        <p className="text-[#8b949e] leading-relaxed">
                            Fine-grained control over memory without the complexity of Rust, optimized specifically for high-throughput data pipelines.
                        </p>
                    </div>
                </div>

                <div className="bg-[#161b22] p-10 rounded-3xl border border-[#30363d] shadow-2xl overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <BarChart3 size={200} />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-10 flex items-center space-x-3">
                        <Activity className="text-green-500" size={24} />
                        <span>Workload Comparisons</span>
                    </h2>

                    <div className="space-y-12 relative z-10">
                        {benchmarks.map((bench, i) => {
                            const isHigherBetter = bench.label === "Concurrent HTTP Requests";
                            const lumenPercent = isHigherBetter ? 100 : (bench.lumen / bench.python) * 100;
                            const pythonPercent = isHigherBetter ? (bench.python / bench.lumen) * 100 : 100;

                            return (
                                <div key={i} className="space-y-4">
                                    <div className="flex items-center justify-between px-2">
                                        <h4 className="font-bold text-white">{bench.label}</h4>
                                        <span className="text-xs text-[#8b949e] italic">{bench.unit}</span>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-24 text-sm font-bold text-emerald-400 uppercase tracking-tighter">Lumen</div>
                                            <div className="flex-1 h-3 bg-[#0d1117] rounded-full overflow-hidden border border-[#30363d]">
                                                <div
                                                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000"
                                                    style={{ width: `${lumenPercent}%` }}
                                                />
                                            </div>
                                            <div className="w-16 text-right text-sm font-bold text-[#c9d1d9]">{bench.lumen}</div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="w-24 text-sm font-bold text-[#8b949e] uppercase tracking-tighter">Python</div>
                                            <div className="flex-1 h-3 bg-[#0d1117] rounded-full overflow-hidden border border-[#30363d]">
                                                <div
                                                    className="h-full bg-[#30363d] rounded-full transition-all duration-1000"
                                                    style={{ width: `${pythonPercent}%` }}
                                                />
                                            </div>
                                            <div className="w-16 text-right text-sm font-bold text-[#8b949e]">{bench.python}</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-20 text-center bg-blue-500/10 border border-blue-500/20 p-12 rounded-3xl max-w-2xl mx-auto space-y-6">
                    <TrendingUp className="text-blue-500 mx-auto" size={48} />
                    <h3 className="text-2xl font-bold text-white leading-snug">
                        Ready to experience the next level of performance?
                    </h3>
                    <div className="pt-4 space-x-4">
                        <a href="/play" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-full font-bold transition-all inline-block">
                            Launch Playground
                        </a>
                        <a href="/docs" className="text-white hover:underline font-bold transition-all px-6 py-3 inline-block">
                            Read the Docs
                        </a>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-[#30363d] bg-[#010409] py-16 mt-32 text-center text-[#8b949e] text-sm">
                <div className="max-w-6xl mx-auto px-6">
                    <p>© 2026 Lumen Performance Labs. All benchmarks performed on standard AWS c5.large instances.</p>
                </div>
            </footer>
        </div>
    );
}
