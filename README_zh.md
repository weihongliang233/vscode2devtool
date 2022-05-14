# VScode2Devtool-REPL中文文档

## 功能

使用这个插件，你可以在VScode写代码，在浏览器的开发者工具中运行代码。

当我们编写用于浏览器端运行的js代码时，我们期望自己的开发工具具有如下功能：

1.漂亮的编辑界面+编辑功能

2.能够访问windows document等浏览器端提供的对象和API

我们有两种方式编辑和运行代码：

A.在VScode中编辑代码，通过CodeRunner等插件传入Node.js中运行。

B.打开Devtool，在其终端编写和运行代码。

A方式缺乏优点2；B方式缺乏优点1，本工具VScode2Devtool-REPL兼具优点1和2。

![VScode2Devtool](https://raw.githubusercontent.com/weihongliang233/My-Markdown-Figures/master/VScode2Devtool.gif)

## 使用方法

这里是简略版的使用方式，在实际使用过程中遇到问题的话，可以阅读下面的原理部分。

在你的终端执行`chrome --remote-debugging-port=9222`指令，这会启动一个浏览器实例。

接下来在你的VScode编辑界面编写代码，并且选中你要执行的部分，同时按下`Ctrl Shift P`会弹出命令输入框，在其中输入Evaluate指令。此时先前打开的浏览器实例会导航到Devtool网页版，在其终端即可看到你的输出。

特别要注意到，每个Devtool都依附于一个网页，所以插件运行的其中一个步骤就是要打开一个网页。这个网页的url可以设置为你要审查的页面，也可以随意指定一个能正常访问的网页（默认为[百度](https://baidu.com)）。具体可以查看本插件的设置。

## 原理

我们常常使用Devtool来审查网页，但其实Devtool本身也是一个网页。我们可以通过特定的Websocket与之通信，从而对它发出一系列指令，或者从它获取浏览器和网页的信息，这种通信遵循[Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)

协议。

在使用本插件的过程中，当你执行Evaluate指令时，发生了如下过程：

1.插件通过9222端口连接到你已经打开的浏览实例，控制它打开一个网页，此时插件将获得这个网页对应的Devtool的url地址，同时新建一个tab并导航到Devtool页面。

2.插件通过`vscode.document.selection`获取当前你选中的文本`text`。

3.对`text`进行处理，去除其中的换行符等等，并且将`text`包装在JavaScript的`eval`中，形成一条字符串形式的指令`command`。

4.通过[Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)提供的`Runtime.evaluate`API传入浏览器执行。

伪代码如下：

```js
text = "var a = 1; var b = 2; a+b" ; 
command_to_be_execute = "eval(var a = 1; var b = 2; a+b)" ; 
Runtime.evaluate({expression: command_to_be_execute}) ; 
```

同时欢迎用户阅读本插件的源码（其实这个插件很短小，核心代码只有`extension.ts`，大概几十行）

## 已知Bug

1. 不要使用`const`关键字, 被`const`声明的变量在使用时会报错`undefined`，原因未知

2. 由于在处理文本过程中会将所有换行符去掉，为了避免拼接起来的字符串出错，请在每个语句的背后都加上`;`，如：

   ```js
   1+1;
   
   var a = 1;
   var b = 2;
   a+b;
   
   function foo(){
       return a*b
   };
   foo();
   ```

3. 查看对象需要先将它赋值给一个变量，如查看`{a:1,b:2}`，要`let obj = {a:1, b:2}; obj`

