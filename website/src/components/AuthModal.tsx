"use client";
import React, { useState } from 'react';
import { X, Github, User, Key, ArrowRight, CheckCircle } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onLogin }: { isOpen: boolean, onClose: () => void, onLogin: (user: any) => void }) {
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [apiKey, setApiKey] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim()) return;
        setIsLoading(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });
            const data = await res.json();
            if (data.apiKey) {
                setApiKey(data.apiKey);
                setSuccess(true);
                localStorage.setItem('lumen_user', JSON.stringify(data));
                setTimeout(() => {
                    onLogin(data);
                    onClose();
                }, 3000);
            }
        } catch (err) {
            alert("Login failed. Is the backend running?");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[#161b22] w-full max-w-md rounded-2xl border border-[#30363d] shadow-2xl relative overflow-hidden">
                <button onClick={onClose} className="absolute top-4 right-4 text-[#8b949e] hover:text-white transition-colors">
                    <X size={20} />
                </button>

                <div className="p-8">
                    {!success ? (
                        <div className="space-y-6">
                            <div className="text-center space-y-2">
                                <h3 className="text-2xl font-bold text-white">Lumen ID (Beta)</h3>
                                <p className="text-sm text-[#8b949e]">Sign in to publish packages and use the AI Copilot.</p>
                            </div>

                            <button className="w-full flex items-center justify-center space-x-3 py-3 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-xl text-white font-bold transition-all">
                                <Github size={20} />
                                <span>Continue with GitHub</span>
                            </button>

                            <div className="relative flex items-center">
                                <div className="flex-grow border-t border-[#30363d]"></div>
                                <span className="flex-shrink mx-4 text-[10px] text-[#484f58] uppercase font-bold">or use developer alias</span>
                                <div className="flex-grow border-t border-[#30363d]"></div>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-[#8b949e] uppercase ml-1">Username</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 text-[#484f58]" size={18} />
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            placeholder="e.g. malcrypt"
                                            className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl p-3 pl-10 text-white focus:border-blue-500 focus:outline-none transition-colors"
                                            required
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-blue-900/20"
                                >
                                    <span>{isLoading ? 'Creating ID...' : 'Get Beta API Key'}</span>
                                    {!isLoading && <ArrowRight size={18} />}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="text-center space-y-6 py-4 animate-in fade-in zoom-in duration-300">
                            <div className="flex justify-center">
                                <div className="bg-green-500/20 p-4 rounded-full">
                                    <CheckCircle className="text-green-500" size={48} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-white">You're in, {username}!</h3>
                                <p className="text-sm text-[#8b949e]">Your Beta API Key has been generated.</p>
                            </div>
                            <div className="bg-[#0d1117] p-4 rounded-xl border border-[#30363d] text-left space-y-2">
                                <div className="flex items-center space-x-2 text-[10px] font-bold text-[#484f58] uppercase">
                                    <Key size={12} />
                                    <span>Your secret API Key</span>
                                </div>
                                <div className="font-mono text-xs text-blue-400 break-all bg-[#161b22] p-2 rounded border border-[#30363d]">
                                    {apiKey}
                                </div>
                                <p className="text-[10px] text-orange-400/80">Copy this key! You'll need it for 'lumen login'.</p>
                            </div>
                            <p className="text-xs text-[#484f58]">Redirecting to playground...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
