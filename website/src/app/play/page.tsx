"use client";
import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Share2, Save, Terminal as TerminalIcon, Book } from 'lucide-react';
import ExampleGallery from '@/components/ExampleGallery';

export default function PlaygroundPage() {
    const [code, setCode] = useState('-- Welcome to the Lumen Playground\nprint("Hello, World!")\n');
    const [output, setOutput] = useState('── Output will appear here\n');
    const [isLoading, setIsLoading] = useState(false);
    const [showGallery, setShowGallery] = useState(false);
    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        let backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'localhost:3001';

        // Clean URL: remove protocols and trailing slashes
        backendUrl = backendUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
        const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
        const finalUrl = `${protocol}${backendUrl}/ws/exec`;

        setOutput(`🛰️ Connecting to ${finalUrl}...\n`);
        ws.current = new WebSocket(finalUrl);

        ws.current.onopen = () => {
            setOutput(prev => prev + `✅ Connected! Ready to run.\n`);
        };

        ws.current.onerror = () => {
            setOutput(prev => prev + `❌ Connection Failed. Check NEXT_PUBLIC_BACKEND_URL or Render logs.\n`);
        };

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'output') {
                setOutput(prev => prev + data.data);
            }
        };
        return () => ws.current?.close();
    }, []);

    const runCode = () => {
        setIsLoading(true);
        setOutput('── Running...\n');
        ws.current?.send(JSON.stringify({ type: 'run', code }));
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col h-screen bg-[#0d1117] text-[#c9d1d9] font-sans">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-3 border-b border-[#30363d] bg-[#161b22]">
                <div className="flex items-center space-x-3">
                    <img src="/logo.png" alt="Lumen Logo" className="w-6 h-6 object-contain" />
                    <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                        Lumen Playground
                    </h1>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setShowGallery(!showGallery)}
                        className="flex items-center space-x-2 px-4 py-1.5 rounded-md bg-[#21262d] hover:bg-[#30363d] transition-colors text-sm font-medium border border-[#30363d]"
                    >
                        <Book size={16} />
                        <span>Examples</span>
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-1.5 rounded-md bg-[#21262d] hover:bg-[#30363d] transition-colors text-sm font-medium border border-[#30363d]">
                        <Share2 size={16} />
                        <span>Share</span>
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-1.5 rounded-md bg-[#21262d] hover:bg-[#30363d] transition-colors text-sm font-medium border border-[#30363d]">
                        <Save size={16} />
                        <span>Save</span>
                    </button>
                    <button
                        onClick={runCode}
                        disabled={isLoading}
                        className="flex items-center space-x-2 px-5 py-1.5 rounded-md bg-green-600 hover:bg-green-500 disabled:opacity-50 transition-colors text-white text-sm font-bold shadow-lg shadow-green-900/20"
                    >
                        <Play size={16} fill="currentColor" />
                        <span>Run</span>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex flex-1 overflow-hidden">
                {/* Editor Section */}
                <div className="flex-1 min-w-0 border-r border-[#30363d]">
                    <Editor
                        height="100%"
                        defaultLanguage="lua" // Using lua as a proxy for lumen highlighting until custom defined
                        theme="vs-dark"
                        value={code}
                        onChange={(val) => setCode(val || '')}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            padding: { top: 16 },
                        }}
                    />
                </div>

                {/* Terminal Section */}
                <div className="w-[450px] flex flex-col bg-[#010409]">
                    <div className="flex items-center space-x-2 px-4 py-2 border-b border-[#30363d] bg-[#0d1117] text-xs font-semibold uppercase tracking-wider text-[#8b949e]">
                        <TerminalIcon size={14} />
                        <span>Terminal Output</span>
                    </div>
                    <pre className="flex-1 p-4 font-mono text-sm overflow-y-auto whitespace-pre-wrap selection:bg-[#388bfd33]">
                        {output}
                    </pre>
                </div>
            </main>

            {/* Examples Overlay */}
            {showGallery && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-8">
                    <div className="bg-[#161b22] w-full max-w-4xl max-h-[80vh] rounded-2xl border border-[#30363d] shadow-2xl flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between px-8 py-6 border-b border-[#30363d]">
                            <h3 className="text-2xl font-bold text-white">Example Gallery</h3>
                            <button
                                onClick={() => setShowGallery(false)}
                                className="text-[#8b949e] hover:text-white transition-colors text-2xl"
                            >
                                &times;
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8">
                            <ExampleGallery onSelect={(newCode) => {
                                setCode(newCode);
                                setShowGallery(false);
                            }} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
