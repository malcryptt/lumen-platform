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
            const panel = vscode.window.createWebviewPanel(
                'lumenCopilot',
                'Lumen AI Copilot',
                vscode.ViewColumn.Two,
                { enableScripts: true }
            );

            panel.webview.html = getCopilotWebviewHtml();

            panel.webview.onDidReceiveMessage(
                async (message) => {
                    switch (message.command) {
                        case 'askAI':
                            try {
                                const response = await fetch('http://localhost:3001/ai/chat', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ message: message.text })
                                });
                                const data = await response.json() as any;
                                panel.webview.postMessage({ command: 'receiveAI', text: data.reply });
                            } catch (err) {
                                panel.webview.postMessage({ command: 'receiveAI', text: "❌ Error connecting to Lumen Backend (is it running on port 3001?)" });
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

function getCopilotWebviewHtml() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lumen AI Copilot</title>
    <style>
        body { font-family: var(--vscode-font-family); padding: 10px; display: flex; flex-direction: column; height: 100vh; margin: 0; box-sizing: border-box; background: var(--vscode-editor-background); color: var(--vscode-editor-foreground); }
        #chat { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; margin-bottom: 10px; }
        .msg { max-width: 85%; padding: 8px 12px; border-radius: 8px; line-height: 1.4; word-wrap: break-word; }
        .user { align-self: flex-end; background: var(--vscode-button-background); color: var(--vscode-button-foreground); }
        .ai { align-self: flex-start; background: var(--vscode-editorWidget-background); border: 1px solid var(--vscode-editorWidget-border); }
        #input-container { display: flex; gap: 8px; }
        input { flex: 1; padding: 8px; border-radius: 4px; border: 1px solid var(--vscode-input-border); background: var(--vscode-input-background); color: var(--vscode-input-foreground); font-family: var(--vscode-font-family); }
        button { padding: 8px 12px; border: none; background: var(--vscode-button-background); color: var(--vscode-button-foreground); border-radius: 4px; cursor: pointer; }
        button:hover { background: var(--vscode-button-hoverBackground); }
    </style>
</head>
<body>
    <div id="chat">
        <div class="msg ai">Hi! I'm Lumen Copilot. How can I help you write or deploy your Lumen code today?</div>
    </div>
    <div id="input-container">
        <input type="text" id="prompt" placeholder="Ask anything about Lumen..." />
        <button id="sendBtn">Send</button>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        const chat = document.getElementById('chat');
        const promptInput = document.getElementById('prompt');
        const sendBtn = document.getElementById('sendBtn');

        function addMessage(text, isUser) {
            const div = document.createElement('div');
            div.className = 'msg ' + (isUser ? 'user' : 'ai');
            div.textContent = text;
            chat.appendChild(div);
            chat.scrollTop = chat.scrollHeight;
        }

        function send() {
            const text = promptInput.value.trim();
            if (!text) return;
            addMessage(text, true);
            promptInput.value = '';
            vscode.postMessage({ command: 'askAI', text });
        }

        sendBtn.addEventListener('click', send);
        promptInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') send();
        });

        window.addEventListener('message', event => {
            const message = event.data;
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
