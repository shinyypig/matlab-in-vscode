# 欢迎使用您的 VS Code 扩展

## 文件夹结构

* 此文件夹包含了扩展所需的所有文件。
* `package.json` - 这是清单文件，您在其中声明扩展和命令。
  * 示例插件注册了一个命令并定义了其标题和命令名称。有了这些信息，VS Code 可以在命令面板中显示该命令。它还不需要加载插件。
* `src/extension.ts` - 这是主要文件，您将在其中提供命令的实现。
  * 该文件导出一个函数 `activate`，该函数在第一次激活扩展时被调用（在这种情况下通过执行命令）。在 `activate` 函数内部，我们调用 `registerCommand`。
  * 我们将包含命令实现的函数作为第二个参数传递给 `registerCommand`。

## 设置

* 安装推荐的扩展 (amodio.tsl-problem-matcher 和 dbaeumer.vscode-eslint)

## 快速上手

* 按 `F5` 打开一个加载了您的扩展的新窗口。
* 通过按下 (`Ctrl+Shift+P` 或 Mac 上的 `Cmd+Shift+P`) 从命令面板运行您的命令，然后输入 `Hello World`。
* 在 `src/extension.ts` 的代码中设置断点以调试您的扩展。
* 在调试控制台中查找来自扩展的输出。

## 进行更改

* 在 `src/extension.ts` 中更改代码后，您可以从调试工具栏重新启动扩展。
* 您也可以重新加载 (`Ctrl+R` 或 Mac 上的 `Cmd+R`) 带有扩展的 VS Code 窗口以加载您的更改。

## 探索 API

* 当您打开文件 `node_modules/@types/vscode/index.d.ts` 时，可以查看我们的完整 API 集。

## 运行测试

* 打开调试视图 (`Ctrl+Shift+D` 或 Mac 上的 `Cmd+Shift+D`)，从启动配置下拉菜单中选择 `Extension Tests`。
* 按 `F5` 在加载了您的扩展的新窗口中运行测试。
* 在调试控制台中查看测试结果的输出。
* 对 `src/test/suite/extension.test.ts` 进行更改或在 `test/suite` 文件夹内创建新的测试文件。
  * 提供的测试运行器只会考虑匹配名称模式 `**.test.ts` 的文件。
  * 您可以在 `test` 文件夹内创建文件夹，以任何您想要的方式组织您的测试。

## 进一步学习

* 通过[打包您的扩展](https://code.visualstudio.com/api/working-with-extensions/bundling-extension)来减少扩展大小并改善启动时间。
* 在 VS Code 扩展市场上[发布您的扩展](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)。
* 通过设置[持续集成](https://code.visualstudio.com/api/working-with-extensions/continuous-integration)来自动化构建。
