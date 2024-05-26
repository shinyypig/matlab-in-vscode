# Change Log

All notable changes to the "matlab-in-vscode" extension will be documented in this file.

<!-- Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file. -->

<!-- ## [Unreleased]

- Nothing -->

## 0.5.1

Add language support for .m and .mat files.

## 0.5.0

Feat #41, improve `doc` command.

Feat #42, Chinese localization.

Feat #43, view variable details by clicking the variable name.

Feat #45, add matlab syntax highlight support.

## 0.4.22

Fix #29, use workspace folder as the default path.

## 0.4.21

Fix #28.

Use absolute path when running a matlab file.

## 0.4.20

Update README.md.

## 0.4.19

Fix # 25 again, my bad.

## 0.4.18

Fix #24 again, have no idea why the change was reverted.

## 0.4.17

Fix the quote issue in windows. #25

## 0.4.16

Add an option for user to choose the python interpreter. #24

## 0.4.15

Fix the bug that the command is executed before the file is saved. #20

## 0.4.14

Publish.

## 0.4.13

Fix the bug that the pybackend didn't print the error message.

## 0.4.12

Add time delay for starting matlab terminal.

## 0.4.11

Add \n after variable_info.

## 0.4.10

Able to show content of number or string variables.

## 0.4.9

Save the current file before running it.

## 0.4.8

Support for chinese output and better multi-line functionality handle in pybackend.

## 0.4.7

Improve the code input method for pybackend.

## 0.4.6

Fix the bug that the pybackend will treat any % as a comment.

## 0.4.5

Revert to previous method to send startup command in pybackend.

## 0.4.4

Fix default matlab-in-vscode.matlabStartup command.

## 0.4.3

Fix python statupcommand.

## 0.4.2

Bug fix.

## 0.4.1

Revert to previous command send mode.

## 0.4.0

Now you can view variables directly in VSCode. Click the button in the menu bar to open a webview to inspect the variables.

## 0.3.5

If multiple lines are selected, press `Shift+Enter` will run the selected lines (#9).

## 0.3.4

Add shortcut for running current line and move to next (#9).

## 0.3.3

Add double quotes for the path of the `matlab_engine.py` file, when using pybackend (#7, #8).

## 0.3.2

Remove `%%` when running a cell (reverted in 0.3.4).

## 0.3.1

Add startup command support for matlab python engine. Thanks for @Veng97's contribution.

## 0.3.0

Add support for matlab python engine in windows. Thanks for @Veng97's contribution (#1).

## 0.2.1

If matlab terminal is not started, the extension will start it automatically.

## 0.2.0

Add matlab python engine support.

## 0.1.1

Rename the properties, and add the property that used to start the matlab terminal.

## 0.1.0

Add split line for each cell.
Add a button to open the help document of matlab.

## 0.0.3

Fix keybinding issue.

## 0.0.2

Add an icon for the extension.

## 0.0.1

First release!!!
