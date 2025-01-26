import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

// 활성화 함수
export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('django.navigateToTemplateTag', async () => {
        const editor = vscode.window.activeTextEditor;

        if (!editor) {
            vscode.window.showErrorMessage('No active editor!');
            return;
        }

        const document = editor.document;
        const cursorPosition = editor.selection.active;
        const lineText = document.lineAt(cursorPosition.line).text;

        // `{% tag_name %}` 탐지
        const match = lineText.match(/\{% ([\w_]+) %\}/);
        if (match) {
            const tagName = match[1];
            const workspaceFolders = vscode.workspace.workspaceFolders;

            if (workspaceFolders) {
                for (const folder of workspaceFolders) {
                    const templatetagsPath = path.join(
                        folder.uri.fsPath,
                        'venv/lib/python3.8/site-packages/django_bootstrap5/templatetags'
                    );

                    if (fs.existsSync(templatetagsPath)) {
                        const tagFile = path.join(templatetagsPath, `bootstrap5.py`);

                        if (fs.existsSync(tagFile)) {
                            const document = await vscode.workspace.openTextDocument(tagFile);
                            await vscode.window.showTextDocument(document);
                            return;
                        }
                    }
                }
            }

            vscode.window.showErrorMessage(`Template tag '${tagName}' not found.`);
        } else {
            vscode.window.showErrorMessage('No template tag found on the current line.');
        }
    });

    context.subscriptions.push(disposable);
}

// 비활성화 함수
export function deactivate() {}
