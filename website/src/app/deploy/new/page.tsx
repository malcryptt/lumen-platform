"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Rocket, Github, Globe, Lock, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export default function DeployNewPage() {
    const [repoUrl, setRepoUrl] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [sessionId, setSessionId] = useState('');

    const handleScan = async () => {
        if (!repoUrl.trim()) { setError('Repository URL is required.'); return; }
        setLoading(true); setError('');
        try {
            const res = await fetch(`${BACKEND}/copilot/scan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ repoUrl, isPrivate }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Scan failed');
            setSessionId(data.sessionId);
            // Redirect to scan results page
            window.location.href = `/deploy/${data.sessionId}/scan`;
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0d0d0f] text-white flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-800 mb-4 shadow-lg shadow-purple-900/40">
                        <Rocket size={28} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Deploy with Lumen Copilot</h1>
                    <p className="text-[#8b949e] mt-2">Connect your repository and let AI generate your deploy config.</p>
                </div>

                {/* Card */}
                <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8 shadow-xl">
                    <label className="block text-sm font-medium text-[#c9d1d9] mb-2">Repository URL</label>
                    <div className="flex items-center gap-2 bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 focus-within:border-violet-500 transition-colors">
                        <Github size={18} className="text-[#8b949e] flex-shrink-0" />
                        <input
                            type="url"
                            value={repoUrl}
                            onChange={e => setRepoUrl(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleScan()}
                            placeholder="https://github.com/user/my-app"
                            className="flex-1 bg-transparent outline-none text-sm text-white placeholder-[#484f58]"
                        />
                    </div>

                    {/* Private toggle */}
                    <div className="flex items-center gap-3 mt-4">
                        <button
                            onClick={() => setIsPrivate(v => !v)}
                            className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg border transition-all ${isPrivate ? 'border-violet-500 bg-violet-500/10 text-violet-300' : 'border-[#30363d] text-[#8b949e] hover:border-[#58626d]'}`}
                        >
                            <Lock size={14} />
                            {isPrivate ? 'Private repo — GitHub OAuth required' : 'Public repository'}
                        </button>
                        {isPrivate && (
                            <a
                                href="/api/auth/github"
                                className="text-xs text-violet-400 hover:text-violet-300 underline"
                            >
                                Connect GitHub →
                            </a>
                        )}
                    </div>

                    {error && (
                        <div className="mt-4 flex items-center gap-2 text-red-400 bg-red-900/20 border border-red-800 rounded-lg p-3 text-sm">
                            <AlertCircle size={15} />
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleScan}
                        disabled={loading}
                        id="start-scan-btn"
                        className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30"
                    >
                        {loading ? <><Loader2 size={16} className="animate-spin" />Analyzing Repository...</> : <><Rocket size={16} />Scan & Generate Config</>}
                    </button>
                </div>

                {/* Recent deploys hint */}
                <p className="text-center mt-4 text-xs text-[#484f58]">
                    Previously deployed?{' '}
                    <a href="/deploy" className="text-violet-400 hover:text-violet-300 underline">View deploy history →</a>
                </p>
            </div>
        </div>
    );
}
