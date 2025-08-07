// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import * as csv from "csv-parser";

function readFileStream(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
        let htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
            <style>
            table {
                font-size: 14px;
                width: 100%;
                table-layout: fixed;
                border-collapse: collapse;
                margin: 10px;
            }
            td, th {
                border: 1px solid gray;
                padding: 5px;
                text-align: left;
            }
            td:active {
                background-color: gray;
            }
            </style>
            
            <script>
            const vscode = acquireVsCodeApi();
            function handleClick(e) {
                vscode.postMessage({command: "openvar", text: e.innerText});
            }
            </script>
            </head>
            <body>
            <table>`;

        const readStream = fs.createReadStream(filePath);

        readStream
            .pipe(csv())
            .on("headers", (headers: string[]) => {
                htmlContent += "<tr>";
                headers.forEach((header) => {
                    htmlContent += `<th>${header}</th>`;
                });
                htmlContent += "</tr>";
            })
            .on("data", (row: any) => {
                htmlContent += "<tr>";
                let isFirstKey = true; // 标志变量，初始值为 true，用于每一行
                for (let key in row) {
                    if (isFirstKey) {
                        htmlContent += `<td onclick='handleClick(this)'>${row[key]}</td>`;
                        isFirstKey = false; // 处理完第一个键后，将标志变量设为 false
                    } else {
                        htmlContent += `<td>${row[key]}</td>`;
                    }
                }
                htmlContent += "</tr>";
            })
            .on("end", () => {
                htmlContent += "</table></body></html>";
                // 延长删除时间，给更多时间让界面加载
                setTimeout(() => {
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            console.log("Failed to delete temp file:", err);
                        } else {
                            console.log("Successfully deleted temp file:", filePath);
                        }
                    });
                }, 3000); // 增加到3秒
                resolve(htmlContent);
            })
            .on("error", (err: Error) => {
                reject(err);
            });
    });
}

async function getScopeWebViewHtml(
    filePath: string,
    delay: number,
    retryCount: number = 0
): Promise<string> {
    const maxRetries = 10; // 最大重试次数
    
    if (fs.existsSync(filePath)) {
        try {
            return await readFileStream(filePath);
        } catch (error) {
            console.log("Error reading file:", error);
            // 如果读取失败，返回一个简单的空表格
            return `
                <!DOCTYPE html>
                <html>
                <head>
                <style>
                table {
                    font-size: 14px;
                    width: 100%;
                    table-layout: fixed;
                    border-collapse: collapse;
                    margin: 10px;
                }
                td, th {
                    border: 1px solid gray;
                    padding: 5px;
                    text-align: left;
                }
                </style>
                </head>
                <body>
                <table>
                <tr><th>Name</th><th>Value</th><th>Class</th></tr>
                <tr><td colspan="3">No variables found or error reading data</td></tr>
                </table>
                </body>
                </html>
            `;
        }
    } else if (retryCount < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        return await getScopeWebViewHtml(filePath, delay, retryCount + 1);
    } else {
        // 超过最大重试次数，返回空表格
        return `
            <!DOCTYPE html>
            <html>
            <head>
            <style>
            table {
                font-size: 14px;
                width: 100%;
                table-layout: fixed;
                border-collapse: collapse;
                margin: 10px;
            }
            td, th {
                border: 1px solid gray;
                padding: 5px;
                text-align: left;
            }
            </style>
            </head>
            <body>
            <table>
            <tr><th>Name</th><th>Value</th><th>Class</th></tr>
            <tr><td colspan="3">No variables file found after retries</td></tr>
            </table>
            </body>
            </html>
        `;
    }
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json

    let config = vscode.workspace.getConfiguration("matlab-in-vscode");
    let matlabPybackend = config.get("matlabPybackend") as boolean;
    let matlabPythonPath = config.get("matlabPythonPath") as string;
    let matlabStartup = config.get("matlabStartup") as string[];
    let matlabStartupDelay = config.get("matlabStartupDelay") as number;
    let matlabCMD = config.get("matlabCMD") as string;
    let matlabMoveToNext = config.get("matlabMoveToNext") as boolean;
    let matlabScope: vscode.WebviewPanel | undefined;

    function findMatlabTerminal() {
        let matlabTerminalId = context.workspaceState.get("matlabTerminalId");
        if (matlabTerminalId !== undefined) {
            return vscode.window.terminals.find((x) => x.name === "MATLAB");
        } else {
            return undefined;
        }
    }

    function sendToMatlab(command: string) {
        // save the file and wait for it to be saved
        let activeTextEditor = vscode.window.activeTextEditor;
        if (activeTextEditor) {
            activeTextEditor.document.save().then(() => {
                let matlabTerminal = findMatlabTerminal();
                if (matlabTerminal !== undefined) {
                    command += "\nvariable_info;\n";
                    matlabTerminal.sendText(command);
                    updateScope();
                } else {
                    matlabTerminal = startMatlab();
                }
            });
        }
    }

    function startMatlab() {
        let matlabTerminal = findMatlabTerminal();
        // get workspace path
        let workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
        if (matlabTerminal === undefined) {
            matlabTerminal = vscode.window.createTerminal({
                name: "MATLAB",
                cwd: workspacePath,
            });
            context.workspaceState.update(
                "matlabTerminalId",
                matlabTerminal.processId
            );

            // 自动复制 variable_info.m 到工作区根目录（如果不存在的话）
            if (workspacePath) {
                let sourceFile = path.join(context.asAbsolutePath(""), "matlab_code", "variable_info.m");
                let targetFile = path.join(workspacePath, "variable_info.m");
                
                if (!fs.existsSync(targetFile) && fs.existsSync(sourceFile)) {
                    try {
                        fs.copyFileSync(sourceFile, targetFile);
                        console.log(`Copied variable_info.m to workspace: ${targetFile}`);
                    } catch (error) {
                        console.log(`Failed to copy variable_info.m: ${error}`);
                    }
                }
            }

            let startupCommand = "";
            for (let i = 0; i < matlabStartup.length; i++) {
                startupCommand += matlabStartup[i];
            }
            // 添加扩展目录到 MATLAB 路径，确保 variable_info.m 可用
            let matlabCodePath = path.join(context.asAbsolutePath(""), "matlab_code").replace(/\\/g, '/');
            startupCommand += `addpath('${matlabCodePath}');`;
            startupCommand += `disp('Added path: ${matlabCodePath}');`;

            let bringupCommand = "";
            if (matlabPybackend) {
                let scriptPath = path.join(
                    context.asAbsolutePath(""),
                    "/pybackend/matlab_engine.py"
                );
                bringupCommand =
                    matlabPythonPath +
                    ` "${scriptPath}" --cmd="${startupCommand}"`;
            } else {
                bringupCommand = matlabCMD + "\n" + startupCommand + "\n";
            }

            setTimeout(() => {
                // 在这里，一秒已经过去了。
                // 现在发送命令到 MATLAB 终端
                if (matlabTerminal !== undefined) {
                    matlabTerminal.sendText(bringupCommand);
                }
            }, matlabStartupDelay);
        }
        matlabTerminal.show(true);
        return matlabTerminal;
    }

    function runMatlabCell() {
        let activeTextEditor = vscode.window.activeTextEditor;
        if (activeTextEditor) {
            let code = activeTextEditor.document.getText();
            let activeLine = activeTextEditor.document.lineAt(
                activeTextEditor.selection.active
            ).lineNumber;
            let lines = code.split("\n");
            // find the cell that contains the current line
            let cellStart = activeLine;
            while (cellStart > 0) {
                if (lines[cellStart].startsWith("%%")) {
                    break;
                }
                cellStart--;
            }
            let cellEnd = activeLine + 1;
            while (cellEnd < lines.length) {
                if (lines[cellEnd].startsWith("%%")) {
                    break;
                }
                cellEnd++;
            }
            let codeToRun = lines.slice(cellStart, cellEnd).join("\n");
            sendToMatlab(codeToRun);
        }
    }

    function runMatlabLine() {
        let activeTextEditor = vscode.window.activeTextEditor;
        if (activeTextEditor) {
            let code = activeTextEditor.document.getText();
            let activeLine = activeTextEditor.document.lineAt(
                activeTextEditor.selection.active
            ).lineNumber;
            let startLine = activeTextEditor.document.lineAt(
                activeTextEditor.selection.start
            ).lineNumber;
            let endLine = activeTextEditor.document.lineAt(
                activeTextEditor.selection.end
            ).lineNumber;
            let lines = code.split("\n");
            var codeToRun = "";
            if (startLine === endLine) {
                codeToRun = lines[activeLine];
                if (matlabMoveToNext) {
                    vscode.commands.executeCommand("cursorMove", {
                        to: "down",
                        by: "line",
                        value: 1,
                    });
                }
            } else {
                codeToRun = lines.slice(startLine, endLine + 1).join("\n");
            }
            sendToMatlab(codeToRun);
        }
    }

    function runMatlabFile() {
        let filePath = vscode.window.activeTextEditor?.document.fileName;
        if (filePath !== undefined) {
            let absolutePath = path.resolve(filePath);
            let matlabCommand = `run('${absolutePath}')`;
            console.log(matlabCommand);
            sendToMatlab(matlabCommand);
        }
    }

    function cdFileDirectory() {
        let filePath = vscode.window.activeTextEditor?.document.fileName;
        if (filePath !== undefined) {
            let matlabCommand = `cd('${path.dirname(filePath)}')`;
            sendToMatlab(matlabCommand);
        }
    }

    function interruptMatlab() {
        let matlabTerminal = findMatlabTerminal();
        if (matlabTerminal !== undefined) {
            // send ctrl+c
            matlabTerminal.sendText(String.fromCharCode(3));
        }
    }

    function stopMatlab() {
        let matlabTerminal = findMatlabTerminal();
        if (matlabTerminal !== undefined) {
            matlabTerminal.dispose();
            context.workspaceState.update("matlabTerminalId", undefined);
        }
    }

    function updateScope() {
        let matlabTerminal = findMatlabTerminal();
        if (matlabTerminal === undefined) {
            return;
        }

        // 获取当前 MATLAB 的工作目录，而不是 VS Code 的工作区目录
        let workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
        let currentDir = vscode.window.activeTextEditor?.document.fileName;
        
        // 如果有活动文件，使用文件所在目录作为 CSV 查找位置
        if (currentDir !== undefined) {
            workspacePath = path.dirname(currentDir);
        }

        if (workspacePath === undefined) {
            return;
        }

        let csvPath = path.join(
            workspacePath,
            "matlabInVSCodeVariableInfo.csv"
        );
        
        // 增加延迟，给 MATLAB 时间生成文件
        setTimeout(() => {
            getScopeWebViewHtml(csvPath, 500).then((htmlContent) => {
                if (matlabScope === undefined) {
                    return;
                }
                matlabScope.webview.html = htmlContent;
            });
        }, 1000);
    }

    function showVariable() {
        let matlabTerminal = findMatlabTerminal();
        if (matlabTerminal === undefined) {
            matlabTerminal = startMatlab();
            return;
        }
        if (matlabScope) {
            matlabScope.reveal();
        } else {
            matlabScope = vscode.window.createWebviewPanel(
                "matlabScope",
                "Matlab Variable Scope",
                vscode.ViewColumn.Beside,
                {
                    // Enable scripts in the webview
                    enableScripts: true,
                }
            );
            matlabScope.onDidDispose(() => {
                matlabScope = undefined;
            });

            matlabScope.webview.onDidReceiveMessage((message) => {
                if (message.command === "openvar") {
                    let command = `openvar("${message.text}")`;
                    if (matlabTerminal) {
                        matlabTerminal.sendText(command);
                    }
                }
            });
        }
        matlabTerminal.sendText("variable_info;");
        updateScope();
    }

    function editInMatlab() {
        let filePath = vscode.window.activeTextEditor?.document.fileName;
        if (filePath !== undefined) {
            let command = `edit('${filePath}')`;
            sendToMatlab(command);
        }
    }

    function showMatlabDoc() {
        let activeTextEditor = vscode.window.activeTextEditor;
        if (activeTextEditor) {
            const selection = activeTextEditor.selection;
            const text = activeTextEditor.document.getText(selection);
            let command = "doc " + text;
            sendToMatlab(command);
        }
    }

    let dispRunMatlabFile = vscode.commands.registerCommand(
        "matlab-in-vscode.runMatlabFile",
        () => {
            runMatlabFile();
        }
    );
    let dispRunMatlabCell = vscode.commands.registerCommand(
        "matlab-in-vscode.runMatlabCell",
        () => {
            runMatlabCell();
        }
    );
    let dispRunMatlabLine = vscode.commands.registerCommand(
        "matlab-in-vscode.runMatlabLine",
        () => {
            runMatlabLine();
        }
    );
    let dispInterruptMatlab = vscode.commands.registerCommand(
        "matlab-in-vscode.interupt",
        () => {
            interruptMatlab();
        }
    );
    let dispStopMatlab = vscode.commands.registerCommand(
        "matlab-in-vscode.stop",
        () => {
            stopMatlab();
        }
    );
    let dispCdFileDirectory = vscode.commands.registerCommand(
        "matlab-in-vscode.cd",
        () => {
            cdFileDirectory();
        }
    );
    let dispShowVariable = vscode.commands.registerCommand(
        "matlab-in-vscode.variable",
        () => {
            showVariable();
        }
    );
    let dispEditInMatlab = vscode.commands.registerCommand(
        "matlab-in-vscode.edit",
        () => {
            editInMatlab();
        }
    );
    let dispShowMatlabDoc = vscode.commands.registerCommand(
        "matlab-in-vscode.doc",
        () => {
            showMatlabDoc();
        }
    );

    context.subscriptions.push(dispInterruptMatlab);
    context.subscriptions.push(dispRunMatlabCell);
    context.subscriptions.push(dispRunMatlabLine);
    context.subscriptions.push(dispRunMatlabFile);
    context.subscriptions.push(dispStopMatlab);
    context.subscriptions.push(dispCdFileDirectory);
    context.subscriptions.push(dispShowVariable);
    context.subscriptions.push(dispEditInMatlab);
    context.subscriptions.push(dispShowMatlabDoc);

    let activeEditor = vscode.window.activeTextEditor;
    let timeout: NodeJS.Timer | undefined = undefined;
    const splitLine = vscode.window.createTextEditorDecorationType({
        // border on bottom
        borderStyle: "solid",
        // use theme color foreground
        borderColor: new vscode.ThemeColor("editorLineNumber.foreground"),
        borderWidth: "1px 0 0 0",
        isWholeLine: true,
    });

    function updateDecorations() {
        if (activeEditor) {
            let code = activeEditor.document.getText();
            let lines = code.split("\n");
            let decorations = [];
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].startsWith("%%")) {
                    let decoration = {
                        range: new vscode.Range(i, 0, i, lines[i].length),
                    };
                    decorations.push(decoration);
                }
            }
            activeEditor.setDecorations(splitLine, decorations);
        }
    }

    function triggerUpdateDecorations(throttle = false) {
        if (timeout) {
            clearTimeout(timeout);
            timeout = undefined;
        }
        if (throttle) {
            timeout = setTimeout(updateDecorations, 500);
        } else {
            updateDecorations();
        }
    }

    vscode.window.onDidChangeActiveTextEditor(
        (editor) => {
            activeEditor = editor;
            if (editor) {
                triggerUpdateDecorations();
            }
        },
        null,
        context.subscriptions
    );

    vscode.workspace.onDidChangeTextDocument(
        (event) => {
            if (activeEditor && event.document === activeEditor.document) {
                triggerUpdateDecorations(true);
            }
        },
        null,
        context.subscriptions
    );

    updateDecorations();
}

// This method is called when your extension is deactivated
export function deactivate() {}
