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
