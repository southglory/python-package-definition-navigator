import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    console.log('Python Package Definition Navigator activated.');

    // Command for navigating to Python definitions (Ctrl+1 Ctrl+D)
    context.subscriptions.push(
        vscode.commands.registerCommand('pythonPackageNavigator.findDefinition', async () => {
            const editor = vscode.window.activeTextEditor;

            if (!editor) {
                vscode.window.showErrorMessage('No active editor!');
                return;
            }

            const selection = editor.selection;
            const selectedText = editor.document.getText(selection).trim();

            if (!selectedText) {
                vscode.window.showWarningMessage('No text selected!');
                return;
            }

            vscode.window.showInformationMessage(`Searching for definition: ${selectedText}`);

            const pythonPath = await getActivePythonPath();
            if (!pythonPath) {
                vscode.window.showErrorMessage('Failed to locate the active Python interpreter.');
                return;
            }

            const sitePackagesPath = path.join(path.dirname(pythonPath), '..', 'Lib', 'site-packages');
            if (!fs.existsSync(sitePackagesPath)) {
                vscode.window.showErrorMessage(`Site-packages directory not found: ${sitePackagesPath}`);
                return;
            }

            const results = await findInSitePackages(sitePackagesPath, selectedText);

            if (results.length === 0) {
                vscode.window.showWarningMessage(`No definition found for: ${selectedText} in site-packages.`);
                return;
            }

            if (results.length > 1) {
                const items = results.map((result) => ({
                    label: result.lineText,
                    description: result.uri.fsPath,
                    result,
                }));

                const picked = await vscode.window.showQuickPick(items, {
                    placeHolder: 'Multiple definitions found. Select one to open.',
                });

                if (!picked) {
                    return;
                }

                const { uri, line } = picked.result;
                await openFileAtLine(uri, line, selectedText);
            } else {
                const { uri, line } = results[0];
                await openFileAtLine(uri, line, selectedText);
            }
        })
    );

    // Command for finding files (Ctrl+1 Ctrl+F)
    context.subscriptions.push(
        vscode.commands.registerCommand('pythonPackageNavigator.findFile', async () => {
            const editor = vscode.window.activeTextEditor;

            if (!editor) {
                vscode.window.showErrorMessage('No active editor!');
                return;
            }

            const selection = editor.selection;
            const selectedText = editor.document.getText(selection).trim();

            if (!selectedText) {
                vscode.window.showWarningMessage('No text selected!');
                return;
            }

            vscode.window.showInformationMessage(`Searching for files named: ${selectedText}`);

            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders || workspaceFolders.length === 0) {
                vscode.window.showErrorMessage('No workspace found.');
                return;
            }

            const rootPath = workspaceFolders[0].uri.fsPath;

            const files = await findFilesByName(rootPath, selectedText);
            if (files.length === 0) {
                vscode.window.showWarningMessage(`No .py or .html files found with name: ${selectedText}`);
                return;
            }

            if (files.length > 1) {
                const items = files.map((file) => ({
                    label: path.basename(file),
                    description: file,
                }));

                const picked = await vscode.window.showQuickPick(items, {
                    placeHolder: 'Multiple files found. Select one to open.',
                });

                if (!picked) {
                    return;
                }

                const fileUri = vscode.Uri.file(picked.description);
                const document = await vscode.workspace.openTextDocument(fileUri);
                await vscode.window.showTextDocument(document);
            } else {
                const fileUri = vscode.Uri.file(files[0]);
                const document = await vscode.workspace.openTextDocument(fileUri);
                await vscode.window.showTextDocument(document);
            }
        })
    );
}

async function getActivePythonPath(): Promise<string | null> {
    const pythonExtension = vscode.extensions.getExtension('ms-python.python');
    if (!pythonExtension) {
        vscode.window.showErrorMessage('Python extension is not installed.');
        return null;
    }

    if (!pythonExtension.isActive) {
        await pythonExtension.activate();
    }

    const api = pythonExtension.exports;
    const interpreter = await api.settings.getExecutionDetails?.();

    if (interpreter?.execCommand?.length > 0) {
        return interpreter.execCommand[0];
    }

    return null;
}

async function findInSitePackages(sitePackagesPath: string, searchString: string): Promise<{ uri: vscode.Uri; line: number; lineText: string }[]> {
    const results: { uri: vscode.Uri; line: number; lineText: string }[] = [];

    async function searchDirectory(directory: string) {
        const entries = fs.readdirSync(directory, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(directory, entry.name);

            if (entry.isDirectory()) {
                await searchDirectory(fullPath);
            } else if (entry.isFile() && fullPath.endsWith('.py')) {
                const content = fs.readFileSync(fullPath, 'utf-8');
                const lines = content.split('\n');
                lines.forEach((lineText, line) => {
                    if (lineText.includes(searchString) && (lineText.trim().startsWith('def ') || lineText.trim().startsWith('class '))) {
                        results.push({
                            uri: vscode.Uri.file(fullPath),
                            line,
                            lineText: lineText.trim(),
                        });
                    }
                });
            }
        }
    }

    await searchDirectory(sitePackagesPath);
    return results;
}

async function findFilesByName(rootPath: string, searchName: string): Promise<string[]> {
    const results: string[] = [];

    async function searchDirectory(directory: string) {
        const entries = fs.readdirSync(directory, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(directory, entry.name);

            if (entry.isDirectory()) {
                await searchDirectory(fullPath);
            } else if (entry.isFile() && (entry.name === `${searchName}.py` || entry.name === `${searchName}.html`)) {
                results.push(fullPath);
            }
        }
    }

    await searchDirectory(rootPath);
    return results;
}

async function openFileAtLine(uri: vscode.Uri, line: number, keyword: string) {
    const document = await vscode.workspace.openTextDocument(uri);
    const editor = await vscode.window.showTextDocument(document);

    const position = new vscode.Position(line, 0);
    editor.selection = new vscode.Selection(position, position);
    editor.revealRange(new vscode.Range(position, position));

    const keywordRange = editor.document.getWordRangeAtPosition(new vscode.Position(line, keyword.length));
    if (keywordRange) {
        editor.selection = new vscode.Selection(keywordRange.start, keywordRange.end);
    }

    vscode.window.showInformationMessage(`Navigated to: ${keyword}`);
}

export function deactivate() {}
