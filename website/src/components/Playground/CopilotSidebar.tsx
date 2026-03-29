"use client";
import React, { useState } from 'react';
import { Sparkles, Send, Copy, Eraser, MessageSquare, Terminal } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function CopilotSidebar({ onInsertCode }: { onInsertCode: (code: string) => void }) {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Hello! I'm the Lumen Copilot. How can I help you with your Lumen code today?" }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg as Message]);
        setInput('');
        setIsTyping(true);

        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
            const response = await fetch(`${backendUrl}/ai/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input })
            });

            if (response.ok) {
                const data = await response.json();
                setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting to the AI brain right now." }]);
            }
        } catch (e) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Connection error. Please try again later." }]);
        } finally {
            setIsTyping(false);
        }
    };

    const extractCode = (text: string) => {
        const match = text.match(/```(?:lumen)?\n([\s\S]*?)```/);
        return match ? match[1] : null;
    };

    return (
        <div className="flex flex-col h-full bg-[#0d1117] border-l border-[#30363d] w-80">
            <div className="p-4 border-b border-[#30363d] flex items-center justify-between bg-[#161b22]">
                <div className="flex items-center space-x-2">
                    <Sparkles className="text-purple-400" size={18} />
                    <span className="font-bold text-white text-sm tracking-tight">Lumen Copilot</span>
                </div>
                <button
                    onClick={() => setMessages([{ role: 'assistant', content: "Cleared! What's next?" }])}
                    className="text-[#8b949e] hover:text-white transition-colors"
                >
                    <Eraser size={16} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-[#30363d]">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[90%] p-3 rounded-2xl text-xs leading-relaxed ${msg.role === 'user'
                            ? 'bg-blue-600 text-white rounded-tr-none'
                            : 'bg-[#161b22] text-[#c9d1d9] border border-[#30363d] rounded-tl-none'
                            }`}>
                            {msg.content}
                            {msg.role === 'assistant' && extractCode(msg.content) && (
                                <button
                                    onClick={() => onInsertCode(extractCode(msg.content)!)}
                                    className="mt-3 w-full flex items-center justify-center space-x-2 py-1.5 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-lg transition-all text-[10px] font-bold text-white"
                                >
                                    <Terminal size={12} />
                                    <span>Insert into Editor</span>
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex space-x-1 p-2 bg-[#161b22] w-12 rounded-full border border-[#30363d] animate-pulse">
                        <div className="w-1.5 h-1.5 bg-[#8b949e] rounded-full" />
                        <div className="w-1.5 h-1.5 bg-[#8b949e] rounded-full" />
                        <div className="w-1.5 h-1.5 bg-[#8b949e] rounded-full" />
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-[#30363d] bg-[#0d1117]">
                <div className="relative">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                        placeholder="Ask a question..."
                        className="w-full bg-[#161b22] border border-[#30363d] rounded-xl p-3 pr-10 text-xs text-white placeholder-[#484f58] focus:border-blue-500 focus:outline-none resize-none min-h-[44px] max-h-32"
                        rows={1}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className="absolute right-2 bottom-2 p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 disabled:hover:bg-blue-600 transition-all"
                    >
                        <Send size={14} />
                    </button>
                </div>
                <p className="mt-2 text-[10px] text-[#484f58] text-center">
                    AI can make mistakes. Always review the code.
                </p>
            </div>
        </div>
    );
}
