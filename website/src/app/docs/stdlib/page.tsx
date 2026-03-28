"use client";
import React from 'react';
import { Book, Code, Box, Zap, Globe, Clock, Calculator, Terminal, ArrowRight, ExternalLink } from 'lucide-react';

export default function StdLibPage() {
    const modules = [
        {
            name: "io",
            icon: <Terminal className="text-blue-400" size={24} />,
            description: "Core input/output primitives for streams, files, and console.",
            functions: [
                { name: "print(...args)", desc: "Prints values to standard output." },
                { name: "read_line()", desc: "Reads a single line from standard input." },
                { name: "open(path, mode)", desc: "Opens a file stream." }
            ],
            example: 'import io\nio.print("Hello from IO!")'
        },
        {
            name: "net",
            icon: <Globe className="text-emerald-400" size={24} />,
            description: "High-performance networking library for TCP/UDP and HTTP.",
            functions: [
                { name: "listen(port)", desc: "Starts a TCP server on the specified port." },
                { name: "connect(host, port)", desc: "Creates a TCP client connection." },
                { name: "http.get(url)", desc: "Performs a fast asynchronous GET request." }
            ],
            example: 'import net\nserver = net.listen(8080)\nfor client in server {\n    client.write("Hello!")\n}'
        },
        {
            name: "time",
            icon: <Clock className="text-purple-400" size={24} />,
            description: "Precise timing and scheduling for concurrent tasks.",
            functions: [
                { name: "now()", desc: "Returns the current high-resolution timestamp." },
                { name: "sleep(ms)", desc: "Suspends execution for specified milliseconds." },
                { name: "since(start)", desc: "Calculates duration since a timestamp." }
            ],
            example: 'import time\nstart = time.now()\ntime.sleep(100)\nprint(time.since(start))'
        },
        {
            name: "math",
            icon: <Calculator className="text-orange-400" size={24} />,
            description: "Optimized mathematical functions and constants.",
            functions: [
                { name: "sin(x), cos(x)", desc: "Trigonometric functions (radians)." },
                { name: "random()", desc: "Returns a pseudo-random float [0, 1)." },
                { name: "sqrt(x)", desc: "Returns the square root of a number." }
            ],
            example: 'import math\nprint(math.sqrt(144) + math.sin(math.pi))'
        }
    ];

    return (
        <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] font-sans selection:bg-[#388bfd33]">
            {/* Header */}
            <header className="border-b border-[#30363d] bg-[#161b22]/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <img src="/logo.png" alt="Lumen Logo" className="w-8 h-8" />
                        <span className="text-xl font-bold text-white tracking-tight">Standard Library</span>
                    </div>
                    <nav className="flex items-center space-x-6 text-sm font-medium">
                        <a href="/" className="hover:text-white transition-colors">Home</a>
                        <a href="/docs" className="hover:text-white transition-colors">Guides</a>
                        <a href="/play" className="hover:text-white transition-colors font-bold text-blue-400">Playground</a>
                    </nav>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-16">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <div className="space-y-4">
                        <div className="inline-flex items-center space-x-2 bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20 text-xs font-bold uppercase tracking-wider">
                            <Box size={14} />
                            <span>Built-in Modules</span>
                        </div>
                        <h1 className="text-5xl font-extrabold text-white tracking-tight">Batteries Included.</h1>
                        <p className="max-w-2xl text-lg text-[#8b949e]">
                            Lumen comes with a powerful, optimized standard library designed for performance and ease of use.
                            Everything you need to build scalable network services and high-speed data pipelines.
                        </p>
                    </div>
                    <div className="flex items-center bg-[#161b22] border border-[#30363d] rounded-2xl p-4 space-x-4">
                        <div className="bg-green-500/20 p-2 rounded-lg">
                            <Zap className="text-green-400" size={24} />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-white">v1.0 Standard</div>
                            <div className="text-xs text-[#8b949e]">Stably integrated.</div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {modules.map((mod, i) => (
                        <div key={i} className="bg-[#161b22] rounded-3xl border border-[#30363d] overflow-hidden flex flex-col group hover:border-blue-500/30 transition-all duration-300">
                            <div className="p-8 border-b border-[#30363d] flex items-center justify-between bg-gradient-to-br from-[#1c2128] to-[#161b22]">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-[#0d1117] rounded-2xl border border-[#30363d] group-hover:scale-110 transition-transform">
                                        {mod.icon}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white capitalize">{mod.name}</h2>
                                        <p className="text-sm text-[#8b949e]">{mod.description}</p>
                                    </div>
                                </div>
                                <a
                                    href={`/play?example=${mod.name}`}
                                    className="p-2 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-xl text-[#8b949e] hover:text-white transition-all shadow-sm"
                                    title="Open example in Playground"
                                >
                                    <Code size={18} />
                                </a>
                            </div>

                            <div className="p-8 flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-[#8b949e] uppercase tracking-widest pl-1">Key Functions</h4>
                                    <ul className="space-y-3">
                                        {mod.functions.map((fn, j) => (
                                            <li key={j} className="group/item">
                                                <div className="text-sm font-mono text-blue-400 font-bold group-hover/item:text-blue-300 transition-colors">
                                                    {fn.name}
                                                </div>
                                                <div className="text-xs text-[#8b949e] mt-1">
                                                    {fn.desc}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-[#8b949e] uppercase tracking-widest pl-1">Quick Example</h4>
                                    <div className="bg-[#0d1117] rounded-2xl p-4 border border-[#30363d] font-mono text-[13px] text-[#c9d1d9] relative h-full">
                                        <div className="absolute top-3 right-3 opacity-20 group-hover:opacity-40 transition-opacity">
                                            <Terminal size={48} />
                                        </div>
                                        <pre className="whitespace-pre-wrap leading-relaxed relative z-10">
                                            {mod.example}
                                        </pre>
                                    </div>
                                </div>
                            </div>

                            <div className="px-8 py-4 bg-[#0d1117]/50 border-t border-[#30363d] flex items-center justify-between group-hover:bg-[#1f242c] transition-colors cursor-pointer">
                                <span className="text-xs font-bold text-[#8b949e] group-hover:text-white">View Full {mod.name} Reference</span>
                                <ArrowRight className="text-[#8b949e] group-hover:text-white group-hover:translate-x-1 transition-all" size={14} />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-20 p-12 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-[3rem] border border-white/5 text-center space-y-6">
                    <h2 className="text-3xl font-extrabold text-white">Missing a module?</h2>
                    <p className="max-w-xl mx-auto text-[#8b949e]">
                        The Lumen community is constantly building new cross-platform libraries.
                        Check the registry for third-party extensions or contribute your own.
                    </p>
                    <div className="flex items-center justify-center space-x-4 pt-4">
                        <a href="/packages" className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-[#c9d1d9] transition-all flex items-center space-x-2">
                            <span>Browse Registry</span>
                            <ExternalLink size={16} />
                        </a>
                        <a href="/docs/contributing" className="text-white hover:underline font-bold px-6 py-3">
                            Contribute to StdLib
                        </a>
                    </div>
                </div>
            </main>

            <footer className="border-t border-[#30363d] bg-[#010409] py-16 mt-32 text-center text-[#8b949e] text-sm">
                <p>© 2026 Lumen Platform. Built for the future of concurrency.</p>
            </footer>
        </div>
    );
}
