"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, User, Bot, Loader2, Sparkles } from "lucide-react";

interface Message {
    role: "user" | "assistant";
    content: string;
    timestamp: string;
}

export function ChatSidebar({ sessionId, status }: { sessionId: string | null; status: string }) {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: "Hi! I'm your Lumen Copilot. Paste a GitHub URL to start your deployment journey.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        // Initializing WebSocket for Groq chat
        const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'}/copilot/ws`;
        const socket = new WebSocket(wsUrl);

        socket.onopen = () => console.log("[CopilotWS] Connected");
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'chat:response') {
                const newMessage: Message = {
                    role: "assistant",
                    content: data.message,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                setMessages(prev => [...prev, newMessage]);
                setIsLoading(false);
            }
        };

        ws.current = socket;
        return () => socket.close();
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (!input || !ws.current) return;

        const userMsg: Message = {
            role: "user",
            content: input,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        ws.current.send(JSON.stringify({
            type: 'chat:message',
            message: input,
            sessionId
        }));

        setInput("");
    };

    return (
        <aside className="w-80 border-r border-zinc-800 bg-zinc-950 flex flex-col shrink-0 overflow-hidden relative group">
            {/* Decorative background flare */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[80px] rounded-full group-hover:bg-indigo-500/10 transition-colors"></div>

            <div className="p-4 border-b border-zinc-800 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-tr from-cyan-400 to-indigo-600 rounded-lg shadow-[0_0_10px_rgba(34,211,238,0.4)]">
                    <Sparkles size={16} className="text-white animate-pulse" />
                </div>
                <div className="font-bold flex flex-col">
                    <span className="text-sm">Lumen Copilot</span>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Active Guide
                    </span>
                </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((m, i) => (
                    <div key={i} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                        <div className={`p-3 rounded-2xl text-sm leading-relaxed max-w-[90%]
               ${m.role === "user"
                                ? "bg-indigo-600 text-white rounded-tr-none shadow-lg"
                                : "bg-zinc-900 text-zinc-300 rounded-tl-none border border-zinc-800"}
            `}>
                            {m.content}
                        </div>
                        <span className="text-[10px] text-zinc-600 mt-1 uppercase px-1">{m.role} • {m.timestamp}</span>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-center gap-2 text-zinc-600 text-[10px]">
                        <Loader2 size={14} className="animate-spin text-cyan-400" /> Thinking...
                    </div>
                )}
            </div>

            <div className="p-4 bg-zinc-900/30 backdrop-blur-3xl border-t border-zinc-800">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="Ask anything..."
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
                    />
                    <button
                        onClick={handleSend}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-zinc-500 hover:text-cyan-400 transition-colors"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </aside>
    );
}
