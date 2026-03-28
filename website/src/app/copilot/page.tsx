"use client";

import React, { useState, useEffect } from "react";
import { ChatSidebar } from "@/components/Copilot/ChatSidebar";
import {
    Rocket,
    Terminal,
    ShieldCheck,
    Settings,
    Cpu,
    RefreshCcw,
    ChevronRight,
    CheckCircle2,
    AlertTriangle,
    Github
} from "lucide-react";

export default function CopilotPage() {
    const [repoUrl, setRepoUrl] = useState("");
    const [isScanning, setIsScanning] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [scanResult, setScanResult] = useState<any>(null);
    const [lumenConfig, setLumenConfig] = useState<string>("");
    const [status, setStatus] = useState<string>("idle"); // idle, scanning, config_ready, deploying, live, failed

    const handleScan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!repoUrl) return;

        setIsScanning(true);
        setStatus("scanning");

        try {
            const resp = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/copilot/scan`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ repoUrl }),
            });
            const data = await resp.json();

            setSessionId(data.sessionId);
            setScanResult(data.scanResult);
            setLumenConfig(data.lumenConfig);
            setStatus("config_ready");
        } catch (err) {
            console.error(err);
            setStatus("failed");
        } finally {
            setIsScanning(false);
        }
    };

    const handleDeploy = async () => {
        if (!sessionId) return;
        setStatus("deploying");

        try {
            await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/copilot/deploy/${sessionId}`, {
                method: "POST"
            });
            // Simulate polling
            setTimeout(() => setStatus("live"), 5000);
        } catch (err) {
            setStatus("failed");
        }
    };

    return (
        <div className="flex h-screen bg-black text-white font-sans overflow-hidden">
            {/* Sidebar Chat */}
            <ChatSidebar sessionId={sessionId} status={status} />

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
                            Lumen Copilot
                        </h1>
                        <p className="text-zinc-400 mt-2">AI-Powered Cloud Deployment Assistant</p>
                    </div>
                    <div className="flex gap-4">
                        <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm hover:bg-zinc-800 transition-all">
                            <Settings size={18} /> Settings
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-lg text-sm font-semibold hover:bg-indigo-500 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]">
                            Connect GitHub
                        </button>
                    </div>
                </header>

                {status === "idle" || status === "scanning" ? (
                    <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full text-center">
                        <div className="relative mb-8">
                            <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full"></div>
                            <div className="relative p-6 bg-zinc-900/50 border border-zinc-800 backdrop-blur-xl rounded-2xl">
                                <Cpu size={64} className="text-cyan-400" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold mb-4">What project are we deploying today?</h2>
                        <p className="text-zinc-400 mb-8 max-w-sm mx-auto">
                            Paste a repository URL and our AI will detect the stack and generate a native Lumen config.
                        </p>

                        <form onSubmit={handleScan} className="w-full flex gap-2">
                            <div className="relative flex-1 group">
                                <Github size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-cyan-400 transition-colors" />
                                <input
                                    type="text"
                                    value={repoUrl}
                                    onChange={(e) => setRepoUrl(e.target.value)}
                                    placeholder="https://github.com/user/project"
                                    className="w-full pl-12 pr-4 py-4 bg-zinc-900 border border-zinc-800 rounded-xl focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isScanning || !repoUrl}
                                className="px-8 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl"
                            >
                                {isScanning ? (
                                    <RefreshCcw className="animate-spin" size={20} />
                                ) : (
                                    "Scan & Prepare"
                                )}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="grid grid-cols-12 gap-8 flex-1 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* Left Column: Config & Result */}
                        <div className="col-span-12 lg:col-span-7 space-y-6">
                            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-md">
                                <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/80">
                                    <div className="flex items-center gap-2">
                                        <Terminal size={18} className="text-emerald-400" />
                                        <span className="font-mono text-sm text-zinc-300">.lumen config</span>
                                    </div>
                                    <button className="text-xs text-zinc-500 hover:text-white transition-colors">Edit manually</button>
                                </div>
                                <div className="p-6">
                                    <pre className="font-mono text-sm text-zinc-300 leading-relaxed overflow-x-auto">
                                        {lumenConfig}
                                    </pre>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl">
                                    <p className="text-xs text-zinc-500 mb-1 uppercase tracking-wider">Detected Runtime</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]"></div>
                                        <p className="font-bold text-lg capitalize">{scanResult?.runtime || "unknown"}</p>
                                    </div>
                                </div>
                                <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl">
                                    <p className="text-xs text-zinc-500 mb-1 uppercase tracking-wider">AI Confidence</p>
                                    <p className="font-bold text-lg">{(scanResult?.confidence * 100).toFixed(0)}%</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Status & Action */}
                        <div className="col-span-12 lg:col-span-5 space-y-6">
                            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <Rocket size={20} className="text-indigo-400" /> Deployment Status
                                </h3>

                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="relative flex flex-col items-center">
                                            <CheckCircle2 size={24} className="text-emerald-500" />
                                            <div className="w-px h-full bg-emerald-500 my-1"></div>
                                        </div>
                                        <div className="pb-8">
                                            <p className="font-bold">Scan Complete</p>
                                            <p className="text-sm text-zinc-500">Repository metadata successfully ingested.</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="relative flex flex-col items-center">
                                            <CheckCircle2 size={24} className={status !== "deploying" && status !== "live" ? "text-zinc-700" : "text-emerald-500"} />
                                            <div className={`w-px h-full my-1 ${status !== "deploying" && status !== "live" ? "bg-zinc-800" : "bg-emerald-500"}`}></div>
                                        </div>
                                        <div className="pb-8">
                                            <p className={`font-bold ${status === "config_ready" ? "text-white" : "text-zinc-500"}`}>Provisioning Environment</p>
                                            <p className="text-sm text-zinc-500">Connecting to Render Cloud services...</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="relative flex flex-col items-center">
                                            <Rocket size={24} className={status === "live" ? "text-emerald-500" : "text-zinc-700"} />
                                        </div>
                                        <div>
                                            <p className={`font-bold ${status === "live" ? "text-white" : "text-zinc-500"}`}>Live on Cloud</p>
                                            <p className="text-sm text-zinc-500">Your backend service is running.</p>
                                        </div>
                                    </div>
                                </div>

                                {status === "config_ready" && (
                                    <button
                                        onClick={handleDeploy}
                                        className="w-full mt-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 group"
                                    >
                                        Authorize & Deploy to Production <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                )}

                                {status === "live" && (
                                    <div className="mt-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm flex items-center gap-3">
                                        <CheckCircle2 size={18} /> Service is live at: my-lumen-api.onrender.com
                                    </div>
                                )}
                            </div>

                            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 text-xs flex gap-3 leading-relaxed">
                                <ShieldCheck size={24} className="shrink-0" />
                                Lumen Copilot analyzed your build scripts and verified them for security vulnerabilities before generating this config.
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
