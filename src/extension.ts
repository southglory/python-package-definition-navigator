import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    console.log('Extension "django.findInSitePackages" is now active!');

    context.subscriptions.push(
        vscode.commands.registerCommand('django.findInSitePackages', async () => {
            console.log('Command "django.findInSitePackages" executed');
            const editor = vscode.window.activeTextEditor;``

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

            vscode.window.showInformationMessage(`Searching for: ${selectedText} in site-packages`);

            // Python 가상환경 경로 가져오기
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

            // Lib/site-packages 내 파일 검색 및 텍스트 검색
            const results = await findInSitePackages(sitePackagesPath, selectedText);

            if (results.length === 0) {
                vscode.window.showWarningMessage(`No definition found for: ${selectedText} in site-packages.`);
                return;
            }

            // 결과가 여러 개인 경우 선택
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

async function openFileAtLine(uri: vscode.Uri, line: number, keyword: string) {
    const document = await vscode.workspace.openTextDocument(uri);
    const editor = await vscode.window.showTextDocument(document);

    // 커서 이동 및 강조
    const position = new vscode.Position(line, 0);
    editor.selection = new vscode.Selection(position, position);
    editor.revealRange(new vscode.Range(position, position));

    // 키워드 강조
    const keywordRange = editor.document.getWordRangeAtPosition(new vscode.Position(line, keyword.length));
    if (keywordRange) {
        editor.selection = new vscode.Selection(keywordRange.start, keywordRange.end);
    }

    vscode.window.showInformationMessage(`Navigated to: ${keyword}`);
}

export function deactivate() {}
