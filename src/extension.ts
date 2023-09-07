// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import * as csv from "csv-parser";

function readFileStream(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
        let htmlContent = `
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
                for (let key in row) {
                    htmlContent += `<td>${row[key]}</td>`;
                }
                htmlContent += "</tr>";
            })
            .on("end", () => {
                htmlContent += "</table>";
                fs.unlink(filePath, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(htmlContent);
                    }
                });
            })
            .on("error", (err: Error) => {
                reject(err);
            });
    });
}

async function getScopeWebViewHtml(
    filePath: string,
    delay: number
): Promise<string> {
    if (fs.existsSync(filePath)) {
        return await readFileStream(filePath);
    } else {
        await new Promise((resolve) => setTimeout(resolve, delay));
        return await getScopeWebViewHtml(filePath, delay);
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
    let matlabStartup = config.get("matlabStartup") as string;
    let matlabStartupDelay = config.get("matlabStartupDelay") as number;
    let matlabCMD = config.get("matlabCMD") as string;
    let matlabMoveToNext = config.get("matlabMoveToNext") as boolean;
    let matlabScope: vscode.WebviewPanel | undefined;

    function findMatlabTerminal() {
        let matlabTerminalId = context.workspaceState.get("matlabTerminalId");
        if (matlabTerminalId !== undefined) {
            return vscode.window.terminals.find(
                (x) => x.processId === matlabTerminalId
            );
        } else {
            return undefined;
        }
    }

    function sendToMatlab(command: string) {
        // save the file
        let activeTextEditor = vscode.window.activeTextEditor;
        if (activeTextEditor) {
            activeTextEditor.document.save();
        }
        let matlabTerminal = findMatlabTerminal();
        if (matlabTerminal !== undefined) {
            command += "\nvariable_info;\n";
            matlabTerminal.sendText(command);
            updateScope();
        } else {
            matlabTerminal = startMatlab();
        }
    }

    function startMatlab() {
        let matlabTerminal = findMatlabTerminal();
        if (matlabTerminal === undefined) {
            matlabTerminal = vscode.window.createTerminal("Matlab");
            context.workspaceState.update(
                "matlabTerminalId",
                matlabTerminal.processId
            );

            let startupCommand = "";
            for (let i = 0; i < matlabStartup.length; i++) {
                startupCommand += matlabStartup[i];
            }
            startupCommand +=
                "addpath('" +
                path.join(context.asAbsolutePath(""), "/matlab_code/") +
                "');";

            let bringupCommand = "";
            if (matlabPybackend) {
                let scriptPath = path.join(
                    context.asAbsolutePath(""),
                    "/pybackend/matlab_engine.py"
                );
                bringupCommand = `python "${scriptPath}" --cmd="""${startupCommand}"""`;
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
            let relativePath = vscode.workspace.asRelativePath(filePath);
            let matlabCommand = `run("${relativePath}")`;
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

        // matlabTerminal.sendText("variable_info;");
        // read tmp.csv and display it in the webview
        let workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
        if (workspacePath === undefined) {
            return;
        }

        let csvPath = path.join(
            workspacePath,
            "matlabInVSCodeVariableInfo.csv"
        );
        getScopeWebViewHtml(csvPath, 500).then((htmlContent) => {
            if (matlabScope === undefined) {
                return;
            }
            matlabScope.webview.html = htmlContent;
        });
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
        let command = "doc";
        sendToMatlab(command);
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
