"use client";
import React, { useState, useEffect } from 'react';
import { Save, Rocket, CheckCircle2, AlertCircle, Loader2, FileCode } from 'lucide-react';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export default function ConfigEditorPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const [configText, setConfigText] = useState('');
    const [validation, setValidation] = useState<{ valid: boolean; errors: string[] } | null>(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        fetch(`${BACKEND}/copilot/config/${id}`)
            .then(r => r.json())
            .then(d => {
                setConfigText(d.configText || d.lumenConfig || '');
                if (d.validation) setValidation(d.validation);
            });
    }, [id]);

    const handleSave = async () => {
        setSaving(true); setSaved(false);
        await fetch(`${BACKEND}/copilot/config/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lumenConfig: configText })
        });
        setSaving(false); setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="min-h-screen bg-[#0d0d0f] text-white flex flex-col">
            {/* Toolbar */}
            <div className="border-b border-[#30363d] bg-[#161b22] px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <FileCode size={18} className="text-violet-400" />
                    <span className="font-semibold text-sm">deploy.lumen</span>
                    <span className="text-xs text-[#484f58] font-mono">{id.slice(0, 8)}…</span>
                </div>
                <div className="flex items-center gap-2">
                    <a
                        href={`/deploy/${id}/secrets`}
                        className="text-sm text-[#8b949e] hover:text-white px-3 py-1.5 rounded-lg hover:bg-[#21262d] transition-all"
                    >
                        Secrets Manager
                    </a>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        id="save-config-btn"
                        className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-lg bg-[#21262d] border border-[#30363d] hover:border-violet-500 transition-all"
                    >
                        {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <CheckCircle2 size={14} className="text-green-400" /> : <Save size={14} />}
                        {saved ? 'Saved!' : 'Save'}
                    </button>
                    <a
                        href={`/deploy/${id}/deploy`}
                        id="go-to-deploy-btn"
                        className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 text-white transition-all"
                    >
                        <Rocket size={14} /> Deploy
                    </a>
                </div>
            </div>

            {/* Validation banner */}
            {validation && !validation.valid && (
                <div className="m-4 p-3 bg-red-900/20 border border-red-800 rounded-xl">
                    <div className="flex items-center gap-2 text-red-400 text-sm font-semibold mb-2">
                        <AlertCircle size={15} /> Config Validation Errors
                    </div>
                    {validation.errors.map((e, i) => (
                        <div key={i} className="text-red-300 text-xs font-mono">{e}</div>
                    ))}
                </div>
            )}

            {/* Editor */}
            <div className="flex-1 p-4">
                <textarea
                    id="config-editor"
                    value={configText}
                    onChange={e => setConfigText(e.target.value)}
                    className="w-full h-full min-h-[60vh] bg-[#0d1117] border border-[#30363d] rounded-xl p-6 font-mono text-sm text-[#c9d1d9] outline-none focus:border-violet-500 resize-none leading-6 transition-colors"
                    spellCheck={false}
                    placeholder={`deploy {\n  name:     "my-app"\n  provider: render\n  build {\n    runtime: node\n    command: "npm install && npm run build"\n  }\n  start {\n    command: "npm start"\n    port:    3000\n  }\n}`}
                />
            </div>
        </div>
    );
}
