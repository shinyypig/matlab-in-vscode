# Matlab in VSCode

This is a VSCode extension for Matlab. It provides the following features:

- run a complete matlab .m file
- run a cell in matlab code by press `ctrl+enter` or `cmd+enter`
- interrupt matlab process by clicking the stop button
- change the work directory of matlab to the directory of the current file
- open the workspace of matlab to inspect the variables
- open the current file in matlab editor for debugging or other purpose

All functions can be accessed by clicking the button in the menu bar. If matlab terminal is not started, the extension will start it automatically. Then, you need to reclick the button to run the command.

<div align=center>
    <img width=50% style=margin:2% src="assets/2023-03-25-11-55-00.png">
</div>

Click [here](https://marketplace.visualstudio.com/items?itemName=shinyypig.matlab-in-vscode) to install the extension.

## Settings

- `matlabPybackend`: It is recommended to use the python backend in Windows. Check this [link](https://www.mathworks.com/help/matlab/matlab_external/install-the-matlab-engine-for-python.html) for installing MATLAB Engine API for Python.
- `matlabCMD`: The command to start the Matlab terminal, default is `matlab -nodesktop -nosplash`. If the python backend is used, it will be ignored. In Windows, if you do not want to use the python backend, you can set it to `matlab -nojvm` to run code in the terminal. However, in this case, any function related to gui will not work.
- `matlabStartup`: the code to run after starting the matlab, default is empty, you can add some code to set the default figure style, for example:

    ```json
    "matlab-in-vscode.matlabStartup": [
        "addpath(genpath('./'));",
        "set(groot, 'defaultLineLineWidth', 2);",
        "set(groot, 'DefaultLineMarkerSize', 8);",
        "set(groot, 'defaultAxesFontSize', 18);",
        "set(groot, 'defaultAxesXGrid', 'on');",
        "set(groot, 'defaultAxesYGrid', 'on');",
        "set(groot, 'defaultAxesBox', 'on');",
        "set(groot, 'defaultLegendBox', 'off');",
        "format compact;"
    ],
    ```

## Cell Mode

You can split your code by `%%`, click the run cell button or simply press `ctrl+enter` (mac: `cmd+enter`) to run the active cell.

<div align=center>
    <img width=50% style=margin:2% src="assets/iShot_2023-03-25_11.52.16.gif">
</div>

## Release Notes

### 0.2.1

If matlab terminal is not started, the extension will start it automatically.

### 0.2.0

Add matlab python engine support.

### 0.1.1

Rename the properties, and add the property that used to start the matlab terminal.

### 0.1.0

Add split line for each cell.
Add a button to open the help document of matlab.

### 0.0.3

Fix keybinding issue.

### 0.0.2

Add an icon for the extension.

### 0.0.1

First release!!!
