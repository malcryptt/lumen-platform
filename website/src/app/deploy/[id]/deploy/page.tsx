"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Copy, ExternalLink, Loader2, StopCircle, RefreshCw, AlertTriangle, Bug, CheckCircle2, Server, Activity } from 'lucide-react';

const BACKEND = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3005');

const STATUS_LABELS: Record<string, { label: string; bg: string; text: string; }> = {
    deploying: { label: 'Deploying', bg: 'bg-yellow-900/30 border-yellow-800', text: 'text-yellow-400' },
    deploy_failed: { label: 'Failed', bg: 'bg-red-900/30 border-red-800', text: 'text-red-400' },
    live: { label: 'Live', bg: 'bg-green-900/30 border-green-800', text: 'text-green-400' },
    diagnosing: { label: 'Diagnosing', bg: 'bg-purple-900/30 border-purple-800', text: 'text-purple-400' }
};

export default function DeployConsolePage({ params }: { params: { id: string } }) {
    const { id } = params;
    const [session, setSession] = useState<any>(null);
    const [logs, setLogs] = useState<{ ts: string, line: string, level: string }[]>([]);
    const [status, setStatus] = useState('idle');
    const [services, setServices] = useState<any[]>([]);
    const [url, setUrl] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const logEndRef = useRef<HTMLDivElement>(null);

    // Initial fetch
    useEffect(() => {
        fetch(`${BACKEND}/copilot/session/${id}`)
            .then(r => r.json())
            .then(async d => {
                setSession(d);
                setStatus(d.status);
                setUrl(d.renderServiceUrl || '');
                setServices(d.serviceStatuses || []);

                if (d.logs) setLogs(d.logs.reverse().map((l: any) => ({ ts: l.timestamp, line: l.line, level: l.level })));

                // Trigger deploy if it was ready but not started
                if (d.status === 'config_ready') {
                    await fetch(`${BACKEND}/copilot/deploy/${id}`, { method: 'POST' });
                    setStatus('deploying');
                }
            });
    }, [id]);

    // WebSocket for live updates
    useEffect(() => {
        let ws: WebSocket;
        let reconnectTimeout: NodeJS.Timeout;

        const connect = () => {
            const wsUrl = BACKEND.replace(/^http/, 'ws') + `/copilot/ws`;
            ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                ws.send(JSON.stringify({ event: 'deploy:subscribe', session_id: id }));
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.event === 'deploy:log') {
                    const payload = data.payload;
                    setLogs(prev => [...prev, { ts: payload.timestamp, line: payload.line, level: payload.level }]);
                } else if (data.event === 'deploy:progress') {
                    const payload = data.payload;
                    setStatus(payload.status);
                    if (payload.url) setUrl(payload.url);

                    // Fetch fresh session to update service list if status changed
                    fetch(`${BACKEND}/copilot/session/${id}`)
                        .then(r => r.json())
                        .then(d => { setServices(d.serviceStatuses || []); setStatus(d.status); });
                }
            };
            ws.onclose = () => { reconnectTimeout = setTimeout(connect, 3000); };
        };
        connect();

        return () => { clearTimeout(reconnectTimeout); ws?.close(); };
    }, [id]);

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
            <div className="w-full max-w-5xl flex flex-col flex-1">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3 tracking-tight">
                            Deploy Console
                            <span className={`px-3 py-1 text-[10px] uppercase font-bold rounded-full border ${s.bg} ${s.text}`}>
                                {s.label}
                                {status === 'deploying' && <Loader2 size={12} className="inline ml-2 animate-spin" />}
                            </span>
                        </h1>
                        <p className="text-[#8b949e] font-mono text-xs mt-1 opacity-60">ID: {id}</p>
                    </div>

                    <div className="flex gap-3">
                        {status === 'deploying' && (
                            <button onClick={handleCancel} className="px-4 py-2 border border-red-800 text-red-400 hover:bg-red-900/20 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                                <StopCircle size={16} /> Cancel Build
                            </button>
                        )}
                        {(status === 'deploy_failed' || status === 'live') && (
                            <button onClick={handleDiagnose} className="px-4 py-2 bg-[#161b22] border border-purple-500/30 text-purple-400 hover:bg-purple-900/20 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                                <Bug size={16} /> AI Diagnose
                            </button>
                        )}
                        {status === 'live' && url && (
                            <a href={url} target="_blank" rel="noopener noreferrer" className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-purple-900/30">
                                Visit Site <ExternalLink size={16} />
                            </a>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 items-start">
                    {/* Left: Service List (Section 8.4) */}
                    <div className="lg:col-span-1 space-y-4">
                        <h2 className="text-sm font-bold text-[#8b949e] uppercase tracking-widest flex items-center gap-2">
                            <Server size={14} /> Services
                        </h2>
                        {services.length === 0 ? (
                            <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-xl text-xs text-[#484f58] italic text-center">
                                Single-service build
                            </div>
                        ) : services.map((svc: any) => (
                            <div key={svc.id} className={`p-4 rounded-xl border transition-all duration-300 ${svc.status === 'live' ? 'bg-green-900/10 border-green-800/50' : svc.status === 'deploying' ? 'bg-yellow-900/10 border-yellow-800/50 animate-pulse' : 'bg-[#161b22] border-[#30363d]'}`}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-bold truncate max-w-[100px]">{svc.serviceName}</span>
                                    {svc.status === 'live' ? <CheckCircle2 size={12} className="text-green-400" /> : <Activity size={12} className="text-yellow-400" />}
                                </div>
                                <div className="text-[10px] text-[#8b949e] font-mono truncate">{svc.serviceRoot}</div>
                            </div>
                        ))}
                    </div>

                    {/* Middle: Terminal & Diagnosis */}
                    <div className="lg:col-span-3 space-y-6 flex flex-col h-full">
                        {/* Live URL Banner */}
                        {status === 'live' && url && (
                            <div className="p-4 bg-green-900/20 border border-green-800 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-4">
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

                        {/* Terminal */}
                        <div className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-2xl overflow-hidden flex flex-col shadow-2xl min-h-[500px]">
                            <div className="bg-[#161b22] px-4 py-2 flex items-center gap-2 border-b border-[#30363d] sticky top-0 z-10 shrink-0">
                                <Terminal size={16} className="text-[#8b949e]" />
                                <span className="text-xs font-semibold text-[#8b949e]">System Engine Logs</span>
                                <div className="ml-auto text-[10px] font-mono text-[#484f58]">{logs.length} events streamed</div>
                            </div>
                            <div className="p-5 font-mono text-[12px] leading-relaxed overflow-y-auto flex-1 custom-scrollbar">
                                {logs.length === 0 ? (
                                    <div className="text-[#484f58] italic py-4 animate-pulse">Establishing secure link to v2 runner...</div>
                                ) : logs.map((log, i) => (
                                    <div key={i} className={`flex gap-4 hover:bg-[#21262d] py-1 px-2 rounded -mx-2 whitespace-pre-wrap break-all border-l-2 ${log.level === 'error' ? 'text-red-400 border-red-500 bg-red-900/10' : log.level === 'warn' ? 'text-yellow-400 border-yellow-500 bg-yellow-900/10' : 'text-[#c9d1d9] border-transparent'}`}
                                    >
                                        <span className="text-[#484f58] shrink-0 w-24 tabular-nums">{new Date(log.ts).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                                        <span>{log.line}</span>
                                    </div>
                                ))}
                                <div ref={logEndRef} />
                            </div>
                        </div>

                        {/* Diagnosis Section */}
                        {(diagnosis || session?.diagnosis) && status !== 'deploying' && (
                            <div className="p-6 bg-[#161b22] border-l-4 border-purple-500 rounded-xl shadow-xl animate-in fade-in zoom-in-95">
                                <h3 className="font-bold flex items-center gap-2 text-purple-400 mb-4 text-sm uppercase tracking-widest">
                                    <Bug size={18} /> Diagnosis Report
                                </h3>
                                <div className="prose prose-invert max-w-none text-xs text-[#c9d1d9] whitespace-pre-wrap font-mono leading-relaxed bg-[#0d1117] p-4 rounded-lg border border-[#30363d]">
                                    {diagnosis || session.diagnosis}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
