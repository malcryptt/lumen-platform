import * as vscode from 'vscode';
import * as path from 'path';
import {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
    TransportKind
} from 'vscode-languageclient/node';

let client: LanguageClient;

export function activate(context: vscode.ExtensionContext) {
    console.log('Lumen extension is now active');

    // LSP Server path
    let serverPath = 'lumen'; // Assumes lumen is in PATH
    let serverOptions: ServerOptions = {
        run: { command: serverPath, args: ['lsp'], transport: TransportKind.stdio },
        debug: { command: serverPath, args: ['lsp'], transport: TransportKind.stdio }
    };

    let clientOptions: LanguageClientOptions = {
        documentSelector: [{ scheme: 'file', language: 'lumen' }],
        synchronize: {
            fileEvents: vscode.workspace.createFileSystemWatcher('**/*.lm')
        }
    };

    client = new LanguageClient(
        'lumenLSP',
        'Lumen Language Server',
        serverOptions,
        clientOptions
    );

    client.start();

    // Status Bar
    let statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'lumen.restartLsp';
    statusBarItem.text = '$(zap) Lumen: LSP Active';
    statusBarItem.tooltip = 'Click to Restart LSP Server';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('lumen.restartLsp', () => {
            if (client) {
                statusBarItem.text = '$(sync~spin) Lumen: Restarting...';
                client.stop().then(() => {
                    client.start();
                    statusBarItem.text = '$(zap) Lumen: LSP Active';
                });
            }
        }),
        vscode.commands.registerCommand('lumen.runFile', () => {
            let activeEditor = vscode.window.activeTextEditor;
            if (activeEditor) {
                let terminal = vscode.window.createTerminal('Lumen Run');
                terminal.sendText(`lumen run "${activeEditor.document.fileName}"`);
                terminal.show();
            }
        }),
        vscode.commands.registerCommand('lumen.askCopilot', () => {
            const editor = vscode.window.activeTextEditor;
            const selectedCode = editor?.document.getText(editor.selection) || '';

            const panel = vscode.window.createWebviewPanel(
                'lumenCopilot',
                'Lumen AI Copilot',
                vscode.ViewColumn.Two,
                { enableScripts: true }
            );

            panel.webview.html = getCopilotWebviewHtml(selectedCode);

            panel.webview.onDidReceiveMessage(
                async (message) => {
                    switch (message.command) {
                        case 'askAI':
                            try {
                                const response = await fetch('http://localhost:3005/ai/chat', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ message: message.text, context: message.context })
                                });
                                const data = await response.json() as any;
                                panel.webview.postMessage({ command: 'receiveAI', text: data.reply });
                            } catch (err) {
                                panel.webview.postMessage({ command: 'receiveAI', text: "❌ Error connecting to Lumen Backend (is it running on port 3001?)" });
                            }
                            return;
                        case 'insertCode':
                            if (editor) {
                                editor.edit(editBuilder => {
                                    const pos = editor.selection.end;
                                    editBuilder.insert(pos, '\n' + message.code);
                                });
                            }
                            return;
                    }
                },
                undefined,
                context.subscriptions
            );
        })
    );


    // Debugging
    context.subscriptions.push(
        vscode.debug.registerDebugConfigurationProvider('lumen', new LumenDebugConfigurationProvider()),
        vscode.debug.registerDebugAdapterDescriptorFactory('lumen', new LumenDebugAdapterDescriptorFactory())
    );
}

class LumenDebugAdapterDescriptorFactory implements vscode.DebugAdapterDescriptorFactory {
    createDebugAdapterDescriptor(session: vscode.DebugSession, executable: vscode.DebugAdapterExecutable | undefined): vscode.ProviderResult<vscode.DebugAdapterDescriptor> {
        // Use the lumen binary as the DAP server
        return new vscode.DebugAdapterExecutable('lumen', ['dap']);
    }
}

class LumenDebugConfigurationProvider implements vscode.DebugConfigurationProvider {
    resolveDebugConfiguration(folder: vscode.WorkspaceFolder | undefined, config: vscode.DebugConfiguration, token?: vscode.CancellationToken): vscode.ProviderResult<vscode.DebugConfiguration> {
        if (!config.type && !config.request && !config.name) {
            const editor = vscode.window.activeTextEditor;
            if (editor && editor.document.languageId === 'lumen') {
                config.type = 'lumen';
                config.name = 'Launch';
                config.request = 'launch';
                config.program = '${file}';
                config.stopOnEntry = true;
            }
        }

        if (!config.program) {
            return vscode.window.showInformationMessage("Cannot find a program to debug").then(_ => {
                return undefined;
            });
        }

        return config;
    }
}

export function deactivate(): Thenable<void> | undefined {
    if (!client) {
        return undefined;
    }
    return client.stop();
}

function getCopilotWebviewHtml(selectedCode: string = '') {
    const escapedCode = selectedCode.replace(/`/g, '\\`').replace(/\$/g, '\\$');
    const contextSection = selectedCode
        ? `<div style="margin-bottom:10px;padding:8px;background:var(--vscode-editorWidget-background);border:1px solid var(--vscode-editorWidget-border);border-radius:6px;font-size:11px;">
            <div style="color:var(--vscode-descriptionForeground);margin-bottom:4px;">📎 Selected code context:</div>
            <pre style="margin:0;overflow-x:auto;font-family:var(--vscode-editor-font-family);font-size:11px;white-space:pre-wrap;">${selectedCode.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
           </div>`
        : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lumen AI Copilot</title>
    <style>
        * { box-sizing: border-box; }
        body { font-family: var(--vscode-font-family); font-size: 13px; padding: 10px; display: flex; flex-direction: column; height: 100vh; margin: 0; background: var(--vscode-editor-background); color: var(--vscode-editor-foreground); }
        #chat { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; margin-bottom: 10px; }
        .msg { max-width: 90%; padding: 8px 12px; border-radius: 8px; line-height: 1.5; word-wrap: break-word; white-space: pre-wrap; }
        .user { align-self: flex-end; background: var(--vscode-button-background); color: var(--vscode-button-foreground); border-radius: 8px 8px 2px 8px; }
        .ai { align-self: flex-start; background: var(--vscode-editorWidget-background); border: 1px solid var(--vscode-editorWidget-border); border-radius: 8px 8px 8px 2px; }
        .insert-btn { margin-top: 6px; padding: 4px 10px; font-size: 11px; border: 1px solid var(--vscode-button-background); background: transparent; color: var(--vscode-button-background); border-radius: 4px; cursor: pointer; }
        .insert-btn:hover { background: var(--vscode-button-background); color: var(--vscode-button-foreground); }
        #input-row { display: flex; gap: 6px; }
        textarea { flex: 1; padding: 8px; border-radius: 4px; border: 1px solid var(--vscode-input-border); background: var(--vscode-input-background); color: var(--vscode-input-foreground); font-family: var(--vscode-font-family); font-size: 13px; resize: none; min-height: 38px; max-height: 120px; }
        button#sendBtn { padding: 8px 14px; border: none; background: var(--vscode-button-background); color: var(--vscode-button-foreground); border-radius: 4px; cursor: pointer; align-self: flex-end; }
        button#sendBtn:hover { background: var(--vscode-button-hoverBackground); }
        .typing { font-style: italic; color: var(--vscode-descriptionForeground); font-size: 11px; }
    </style>
</head>
<body>
    ${contextSection}
    <div id="chat">
        <div class="msg ai">Hi! I'm Lumen Copilot. ${selectedCode ? 'I can see your selected code. Ask me anything about it!' : 'How can I help you write or deploy Lumen code today?'}</div>
    </div>
    <div id="input-row">
        <textarea id="prompt" placeholder="Ask anything about Lumen..." rows="1"></textarea>
        <button id="sendBtn">Send</button>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        const chat = document.getElementById('chat');
        const promptInput = document.getElementById('prompt');
        const sendBtn = document.getElementById('sendBtn');
        const selectedCode = \`${escapedCode}\`;

        function extractCode(text) {
            const m = text.match(/\`\`\`(?:lumen)?\\n([\\s\\S]*?)\`\`\`/);
            return m ? m[1] : null;
        }

        function addMessage(text, isUser) {
            const wrapper = document.createElement('div');
            wrapper.style.display = 'flex';
            wrapper.style.flexDirection = 'column';
            wrapper.style.alignItems = isUser ? 'flex-end' : 'flex-start';

            const div = document.createElement('div');
            div.className = 'msg ' + (isUser ? 'user' : 'ai');
            div.textContent = text;
            wrapper.appendChild(div);

            if (!isUser) {
                const code = extractCode(text);
                if (code) {
                    const btn = document.createElement('button');
                    btn.className = 'insert-btn';
                    btn.textContent = '⬆ Insert into Editor';
                    btn.onclick = () => vscode.postMessage({ command: 'insertCode', code });
                    wrapper.appendChild(btn);
                }
            }

            chat.appendChild(wrapper);
            chat.scrollTop = chat.scrollHeight;
        }

        promptInput.addEventListener('input', () => {
            promptInput.style.height = 'auto';
            promptInput.style.height = Math.min(promptInput.scrollHeight, 120) + 'px';
        });

        function send() {
            const text = promptInput.value.trim();
            if (!text) return;
            addMessage(text, true);
            promptInput.value = '';
            promptInput.style.height = 'auto';
            vscode.postMessage({ command: 'askAI', text, context: selectedCode || undefined });
            const typing = document.createElement('div');
            typing.className = 'typing';
            typing.id = 'typing-indicator';
            typing.textContent = 'Lumen Copilot is thinking...';
            chat.appendChild(typing);
            chat.scrollTop = chat.scrollHeight;
        }

        sendBtn.addEventListener('click', send);
        promptInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
        });

        window.addEventListener('message', event => {
            const message = event.data;
            const typing = document.getElementById('typing-indicator');
            if (typing) typing.remove();
            switch (message.command) {
                case 'receiveAI':
                    addMessage(message.text, false);
                    break;
            }
        });
    </script>
</body>
</html>`;
}
