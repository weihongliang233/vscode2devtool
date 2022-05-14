# VScode2Devtool-REPL Chinese Documentation

## Features

With this plugin, you can write code in VScode and run the code in the browser's developer tools.

When we write js code for browser-side running, we expect our development tools to have the following functions:

1. Beautiful editing interface + editing function

2. Able to access objects and APIs provided by browsers such as windows document

We have two ways to edit and run the code:

A. Edit the code in VScode and pass it into Node.js to run through plugins such as CodeRunner.

B. Open Devtool, write and run code in its terminal.

A method lacks advantage 2; B method lacks advantage 1, this tool VScode2Devtool-REPL has both advantages 1 and 2.

![VScode2Devtool](https://raw.githubusercontent.com/weihongliang233/My-Markdown-Figures/master/VScode2Devtool.gif)

## Instructions

Here is an abbreviated version of how to use it. If you encounter problems during actual use, you can read the principle section below.

Execute `chrome --remote-debugging-port=9222` command in your terminal, this will start a browser instance.

Next, write the code in your VScode editing interface, select the part you want to execute, and press `Ctrl Shift P` at the same time to pop up the command input box, enter the Evaluate command in it. The previously opened browser instance will now navigate to the Devtool web version, where you can see your output in its terminal.

In particular, note that each Devtool is attached to a web page, so one of the steps in the plugin's operation is to open a web page. The url of this web page can be set to the page you want to review, or you can optionally specify a web page that can be accessed normally (the default is [Baidu] (https://baidu.com)). For details, see the settings of this plugin.

## Principle

We often use Devtool to review web pages, but Devtool itself is also a web page. We can communicate with it through a specific Websocket to issue a series of commands to it, or get browser and webpage information from it, this communication follows the [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools -protocol/)

protocol.

In the process of using this plugin, when you execute the Evaluate command, the following process occurs:

1. The plug-in connects to the browser instance you have opened through port 9222, and controls it to open a web page. At this time, the plug-in will obtain the url address of the Devtool corresponding to the web page, and create a new tab and navigate to the Devtool page.

2. The plugin obtains the currently selected text `text` through `vscode.document.selection`.

3. Process `text`, remove line breaks, etc., and wrap `text` in JavaScript's `eval` to form an instruction `command` in the form of a string.

4. Pass the `Runtime.evaluate` API provided by [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/) to the browser for execution.

The pseudo code is as follows:

````js
text = "var a = 1; var b = 2; a+b" ;
command_to_be_execute = "eval(var a = 1; var b = 2; a+b)" ;
Runtime.evaluate({expression: command_to_be_execute}) ;
````

At the same time, users are welcome to read the source code of this plugin (in fact, this plugin is very short, the core code is only `extension.ts`, about dozens of lines)

## Known bugs

1. Do not use the `const` keyword, the variable declared by `const` will report the error `undefined` when used, the reason is unknown

2. Since all line breaks will be removed during text processing, in order to avoid errors in the concatenated strings, please add `;` behind each statement, such as:

   ````js
   1+1;
   
   var a = 1;
   var b = 2;
   a+b;
   
   function foo(){
       return a*b
   };
   foo();
   ````

3. To view an object, you need to assign it to a variable first. For example, to view `{a:1,b:2}`, you need `let obj = {a:1, b:2}; obj`