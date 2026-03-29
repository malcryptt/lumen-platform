"use client";
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Trash2, Plus, Key, Lock, Loader2 } from 'lucide-react';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export default function SecretsManagerPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const [secrets, setSecrets] = useState<string[]>([]);
    const [keyName, setKeyName] = useState('');
    const [value, setValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        fetch(`${BACKEND}/copilot/session/${id}`)
            .then(r => r.json())
            .then(d => {
                if (d.secrets) setSecrets(d.secrets.map((s: any) => s.keyName));
            });
    }, [id]);

    const handleAdd = async () => {
        if (!keyName || !value) return;
        setLoading(true);
        await fetch(`${BACKEND}/copilot/secrets/${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ keyName, value })
        });
        setSecrets(prev => prev.includes(keyName) ? prev : [...prev, keyName]);
        setKeyName(''); setValue(''); setLoading(false);
    };

    const handleRemove = async (key: string) => {
        await fetch(`${BACKEND}/copilot/secrets/${id}/${key}`, { method: 'DELETE' });
        setSecrets(prev => prev.filter(k => k !== key));
    };

    return (
        <div className="min-h-screen bg-[#0d0d0f] text-white p-6">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-violet-600/20 rounded-xl"><Lock className="text-violet-400" size={24} /></div>
                    <div>
                        <h1 className="text-2xl font-bold">Secrets Manager</h1>
                        <p className="text-[#8b949e] text-sm mt-1">Encrypted environment variables for this deploy session.</p>
                    </div>
                </div>

                <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 shadow-xl mb-8">
                    <h2 className="text-sm font-semibold text-[#c9d1d9] mb-4">Add Secret</h2>
                    <div className="flex flex-col gap-4">
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="text-xs text-[#8b949e] mb-1 block">KEY</label>
                                <input
                                    type="text"
                                    value={keyName}
                                    onChange={e => setKeyName(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
                                    placeholder="DATABASE_URL"
                                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm font-mono focus:border-violet-500 outline-none"
                                />
                            </div>
                            <div className="flex-[2]">
                                <label className="text-xs text-[#8b949e] mb-1 block">VALUE <span className="text-xs text-violet-400 ml-2">(aes-256-gcm encrypted)</span></label>
                                <div className="flex items-center gap-2 bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 focus-within:border-violet-500">
                                    <input
                                        type={visible ? 'text' : 'password'}
                                        value={value}
                                        onChange={e => setValue(e.target.value)}
                                        placeholder="postgresql://user:pass@host/db"
                                        className="flex-1 bg-transparent border-none text-sm font-mono outline-none"
                                    />
                                    <button onClick={() => setVisible(!visible)} className="text-[#8b949e] hover:text-[#c9d1d9]">
                                        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleAdd}
                            disabled={loading || !keyName || !value}
                            className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2 shrink-0 self-end px-6"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                            Save Secret
                        </button>
                    </div>
                </div>

                <div className="space-y-3">
                    <h2 className="text-sm font-semibold text-[#8b949e] uppercase tracking-wide mb-4">Stored Secrets ({secrets.length})</h2>
                    {secrets.length === 0 && (
                        <div className="text-center py-8 text-[#484f58] text-sm border border-dashed border-[#30363d] rounded-xl">
                            No secrets added yet.
                        </div>
                    )}
                    {secrets.map(key => (
                        <div key={key} className="flex items-center justify-between bg-[#161b22] border border-[#30363d] rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <Key size={16} className="text-[#8b949e]" />
                                <span className="font-mono text-sm text-yellow-400 font-semibold">{key}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-xs text-[#484f58] font-mono">************************</span>
                                <button
                                    onClick={() => handleRemove(key)}
                                    className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-900/20 transition-colors"
                                    title="Delete secret"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 flex justify-center">
                    <a href={`/deploy/${id}/config`} className="text-sm text-violet-400 hover:text-violet-300 underline">← Back to deploy.lumen</a>
                </div>
            </div>
        </div>
    );
}
