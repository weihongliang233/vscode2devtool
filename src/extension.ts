/* eslint-disable @typescript-eslint/naming-convention */

import { LOADIPHLPAPI } from 'dns';
import * as vscode from 'vscode';
import CDP = require('chrome-remote-interface');

export async function activate(context: vscode.ExtensionContext) {

	let client = await CDP();
	let {Runtime, Page, Target} = client;
	//Navigating to an arbitary website to get frameId, which can be used to construct a devtool page url
	let arbitary_website:string = vscode.workspace.getConfiguration("vscode2devtool").get("arbitary_website")!;
	let {frameId, loaderId} = await Page.navigate({url:arbitary_website});
	let port:number = vscode.workspace.getConfiguration("vscode2devtool").get("port")!;
	let devtool_url = "http://localhost:"+port+"/devtools/inspector.html?ws=localhost:"+port+"/devtools/page/"+frameId;
	Target.createTarget({url:devtool_url});
	
	var evaluate_order_number = 0;
	let commit = vscode.commands.registerCommand('vscode2devtool.commit',async () => {
		let editor = vscode.window.activeTextEditor!;
		let document = editor?.document;
		let selection = editor?.selection;
		let text = document.getText(selection);
		evaluate_order_number = evaluate_order_number+1;

		//"Input"
		await Runtime.evaluate({expression: "vscode2devtool_text ="+JSON.stringify(text)});
		await Runtime.evaluate({expression: `vscode2devtool_In = 'In ${evaluate_order_number}:'`});
		await Runtime.evaluate({expression: "vscode2devtool_breakLine = '\\n'"});
		await Runtime.evaluate({expression: "console.log(vscode2devtool_In,vscode2devtool_breakLine,vscode2devtool_text)"});

		//"Output"		
		let expression = ["vscode2devtool_evaluateResult = eval(\"", text.split('\"').join( "\\\"").split("\n").join("").split("\r").join(""),"\")"].join("");
		console.log(expression);
		let evaluate_result = await Runtime.evaluate({expression: expression});
		await Runtime.evaluate({expression: `vscode2devtool_Out = 'Out ${evaluate_order_number}:'`});

		//Error Handling
		if(! evaluate_result.exceptionDetails){
			await Runtime.evaluate({expression: "console.log(vscode2devtool_Out)"});
			await Runtime.evaluate({expression: "console.log(vscode2devtool_evaluateResult)"});
		}else{	
			await Runtime.evaluate({expression: `console.log('Exception ${evaluate_order_number}:')`});
			let details = evaluate_result.exceptionDetails!;
			let description = details.exception?.description!;
			await Runtime.evaluate({expression: `console.log(${JSON.stringify(description)})`});
		}
	});
	context.subscriptions.push(commit);
}

export function deactivate() {}
