"use client";
import React, { useState, useEffect } from 'react';
import { Rocket, Clock, Settings, Key, Github, Eye, EyeOff, Loader2, Save, Trash2, ShieldCheck, AlertTriangle } from 'lucide-react';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export default function SettingsPage() {
    const [renderKey, setRenderKey] = useState('');
    const [githubLogin, setGithubLogin] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetch(`${BACKEND}/user/integrations`)
            .then(r => r.json())
            .then(d => {
                if (d.githubLogin) setGithubLogin(d.githubLogin);
                if (d.hasRenderKey) setRenderKey('************************');
            })
            .catch(() => { });
    }, []);

    const handleSaveRender = async () => {
        if (!renderKey || renderKey === '************************') return;
        setLoading(true); setMessage(''); setError('');
        try {
            const res = await fetch(`${BACKEND}/user/integrations/render`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ renderKey })
            });
            if (!res.ok) throw new Error('Failed to save key');
            setMessage('Render API Key encrypted and saved securely.');
            setRenderKey('************************');
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDisconnectGitHub = async () => {
        if (!confirm('Disconnect GitHub? Private repos will fail to scan.')) return;
        setLoading(true);
        try {
            await fetch(`${BACKEND}/user/integrations/github`, { method: 'DELETE' });
            setGithubLogin(null);
            setMessage('GitHub disconnected.');
        } catch { }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#0d0d0f] text-white p-6">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-violet-600/20 rounded-xl"><Settings className="text-violet-400" size={24} /></div>
                    <div>
                        <h1 className="text-2xl font-bold">Integrations & Settings</h1>
                        <p className="text-[#8b949e] text-sm mt-1">Manage external platform connections for Lumen Copilot.</p>
                    </div>
                </div>

                {message && (
                    <div className="mb-6 p-4 bg-green-900/20 border border-green-800 rounded-xl text-green-400 text-sm flex items-center gap-2">
                        <ShieldCheck size={16} /> {message}
                    </div>
                )}
                {error && (
                    <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-xl text-red-400 text-sm flex items-center gap-2">
                        <AlertTriangle size={16} /> {error}
                    </div>
                )}

                {/* Render */}
                <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 shadow-xl mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Rocket size={20} className="text-purple-400" />
                        <h2 className="text-lg font-semibold text-[#c9d1d9]">Render Cloud</h2>
                    </div>
                    <p className="text-sm text-[#8b949e] mb-6 leading-relaxed">
                        Connect your Render account to allow Lumen Copilot to create and deploy services on your behalf.
                        Keys are AES-256 encrypted at rest and never returned via the API.
                    </p>

                    <label className="text-xs font-semibold text-[#8b949e] uppercase mb-1.5 block">Render API Key</label>
                    <div className="flex gap-3">
                        <div className="flex-1 flex items-center gap-2 bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-2.5 focus-within:border-violet-500 transition-colors">
                            <Key size={16} className="text-[#484f58]" />
                            <input
                                type={visible ? 'text' : 'password'}
                                value={renderKey}
                                onChange={e => setRenderKey(e.target.value)}
                                placeholder="rnd_xxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                className="flex-1 bg-transparent border-none text-sm font-mono outline-none text-[#c9d1d9] placeholder-[#484f58]"
                            />
                            <button onClick={() => setVisible(!visible)} className="text-[#8b949e] hover:text-[#c9d1d9] transition-colors p-1">
                                {visible ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        <button
                            onClick={handleSaveRender}
                            disabled={loading || !renderKey || renderKey === '************************'}
                            className="bg-purple-600 hover:bg-purple-500 disabled:bg-[#21262d] disabled:text-[#484f58] text-white px-5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            Save
                        </button>
                    </div>
                </div>

                {/* GitHub */}
                <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Github size={20} className="text-[#c9d1d9]" />
                            <h2 className="text-lg font-semibold text-[#c9d1d9]">GitHub Private Repos</h2>
                        </div>
                        {githubLogin && (
                            <span className="px-3 py-1 bg-green-900/20 text-green-400 border border-green-800 rounded-full text-xs font-semibold flex items-center gap-1.5">
                                <ShieldCheck size={14} /> Connected
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-[#8b949e] mb-6 leading-relaxed flex items-start gap-2">
                        <Clock size={16} className="shrink-0 mt-0.5" />
                        Required for Lumen Copilot to scan private GitHub repositories. Unnecessary for public URLs. Scoped to repository read-only.
                    </p>

                    {githubLogin ? (
                        <div className="flex items-center justify-between bg-[#0d1117] border border-[#30363d] p-4 rounded-xl">
                            <div className="flex items-center gap-3">
                                <img src={`https://github.com/${githubLogin}.png?size=40`} alt="Avatar" className="w-10 h-10 rounded-full border border-[#30363d]" />
                                <div>
                                    <div className="text-sm font-semibold text-[#c9d1d9]">{githubLogin}</div>
                                    <div className="text-xs text-[#8b949e] font-mono">OAuth App access granted</div>
                                </div>
                            </div>
                            <button
                                onClick={handleDisconnectGitHub}
                                disabled={loading}
                                className="text-red-400 hover:text-red-300 px-4 py-2 rounded-lg hover:bg-red-900/20 text-sm font-medium transition-colors flex items-center gap-2 border border-transparent hover:border-red-900/50"
                            >
                                <Trash2 size={16} /> Disconnect
                            </button>
                        </div>
                    ) : (
                        <a
                            href={`${BACKEND}/auth/github`}
                            className="inline-flex items-center justify-center w-full bg-[#238636] hover:bg-[#2ea043] text-white px-5 py-3 rounded-xl text-sm font-semibold transition-colors gap-2 shadow-lg shadow-green-900/20"
                        >
                            <Github size={18} /> Connect with GitHub
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
