"use client";
import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Share2, Save, Terminal as TerminalIcon, Book, Sparkles, Cpu, Zap, User as UserIcon, LogOut } from 'lucide-react';
import ExampleGallery from '@/components/ExampleGallery';
import CopilotSidebar from '@/components/Playground/CopilotSidebar';
import FileTree from '@/components/Playground/FileTree';
import AuthModal from '@/components/AuthModal';

export default function PlaygroundPage() {
    const [user, setUser] = useState<any>(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('lumen_user');
        if (storedUser) setUser(JSON.parse(storedUser));
    }, []);

    const [files, setFiles] = useState<{ [name: string]: string }>({
        'main.lm': '-- Welcome to the Lumen Playground\nprint("Hello, World!")\n',
        'utils.lm': '-- You can add helper functions here\nfunction greet(name)\n    print("Hello, " .. name)\nend\n'
    });
    const [activeFile, setActiveFile] = useState('main.lm');
    const [output, setOutput] = useState('── Output will appear here\n');
    const [isLoading, setIsLoading] = useState(false);
    const [showGallery, setShowGallery] = useState(false);
    const [showCopilot, setShowCopilot] = useState(true);
    const [isCompareMode, setIsCompareMode] = useState(false);
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
        setOutput('── Running Project...\n');

        if (isCompareMode) {
            setOutput(prev => prev + `⚖️ [MODE] Comparative Benchmarking Active\n`);
        }

        ws.current?.send(JSON.stringify({
            type: 'run',
            files, // Send the entire project
            entry: 'main.lm',
            options: { compareWithPython: isCompareMode }
        }));
        setIsLoading(false);
    };

    const createFile = () => {
        const name = prompt('Enter file name (e.g., helpers.lm):');
        if (name && !files[name]) {
            setFiles(prev => ({ ...prev, [name]: '-- New File\n' }));
            setActiveFile(name);
        }
    };

    const deleteFile = (name: string) => {
        if (name === 'main.lm') return;
        if (confirm(`Are you sure you want to delete ${name}?`)) {
            const newFiles = { ...files };
            delete newFiles[name];
            setFiles(newFiles);
            if (activeFile === name) setActiveFile('main.lm');
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[#0d1117] text-[#c9d1d9] font-sans overflow-hidden">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-3 border-b border-[#30363d] bg-[#161b22] relative z-20">
                <div className="flex items-center space-x-3">
                    <img src="/logo.png" alt="Lumen Logo" className="w-6 h-6 object-contain" />
                    <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                        Lumen Playground
                    </h1>
                </div>

                {/* Advanced Controls */}
                <div className="flex items-center space-x-4">
                    <div className="flex items-center bg-[#0d1117] border border-[#30363d] rounded-full p-1 h-9">
                        <button
                            onClick={() => setIsCompareMode(false)}
                            className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all ${!isCompareMode ? 'bg-[#21262d] text-white shadow-sm' : 'text-[#8b949e] hover:text-[#c9d1d9]'}`}
                        >
                            STANDARD
                        </button>
                        <button
                            onClick={() => setIsCompareMode(true)}
                            className={`px-3 py-1 text-[10px] font-bold rounded-full flex items-center space-x-1.5 transition-all ${isCompareMode ? 'bg-orange-600 text-white shadow-sm' : 'text-[#8b949e] hover:text-[#c9d1d9]'}`}
                        >
                            <Cpu size={10} />
                            <span>COMPARE</span>
                        </button>
                    </div>

                    <div className="h-6 w-[1px] bg-[#30363d]" />

                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => setShowGallery(!showGallery)}
                            className="flex items-center space-x-2 px-4 py-1.5 rounded-md bg-[#21262d] hover:bg-[#30363d] transition-colors text-sm font-medium border border-[#30363d]"
                        >
                            <Book size={16} />
                            <span className="hidden md:inline">Examples</span>
                        </button>
                        <button
                            onClick={() => setShowCopilot(!showCopilot)}
                            className={`flex items-center space-x-2 px-4 py-1.5 rounded-md transition-all text-sm font-medium border ${showCopilot ? 'bg-purple-600/20 border-purple-500/50 text-purple-400' : 'bg-[#21262d] border-[#30363d] hover:bg-[#30363d] text-[#c9d1d9]'}`}
                        >
                            <Sparkles size={16} />
                            <span className="hidden md:inline">Copilot</span>
                        </button>
                        <button
                            onClick={runCode}
                            disabled={isLoading}
                            className={`flex items-center space-x-2 px-5 py-1.5 rounded-md transition-all text-sm font-bold shadow-lg ${isCompareMode ? 'bg-orange-600 hover:bg-orange-500 shadow-orange-900/20' : 'bg-green-600 hover:bg-green-500 shadow-green-900/20'} disabled:opacity-50 text-white`}
                        >
                            <Play size={16} fill="currentColor" />
                            <span>{isCompareMode ? 'Benchmark' : 'Run'}</span>
                        </button>

                        <div className="h-6 w-[1px] bg-[#30363d]" />

                        {user ? (
                            <div className="flex items-center space-x-3 bg-[#0d1117] border border-[#30363d] px-3 py-1.5 rounded-full">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                                    {user.username.slice(0, 2)}
                                </div>
                                <span className="text-xs font-medium text-white hidden lg:inline">{user.username}</span>
                                <button
                                    onClick={() => {
                                        localStorage.removeItem('lumen_user');
                                        setUser(null);
                                    }}
                                    className="p-1 hover:text-red-400 transition-colors"
                                    title="Sign Out"
                                >
                                    <LogOut size={16} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsAuthModalOpen(true)}
                                className="flex items-center space-x-2 px-4 py-1.5 rounded-md bg-white text-black hover:bg-[#f0f0f0] transition-colors text-sm font-bold"
                            >
                                <UserIcon size={16} />
                                <span>Sign In</span>
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex flex-1 overflow-hidden relative">
                {/* File Explorer */}
                <FileTree
                    files={files}
                    activeFile={activeFile}
                    onSelect={setActiveFile}
                    onCreate={createFile}
                    onDelete={deleteFile}
                />

                {/* Editor Section */}
                <div className="flex-1 min-w-0 flex flex-col border-r border-[#30363d]">
                    <div className="flex-1">
                        <Editor
                            height="100%"
                            defaultLanguage="lua"
                            theme="vs-dark"
                            value={files[activeFile]}
                            onChange={(val) => setFiles(prev => ({ ...prev, [activeFile]: val || '' }))}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                padding: { top: 16 },
                                roundedSelection: true,
                                smoothScrolling: true,
                            }}
                        />
                    </div>
                </div>

                {/* Terminal Section */}
                <div className={`transition-all duration-300 flex flex-col bg-[#010409] ${showCopilot ? 'w-[400px]' : 'w-[500px]'}`}>
                    <div className="flex items-center justify-between px-4 py-2 border-b border-[#30363d] bg-[#0d1117]">
                        <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-[#8b949e]">
                            <TerminalIcon size={14} />
                            <span>Terminal Output</span>
                        </div>
                        {isCompareMode && (
                            <div className="flex items-center space-x-1.5 text-[10px] bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded border border-orange-500/20">
                                <Zap size={10} />
                                <span>Comparative Engine v2</span>
                            </div>
                        )}
                    </div>
                    <pre className="flex-1 p-4 font-mono text-[13px] overflow-y-auto whitespace-pre-wrap selection:bg-[#388bfd33] leading-relaxed">
                        {output}
                    </pre>
                </div>

                {/* Copilot Sidebar */}
                {showCopilot && (
                    <CopilotSidebar
                        onInsertCode={(newSnippet) => setFiles(prev => ({ ...prev, [activeFile]: prev[activeFile] + '\n' + newSnippet }))}
                    />
                )}
            </main>

            {/* Modals & Overlays */}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onLogin={setUser}
            />

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
                                setFiles({ 'main.lm': newCode });
                                setActiveFile('main.lm');
                                setShowGallery(false);
                            }} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
