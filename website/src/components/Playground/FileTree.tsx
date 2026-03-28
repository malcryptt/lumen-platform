"use client";
import React from 'react';
import { FileCode, Plus, X, FolderOpen, FileText } from 'lucide-react';

interface FileTreeProps {
    files: { [name: string]: string };
    activeFile: string;
    onSelect: (name: string) => void;
    onCreate: () => void;
    onDelete: (name: string) => void;
}

export default function FileTree({ files, activeFile, onSelect, onCreate, onDelete }: FileTreeProps) {
    return (
        <div className="flex flex-col h-full bg-[#0d1117] border-r border-[#30363d] w-56">
            <div className="p-4 border-b border-[#30363d] flex items-center justify-between bg-[#161b22]">
                <div className="flex items-center space-x-2">
                    <FolderOpen className="text-blue-400" size={16} />
                    <span className="font-bold text-white text-xs uppercase tracking-wider">Explorer</span>
                </div>
                <button
                    onClick={onCreate}
                    className="p-1 hover:bg-[#30363d] rounded text-[#8b949e] hover:text-white transition-all"
                    title="New File"
                >
                    <Plus size={16} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-[#30363d]">
                {Object.keys(files).map((name) => (
                    <div
                        key={name}
                        onClick={() => onSelect(name)}
                        className={`group flex items-center justify-between px-4 py-2 cursor-pointer transition-all ${activeFile === name
                                ? 'bg-[#21262d] text-white border-l-2 border-blue-500'
                                : 'text-[#8b949e] hover:bg-[#161b22] hover:text-[#c9d1d9]'
                            }`}
                    >
                        <div className="flex items-center space-x-2 overflow-hidden">
                            {name.endsWith('.lm') ? (
                                <FileCode className="text-blue-400 flex-shrink-0" size={14} />
                            ) : (
                                <FileText className="text-[#8b949e] flex-shrink-0" size={14} />
                            )}
                            <span className="text-xs truncate font-medium">{name}</span>
                        </div>
                        {name !== 'main.lm' && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(name);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all"
                            >
                                <X size={12} />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <div className="p-4 border-t border-[#30363d] bg-[#0d1117] text-[10px] text-[#484f58] uppercase font-bold tracking-widest text-center">
                Lumen Project v1.0
            </div>
        </div>
    );
}
