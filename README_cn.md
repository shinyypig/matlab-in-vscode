# MATLAB 扩展 for VSCode

[English](README.md) | [中文](README_cn.md)

![license](https://img.shields.io/github/license/shinyypig/matlab-in-vscode)
![installs](https://img.shields.io/visual-studio-marketplace/i/shinyypig.matlab-in-vscode)
![version](https://img.shields.io/visual-studio-marketplace/v/shinyypig.matlab-in-vscode)
![last_commit](https://img.shields.io/github/last-commit/shinyypig/matlab-in-vscode)

这是一个用于 MATLAB 的 VSCode 扩展。它提供以下功能。

## 主要功能：

-   直接在 VSCode 中查看变量
-   通过按下 `ctrl+enter` 或 `cmd+enter` 在 MATLAB 中运行一个代码单元
-   在 MATLAB 中运行当前行并移动到下一行，通过按下 `shift+enter`
-   `.m` 文件的语法高亮

## 次要功能：

-   运行一个完整的 MATLAB .m 文件
-   通过点击停止按钮中断 MATLAB 进程
-   将 MATLAB 的工作目录更改为当前文件所在目录
-   打开 MATLAB 的工作区以检查变量
-   在 MATLAB 编辑器中打开当前文件以进行调试或其他用途

所有功能都可以通过点击菜单栏中的按钮来访问。如果 MATLAB 终端未启动，扩展将自动启动它。然后，您需要重新点击按钮来运行命令。

<div align=center>
    <img width=50% style=margin:2% src="assets/2023-03-25-11-55-00.png">
</div>

点击[这里](https://marketplace.visualstudio.com/items?itemName=shinyypig.matlab-in-vscode)安装扩展。

## 使用方法

如果你是 **Windows** 用户，可能需要安装 Python 用的 MATLAB 引擎 API，点击此[链接](https://www.mathworks.com/help/matlab/matlab_external/install-the-matlab-engine-for-python.html)了解更多详情。然后你需要在扩展的设置中勾选 `matlabPybackend` 选项。

如果你是 **Linux** 或 **Mac** 用户，默认设置就可以。除非 MATLAB 可执行文件不在路径中，否则你可以在扩展的设置中勾选 `matlabCMD` 选项。

## 查看工作区

你可以点击菜单栏中的按钮打开一个网页视图来检查变量。虽然它不如 MATLAB 工作区强大，但足以进行简单检查。

<div align=center>
    <img width=50% style=margin:2% src="assets/2023-06-25-20-16-14.png">
</div>

此外，现在你可以点击变量名来查看变量的详细信息。

## 最新更新 (v0.5.5)

**🔧 错误修复：**
- 修复了Windows系统上变量查看器不显示内容的问题
- 解决了`variable_info`函数路径问题
- 改进了CSV文件读取可靠性

**💡 改进：**
- 自动复制所需文件到工作空间
- 增强错误处理和重试逻辑
- 更好的文件路径检测

**注意：** 扩展现在会自动处理所需文件。如有需要请重启VS Code。

<div style="display: flex;justify-content: center; flex-wrap: wrap;">
    <img width="50%" src="assets/iShot_2024-05-26_09.48.06.gif" style="padding:10px;">
</div>

请注意，当前目录下将生成一个名为 `matlabInVSCodeVariableInfo.csv` 的文件。它用于存储变量信息。通常，这个文件会立即自动删除。然而，如果出现某些错误，它可能不会被删除。您应该手动删除它。

**重要提示！！！** 你需要在 VSCode 中打开一个文件夹作为工作区，以确保扩展能够找到 `matlabInVSCodeVariableInfo.csv` 文件。

## 单元模式

你可以通过 `%%` 分割你的代码，点击运行单元按钮，或者只需按下 `ctrl+enter`（Mac：`cmd+enter`）来运行活动单元。

<div align=center>
    <img width=50% style=margin:2% src="assets/iShot_2023-03-25_11.52.16.gif">
</div>

## 查看文档

你可以右键单击函数名并选择 `Show Matlab Document` 来查看该函数的文档。

<div align=center>
    <img width=50% style=margin:2% src="assets/iShot_2024-05-26_09.47.00.gif">
</div>

## 设置

-   `matlabCMD`：启动 Matlab 终端的命令，默认是 `matlab -nodesktop -nosplash`。如果使用 Python 后端，将被忽略。此外，对于 Windows 用户，建议使用 `matlabPybackend`。
-   `matlabMoveToNext`：如果设置为 true，运行当前行后光标将移动到下一行。默认值为 true。
-   `matlabPybackend`：建议在 Windows 上使用 Python 后端。请查看此[链接](https://www.mathworks.com/help/matlab/matlab_external/install-the-matlab-engine-for-python.html)以安装 MATLAB Engine for Python 的 API。
-   `matlabPythonPath`：如果要指定 Python 路径，可以在此处进行设置。
-   `matlabStartup`：启动 MATLAB 后要运行的代码，默认是空的，你可以添加一些代码来设置默认图形样式，例如：

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

## 变更日志

详见 [CHANGELOG.md](CHANGELOG.md)。
