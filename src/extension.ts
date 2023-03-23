// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from "path";

function findMatlabTerminal(context: vscode.ExtensionContext) {
    let matlabTerminalId = context.workspaceState.get('matlabTerminalId');
    if (matlabTerminalId !== undefined) {
        return vscode.window.terminals.find(x => x.processId === matlabTerminalId);
    }
    else {
        return undefined;
    }
}

function sendToMatlab(context: vscode.ExtensionContext, command: string) {
    let matlabTerminal = findMatlabTerminal(context);
    if (matlabTerminal !== undefined) {
        matlabTerminal.sendText(command);
    }
    else {
        matlabTerminal = startMatlab(context);
        matlabTerminal.sendText(command);
    }
}

function startMatlab(context: vscode.ExtensionContext) {
    let matlabTerminal = findMatlabTerminal(context);
    if (matlabTerminal === undefined) {
        matlabTerminal = vscode.window.createTerminal('Matlab');
        let config = vscode.workspace.getConfiguration('matlab-in-vscode');
        let matlabPath = config.get('matlabPath') as string;
        context.workspaceState.update('matlabTerminalId', matlabTerminal.processId);
        let matlabCommand = matlabPath + ' -nodesktop -nosplash';
        matlabTerminal.sendText(matlabCommand, true);
        let matlabArgs = config.get('matlabArgs') as string;
        for (let i = 0; i < matlabArgs.length; i++) {
            matlabTerminal.sendText(matlabArgs[i], true);
        }
        matlabTerminal.sendText('clc;');
    }
    matlabTerminal.show(true);
    return matlabTerminal;
}

function runMatlabCell(context: vscode.ExtensionContext) {
    let activeTextEditor = vscode.window.activeTextEditor;
    if (activeTextEditor) {
        let code = activeTextEditor.document.getText();
        let activeLine = activeTextEditor.document.lineAt(activeTextEditor.selection.active).lineNumber;
        let lines = code.split("\n");
        let codeToRun = '';

        // find the cell that contains the current line
        let cellStart = activeLine;
        while (cellStart > 0) {
            if (lines[cellStart].startsWith('%%')) {
                break;
            }
            cellStart--;
        }
        let cellEnd = activeLine;
        while (cellEnd < lines.length) {
            if (lines[cellEnd].startsWith('%%')) {
                break;
            }
            cellEnd++;
        }
        codeToRun = lines.slice(cellStart, cellEnd).join('\n');
        sendToMatlab(context, codeToRun);
    }
}

function runMatlabFile(context: vscode.ExtensionContext) {
    let filePath = vscode.window.activeTextEditor?.document.fileName;
    if (filePath !== undefined) {
        let matlabCommand = `run('${filePath}')`;
        sendToMatlab(context, matlabCommand);
    }
}

function cdFileDirectory(context: vscode.ExtensionContext) {
    let filePath = vscode.window.activeTextEditor?.document.fileName;
    if (filePath !== undefined) {
        let matlabCommand = `cd('${path.dirname(filePath)}')`;
        sendToMatlab(context, matlabCommand);
    }
}

function interupt(context: vscode.ExtensionContext) {
    let matlabTerminal = findMatlabTerminal(context);
    if (matlabTerminal !== undefined) {
        // send ctrl+c
        matlabTerminal.sendText(String.fromCharCode(3));
    }
}

function stopMatlab(context: vscode.ExtensionContext) {
    let matlabTerminal = findMatlabTerminal(context);
    if (matlabTerminal !== undefined) {
        matlabTerminal.dispose();
        context.workspaceState.update('matlabTerminalId', undefined);
    }
}

function showVariable(context: vscode.ExtensionContext) {
    let command = 'workspace';
    sendToMatlab(context, command);
}

function editInMatlab(context: vscode.ExtensionContext) {
    let filePath = vscode.window.activeTextEditor?.document.fileName;
    if (filePath !== undefined) {
        let command = `edit('${filePath}')`;
        sendToMatlab(context, command);
    }
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json

    let dispRunMatlabFile = vscode.commands.registerCommand("matlab-in-vscode.runMatlabFile", () => {
        runMatlabFile(context);
    });
    let dispRunMatlabCell = vscode.commands.registerCommand("matlab-in-vscode.runMatlabCell", () => {
        runMatlabCell(context);
    });
    let dispInteruptMatlab = vscode.commands.registerCommand("matlab-in-vscode.interupt", () => {
        interupt(context);
    });
    let dispStopMatlab = vscode.commands.registerCommand("matlab-in-vscode.stop", () => {
        stopMatlab(context);
    });
    let dispCdFileDirectory = vscode.commands.registerCommand("matlab-in-vscode.cd", () => {
        cdFileDirectory(context);
    });
    let dispShowVariable = vscode.commands.registerCommand("matlab-in-vscode.variable", () => {
        showVariable(context);
    });
    let dispEditInMatlab = vscode.commands.registerCommand("matlab-in-vscode.edit", () => {
        editInMatlab(context);
    });

    context.subscriptions.push(dispInteruptMatlab);
    context.subscriptions.push(dispRunMatlabCell);
    context.subscriptions.push(dispRunMatlabFile);
    context.subscriptions.push(dispStopMatlab);
    context.subscriptions.push(dispCdFileDirectory);
    context.subscriptions.push(dispShowVariable);
    context.subscriptions.push(dispEditInMatlab);

    let config = vscode.workspace.getConfiguration('matlab-in-vscode');
    let matlabArgs = config.get('matlabArgs') as string;
}

// This method is called when your extension is deactivated
export function deactivate() {

}
