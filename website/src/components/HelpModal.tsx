"use client";
import React from 'react';
import { X, Zap, Shield, Cpu, Terminal, Rocket, Bug, Server } from 'lucide-react';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#161b22] border border-[#30363d] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-[#21262d] px-6 py-4 border-b border-[#30363d] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Zap className="text-cyan-400" size={20} />
                        <h2 className="text-lg font-bold text-white tracking-tight">How Lumen Works</h2>
                    </div>
                    <button onClick={onClose} className="text-[#8b949e] hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto space-y-10 custom-scrollbar">
                    {/* Section 1: The Language */}
                    <div className="flex gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl h-fit border border-blue-500/20">
                            <Cpu className="text-blue-400" size={24} />
                        </div>
                        <div>
                            <h3 className="text-white font-bold mb-2">1. The Lumen Language</h3>
                            <p className="text-sm text-[#8b949e] leading-relaxed">
                                Lumen is a high-performance multipurpose language compiled to native machine code. It features first-class support for concurrency, cryptography, and hardware-bound execution.
                            </p>
                        </div>
                    </div>

                    {/* Section 2: AI Copilot Flow */}
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="p-3 bg-purple-500/10 rounded-xl h-fit border border-purple-500/20">
                                <Rocket className="text-purple-400" size={24} />
                            </div>
                            <div>
                                <h3 className="text-white font-bold mb-2">2. Intelligent Deployment Cycle</h3>
                                <p className="text-sm text-[#8b949e] leading-relaxed mb-4">
                                    Lumen Copilot automates infrastructure management using a secure 4-step chain:
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pl-14">
                            <div className="p-3 bg-[#0d1117] border border-[#30363d] rounded-xl">
                                <div className="text-[10px] font-bold text-purple-400 uppercase mb-1">Step 1: Scan</div>
                                <div className="text-xs text-[#c9d1d9]">AI analyzes your repo and detects runtimes.</div>
                            </div>
                            <div className="p-3 bg-[#0d1117] border border-[#30363d] rounded-xl">
                                <div className="text-[10px] font-bold text-purple-400 uppercase mb-1">Step 2: Config</div>
                                <div className="text-xs text-[#c9d1d9]">Deterministic .lumen file generation.</div>
                            </div>
                            <div className="p-3 bg-[#0d1117] border border-[#30363d] rounded-xl">
                                <div className="text-[10px] font-bold text-purple-400 uppercase mb-1">Step 3: Deploy</div>
                                <div className="text-xs text-[#c9d1d9]">Cloud orchestration on Render.com.</div>
                            </div>
                            <div className="p-3 bg-[#0d1117] border border-[#30363d] rounded-xl">
                                <div className="text-[10px] font-bold text-purple-400 uppercase mb-1">Step 4: Live</div>
                                <div className="text-xs text-[#c9d1d9]">Automated health checks & monitoring.</div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: AI Diagnosis */}
                    <div className="flex gap-4">
                        <div className="p-3 bg-red-500/10 rounded-xl h-fit border border-red-500/20">
                            <Bug className="text-red-400" size={24} />
                        </div>
                        <div>
                            <h3 className="text-white font-bold mb-2">3. Automated Fixes</h3>
                            <p className="text-sm text-[#8b949e] leading-relaxed">
                                If a build fails, Lumen AI parses the raw deployment logs to identify the root cause and suggests precise configuration patches.
                            </p>
                        </div>
                    </div>

                    {/* Section 4: Security */}
                    <div className="flex gap-4">
                        <div className="p-3 bg-green-500/10 rounded-xl h-fit border border-green-500/20">
                            <Shield className="text-green-400" size={24} />
                        </div>
                        <div>
                            <h3 className="text-white font-bold mb-2">4. Zero-Trust Posture</h3>
                            <p className="text-sm text-[#8b949e] leading-relaxed">
                                All secrets are AES-256 encrypted. Scanners use SSRF protection to block internal networks, and CLI keys are hardware-bound to your CPU ID.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-[#0d1117] border-t border-[#30363d] flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-white text-black px-6 py-2 rounded-xl font-bold text-sm hover:bg-[#f0f0f0] transition-all"
                    >
                        Got it, thanks!
                    </button>
                </div>
            </div>
        </div>
    );
}
