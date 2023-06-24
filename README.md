# Matlab in VSCode

![license](https://img.shields.io/github/license/shinyypig/matlab-in-vscode)
![installs](https://img.shields.io/visual-studio-marketplace/i/shinyypig.matlab-in-vscode)
![version](https://img.shields.io/visual-studio-marketplace/v/shinyypig.matlab-in-vscode)
![last_commit](https://img.shields.io/github/last-commit/shinyypig/matlab-in-vscode)

This is a VSCode extension for Matlab. It provides the following features:

-   run a complete matlab .m file
-   run a cell in matlab by press `ctrl+enter` or `cmd+enter`
-   run current line and move to next in matlab by press `shift+enter`
-   interrupt matlab process by clicking the stop button
-   change the work directory of matlab to the directory of the current file
-   open the workspace of matlab to inspect the variables
-   open the current file in matlab editor for debugging or other purpose

All functions can be accessed by clicking the button in the menu bar. If matlab terminal is not started, the extension will start it automatically. Then, you need to reclick the button to run the command.

<div align=center>
    <img width=50% style=margin:2% src="assets/2023-03-25-11-55-00.png">
</div>

Click [here](https://marketplace.visualstudio.com/items?itemName=shinyypig.matlab-in-vscode) to install the extension.

## Settings

-   `matlabCMD`: The command to start the Matlab terminal, default is `matlab -nodesktop -nosplash`. If the python backend is used, it will be ignored. In Windows, if you do not want to use the python backend, you can set it to `matlab -nojvm` to run code in the terminal. However, in this case, any function related to gui will not work.
-   `matlabMoveToNext`: If set to true, the cursor will move to the next line after running the current line. Default is true.
-   `matlabPybackend`: It is recommended to use the python backend in Windows. Check this [link](https://www.mathworks.com/help/matlab/matlab_external/install-the-matlab-engine-for-python.html) for installing MATLAB Engine API for Python.
-   `matlabStartup`: the code to run after starting the matlab, default is empty, you can add some code to set the default figure style, for example:

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

## Change Log

See [CHANGELOG.md](CHANGELOG.md).