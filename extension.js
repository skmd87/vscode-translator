// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const axios = require('axios');
const https = require('https');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "translator" is now active!');
	const api = axios.create({
		httpsAgent: new https.Agent({
			rejectUnauthorized: false
		})
	});
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('translator.new', async function () {
		// The code you place here will be executed every time your command is executed

		const config = vscode.workspace.getConfiguration('translator');


		var editor = vscode.window.activeTextEditor;
		if (!editor) {
			return; // No open text editor
		}

		var selection = editor.selection;
		var input = editor.document.getText(selection);

		const translation = await vscode.window.showInputBox({
			placeHolder: 'Enter translation',
			validateInput: text => {
				if (text.length === 0) {
					return 'Translation cannot be empty';
				}
				return null;
			}
		});
		const [group, key] = input.split('.');
		const body = {
			group,
			key,
			"exception": null,
			"languages": [

				{
					"language_id": 2,
					"abbreviation": "en",
					"direction": "ltr",
					"value": translation
				},

			],
			"type": "text",
			"tags": [],
			"placeholders": [],
			"is_published": true,
		}

		//get the url from the settings

		//read data from settings
		// if token not set then try to take from the settings, if not available then prompt for username and password
		// if token is set then use it
		// if token is expired then delete the token and generate one and set it in the settings
		// if token is not expired then use it


		let loginURL = config.get('loginURL');
		let createURL = config.get('createURL');
		let username = config.get('username');
		let token = config.get('token');
		let password = config.get('password');

		if (!loginURL) {
			// show input for url
			loginURL = await vscode.window.showInputBox({
				placeHolder: 'Enter Login URL',
				validateInput: text => {
					if (text.length === 0) {
						return 'URL cannot be empty';
					}
					return null;
				}
			});
			config.update('loginURL', loginURL, true);

		}


		if (!token) {
			if (!username) {
				username = await vscode.window.showInputBox({
					placeHolder: 'Enter username',
					validateInput: text => {
						if (text.length === 0) {
							return 'Username cannot be empty';
						}
						return null;
					}
				});
			}
			if (!password) {
				password = await vscode.window.showInputBox({
					placeHolder: 'Enter password',
					validateInput: text => {
						if (text.length === 0) {
							return 'Password cannot be empty';
						}
						return null;
					}
				});
			}
			console.log('sending', {
				email: username,
				password
			})
			await api.post(loginURL,
				{
					email: username,
					password
				},
				{
					headers: {
						'Content-Type': 'application/json',
						'Accept': 'application/json',
						'Entity': 'www.ingotbrokers.com',
						'Language': 'en'
					}
				}
			).then((response) => {
				console.log(response);
				vscode.window.showInformationMessage("Login successful");
				console.log('token', response)
				token = response.data.token.access_token;
				config.update('token', response.data.token.access_token, true);
				config.update('username', username, true);
				config.update('password', password, true);
			}).catch((error) => {
				console.log(error);
				vscode.window.showInformationMessage("Error logging in");
			});

		}

		if (!createURL) {
			// show input for url
			createURL = await vscode.window.showInputBox({
				placeHolder: 'Enter Create URL',
				validateInput: text => {
					if (text.length === 0) {
						return 'URL cannot be empty';
					}
					return null;
				}
			});
			config.update('createURL', createURL, true);
			return;
		}



		await api.post(createURL, body, {
			headers: {
				'Authorization': `Bearer ${token}`,
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'Entity': 'www.ingotbrokers.com',
				'Language': 'en'
			},
		}).then((response) => {
			console.log(response);
			vscode.window.showInformationMessage("Translation added successfully");
		}).catch((error) => {
			console.log(error);
			vscode.window.showInformationMessage("Error adding translation");
		});






	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
