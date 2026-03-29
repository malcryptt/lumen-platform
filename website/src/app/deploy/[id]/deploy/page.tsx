"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Copy, ExternalLink, Loader2, StopCircle, RefreshCw, AlertTriangle, Bug, CheckCircle2 } from 'lucide-react';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

// Same status labels as scan page
const STATUS_LABELS: Record<string, { label: string; bg: string; text: string; }> = {
    deploying: { label: 'Deploying', bg: 'bg-yellow-900/30 border-yellow-800', text: 'text-yellow-400' },
    deploy_failed: { label: 'Failed', bg: 'bg-red-900/30 border-red-800', text: 'text-red-400' },
    live: { label: 'Live', bg: 'bg-green-900/30 border-green-800', text: 'text-green-400' },
};

export default function DeployConsolePage({ params }: { params: { id: string } }) {
    const { id } = params;
    const [session, setSession] = useState<any>(null);
    const [logs, setLogs] = useState<{ ts: string, line: string, level: string }[]>([]);
    const [status, setStatus] = useState('idle');
    const [url, setUrl] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const logEndRef = useRef<HTMLDivElement>(null);

    // Initial fetch, push deploy if config_ready
    useEffect(() => {
        fetch(`${BACKEND}/copilot/session/${id}`)
            .then(r => r.json())
            .then(async d => {
                setSession(d); setStatus(d.status); setUrl(d.renderServiceUrl || '');
                if (d.logs) setLogs(d.logs.reverse().map((l: any) => ({ ts: l.timestamp, line: l.line, level: l.level })));

                if (d.status === 'config_ready') {
                    await fetch(`${BACKEND}/copilot/deploy/${id}`, { method: 'POST' });
                    setStatus('deploying');
                }
            });
    }, [id]);

    // WebSocket for live logs
    useEffect(() => {
        if (!['deploying', 'diagnosing'].includes(status)) return;
        let ws: WebSocket;
        let reconnectTimeout: NodeJS.Timeout;

        const connect = () => {
            const wsUrl = BACKEND.replace(/^http/, 'ws') + `/copilot/ws/${id}`;
            ws = new WebSocket(wsUrl);

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.event === 'deploy:log') {
                    setLogs(prev => [...prev, { ts: data.ts, line: data.line, level: data.level }]);
                } else if (data.event === 'deploy:complete') {
                    setStatus(data.status === 'live' ? 'live' : 'deploy_failed');
                    if (data.url) setUrl(data.url);
                }
            };
            ws.onclose = () => { reconnectTimeout = setTimeout(connect, 2000); };
        };
        connect();

        return () => { clearTimeout(reconnectTimeout); ws?.close(); };
    }, [id, status]);

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const handleDiagnose = async () => {
        setStatus('diagnosing');
        setDiagnosis('');
        const res = await fetch(`${BACKEND}/copilot/diagnose/${id}`, { method: 'POST' });
        const d = await res.json();
        setDiagnosis(d.diagnosis || 'Diagnosis failed.');
        setStatus('config_ready');
    };

    const handleCancel = async () => {
        await fetch(`${BACKEND}/copilot/deploy/${id}/cancel`, { method: 'POST' });
        setStatus('deploy_failed');
    };

    const s = STATUS_LABELS[status] || { label: status, bg: 'bg-[#21262d] border-[#30363d]', text: 'text-[#8b949e]' };

    return (
        <div className="min-h-screen bg-[#0d0d0f] text-white flex flex-col items-center p-6">
            <div className="w-full max-w-4xl flex flex-col flex-1">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            Deploy Console
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${s.bg} ${s.text}`}>
                                {s.label}
                                {status === 'deploying' && <Loader2 size={12} className="inline ml-2 animate-spin" />}
                            </span>
                        </h1>
                        <p className="text-[#8b949e] font-mono text-sm mt-1">{id}</p>
                    </div>

                    <div className="flex gap-3">
                        {status === 'deploying' && (
                            <button onClick={handleCancel} className="px-4 py-2 border border-red-800 text-red-400 hover:bg-red-900/20 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                                <StopCircle size={16} /> Cancel Build
                            </button>
                        )}
                        {status === 'deploy_failed' && (
                            <>
                                <button onClick={handleDiagnose} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-purple-900/30">
                                    <Bug size={16} /> Run AI Diagnosis
                                </button>
                                <a href={`/deploy/${id}/config`} className="px-4 py-2 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-lg text-sm font-medium transition-colors">
                                    Edit Config
                                </a>
                            </>
                        )}
                        {status === 'live' && url && (
                            <a href={url} target="_blank" rel="noopener noreferrer" className="px-5 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-green-900/30">
                                Visit Site <ExternalLink size={16} />
                            </a>
                        )}
                    </div>
                </div>

                {/* Live URL Banner */}
                {status === 'live' && url && (
                    <div className="mb-6 p-4 bg-green-900/20 border border-green-800 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 size={24} className="text-green-400" />
                            <div>
                                <h3 className="font-semibold text-green-300">Deployment Successful!</h3>
                                <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm font-mono text-green-400 hover:underline mt-1">{url}</a>
                            </div>
                        </div>
                        <button onClick={() => navigator.clipboard.writeText(url)} className="p-2 text-green-500 hover:bg-green-900/40 rounded-lg transition-colors" title="Copy URL">
                            <Copy size={16} />
                        </button>
                    </div>
                )}

                {/* AI Diagnosis Result */}
                {(diagnosis || session?.diagnosis) && status !== 'deploying' && (
                    <div className="mb-6 p-6 bg-[#161b22] border-2 border-purple-500/30 rounded-xl shadow-[0_0_30px_rgba(168,85,247,0.1)]">
                        <h3 className="font-bold flex items-center gap-2 text-purple-400 mb-3 border-b border-purple-500/20 pb-2">
                            <Bug size={18} /> Lumen AI Diagnosis
                        </h3>
                        <div className="prose prose-invert prose-purple max-w-none text-sm text-[#c9d1d9] whitespace-pre-wrap font-mono">
                            {diagnosis || session.diagnosis}
                        </div>
                        {status === 'config_ready' && (
                            <a href={`/deploy/${id}/config`} className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium">
                                Edit Config to Apply Fix →
                            </a>
                        )}
                    </div>
                )}

                {/* Terminal */}
                <div className="flex-1 min-h-[400px] max-h-[600px] bg-[#0d1117] border border-[#30363d] rounded-2xl overflow-hidden flex flex-col shadow-2xl">
                    <div className="bg-[#161b22] px-4 py-2 flex items-center gap-2 border-b border-[#30363d] sticky top-0 z-10 shrink-0">
                        <Terminal size={16} className="text-[#8b949e]" />
                        <span className="text-xs font-semibold text-[#8b949e]">Build Logs</span>
                        <div className="ml-auto text-xs font-mono text-[#484f58]">{logs.length} lines</div>
                    </div>
                    <div className="p-4 font-mono text-[13px] leading-6 overflow-y-auto flex-1">
                        {logs.length === 0 ? (
                            <div className="text-[#484f58] italic py-4">Waiting for logs...</div>
                        ) : logs.map((log, i) => (
                            <div key={i} className={`flex gap-3 hover:bg-[#21262d] py-0.5 px-2 rounded -mx-2 whitespace-pre-wrap break-all
                                ${log.level === 'error' ? 'text-red-400' : log.level === 'warn' ? 'text-yellow-400' : 'text-[#c9d1d9]'}`}
                            >
                                <span className="text-[#484f58] shrink-0 w-24">{new Date(log.ts).toLocaleTimeString()}</span>
                                <span>{log.line}</span>
                            </div>
                        ))}
                        <div ref={logEndRef} />
                    </div>
                </div>
            </div>
        </div>
    );
}
