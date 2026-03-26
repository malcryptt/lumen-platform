'use client';

import React from 'react';
import { BookOpen, Code, Zap, Globe, Cpu } from 'lucide-react';

export const EXAMPLES = [
    {
        id: 'hello',
        title: 'Hello World',
        description: 'The classic introduction to Lumen.',
        icon: <Globe size={20} className="text-blue-400" />,
        code: '-- Standard hello world\nprint("Hello, Lumen!")\n'
    },
    {
        id: 'api',
        title: 'REST API',
        description: 'Spin up a fast web server in seconds.',
        icon: <Zap size={20} className="text-yellow-400" />,
        code: 'import pixel-web\n\nlet app = web.create_app()\n\napp.get("/", fn(req, res) {\n    return "Welcome to the Lumen API!"\n})\n\nprint("Server starting on port 8080...")\napp.listen(8080)\n'
    },
    {
        id: 'tensor',
        title: 'Tensor Math',
        description: 'Native tensor support for ML and data science.',
        icon: <Cpu size={20} className="text-purple-400" />,
        code: 'import tensor as ts\n\n-- Create a 2x3 matrix\nlet a = ts.matrix([[1, 2, 3], [4, 5, 6]])\nlet b = ts.matrix([[7, 8], [9, 10], [11, 12]])\n\n-- Perform matrix multiplication\nlet c = a @ b\n\nprint("Result matrix:")\nprint(c)\n'
    },
    {
        id: 'crypto',
        title: 'Built-in Crypto',
        description: 'Secure hashing and encryption in the standard library.',
        icon: <Code size={20} className="text-green-400" />,
        code: 'import crypto\n\nlet secret = "Top Secret Message"\nlet hashed = crypto.sha256(secret)\n\nprint("SHA-256 for \'" .. secret .. "\':")\nprint(hashed)\n'
    }
];

export default function ExampleGallery({ onSelect }: { onSelect: (code: string) => void }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {EXAMPLES.map((example) => (
                <button
                    key={example.id}
                    onClick={() => onSelect(example.code)}
                    className="flex flex-col text-left p-4 rounded-xl border border-[#30363d] bg-[#161b22] hover:bg-[#21262d] hover:border-[#8b949e] transition-all group"
                >
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="p-2 rounded-lg bg-[#0d1117] group-hover:scale-110 transition-transform">
                            {example.icon}
                        </div>
                        <h4 className="font-bold text-white">{example.title}</h4>
                    </div>
                    <p className="text-sm text-[#8b949e] leading-relaxed">
                        {example.description}
                    </p>
                </button>
            ))}
        </div>
    );
}
