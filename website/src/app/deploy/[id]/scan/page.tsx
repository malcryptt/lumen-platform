"use client";
import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Clock, Loader2, ChevronRight, AlertTriangle } from 'lucide-react';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

const STATUS_LABELS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    scanning: { label: 'Scanning…', color: 'text-blue-400', icon: <Loader2 size={16} className="animate-spin" /> },
    scan_failed: { label: 'Scan Failed', color: 'text-red-400', icon: <XCircle size={16} /> },
    config_ready: { label: 'Config Ready', color: 'text-green-400', icon: <CheckCircle2 size={16} /> },
    deploying: { label: 'Deploying…', color: 'text-yellow-400', icon: <Loader2 size={16} className="animate-spin" /> },
    deploy_failed: { label: 'Deploy Failed', color: 'text-red-400', icon: <XCircle size={16} /> },
    diagnosing: { label: 'Diagnosing…', color: 'text-purple-400', icon: <Loader2 size={16} className="animate-spin" /> },
    live: { label: 'Live ✓', color: 'text-green-400', icon: <CheckCircle2 size={16} /> },
};

export default function ScanResultsPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const [session, setSession] = useState<any>(null);
    const [polling, setPolling] = useState(true);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        const poll = async () => {
            const res = await fetch(`${BACKEND}/copilot/session/${id}`).catch(() => null);
            if (!res?.ok) return;
            const data = await res.json();
            setSession(data);
            if (['config_ready', 'scan_failed', 'live', 'deploy_failed'].includes(data.status)) {
                setPolling(false);
            } else {
                timer = setTimeout(poll, 3000);
            }
        };
        poll();
        return () => clearTimeout(timer);
    }, [id]);

    const scanResult = session?.scanResult;
    const statusInfo = STATUS_LABELS[session?.status] || { label: session?.status, color: 'text-gray-400', icon: <Clock size={16} /> };

    return (
        <div className="min-h-screen bg-[#0d0d0f] text-white p-6">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold">Scan Results</h1>
                        <p className="text-[#8b949e] text-sm mt-1 font-mono">{id}</p>
                    </div>
                    <div className={`flex items-center gap-2 font-medium ${statusInfo.color}`}>
                        {statusInfo.icon}
                        {statusInfo.label}
                    </div>
                </div>

                {!session && (
                    <div className="flex items-center justify-center h-48 text-[#8b949e]">
                        <Loader2 className="animate-spin mr-2" /> Loading scan results…
                    </div>
                )}

                {session?.status === 'scan_failed' && (
                    <div className="bg-red-900/20 border border-red-800 rounded-xl p-6 flex items-start gap-3">
                        <AlertTriangle className="text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-red-300">Scan Failed</h3>
                            <p className="text-sm text-red-400 mt-1">
                                {session.logs?.[0]?.line || 'The repository could not be analyzed. Check the URL and try again.'}
                            </p>
                            <a href="/deploy/new" className="inline-block mt-3 text-sm text-red-300 underline hover:text-red-200">
                                Try a different repository →
                            </a>
                        </div>
                    </div>
                )}

                {scanResult && (
                    <div className="space-y-4">
                        {/* Stack detection */}
                        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
                            <h2 className="text-sm font-semibold text-[#8b949e] uppercase tracking-wide mb-4">Detected Stack</h2>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><span className="text-[#8b949e]">Runtime</span><div className="font-mono text-green-400 mt-1">{scanResult.runtime || '—'}</div></div>
                                <div><span className="text-[#8b949e]">Confidence</span><div className="font-mono text-blue-400 mt-1">{scanResult.confidence || '—'}</div></div>
                                <div><span className="text-[#8b949e]">Build Command</span><div className="font-mono text-[#c9d1d9] mt-1">{scanResult.buildCommand || '—'}</div></div>
                                <div><span className="text-[#8b949e]">Port</span><div className="font-mono text-[#c9d1d9] mt-1">{scanResult.port || 3000}</div></div>
                            </div>
                            {scanResult.envKeys?.length > 0 && (
                                <div className="mt-4">
                                    <span className="text-[#8b949e] text-sm">Detected Env Keys</span>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {scanResult.envKeys.map((k: string) => (
                                            <span key={k} className="px-2 py-0.5 rounded-md bg-[#21262d] border border-[#30363d] font-mono text-xs text-yellow-400">{k}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Proceed button */}
                        {session.status === 'config_ready' && (
                            <a
                                href={`/deploy/${id}/config`}
                                id="proceed-to-config-btn"
                                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 font-semibold text-sm transition-all"
                            >
                                Review Generated Config <ChevronRight size={16} />
                            </a>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
