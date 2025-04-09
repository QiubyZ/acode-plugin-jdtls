import plugin from "../plugin.json";
let AppSettings = acode.require("settings");

class AcodePlugin {
	constructor() {
		this.name_language_type = "java";
		this.languageserver = "jdtls";
		this.standart_args = [];
		this.initializeOptions = {
			initializationOptions: {},
		};
	}

	async init($page, cacheFile, cacheFileUrl) {
		let acodeLanguageClient = acode.require("acode-language-client");
		if (acodeLanguageClient) {
			await this.setupLanguageClient(acodeLanguageClient);
		} else {
			window.addEventListener("plugin.install", ({ detail }) => {
				if (detail.name === "acode-language-client") {
					acodeLanguageClient = acode.require("acode-language-client");
					this.setupLanguageClient(acodeLanguageClient);
				}
			});
		}
	}

	get settings() {
		// UPDATE SETTING SAAT RESTART ACODE
		if (!window.acode) return this.defaultSettings;
		let value = AppSettings.value[plugin.id];
		if (!value) {
			//Menjadikan Method defaultSettings sebagai nilai Default
			value = AppSettings.value[plugin.id] = this.defaultSettings;
			AppSettings.update();
		}
		return value;
	}

	get settingsMenuLayout() {
		return {
			list: [
				{
					index: 0,
					key: "serverPath",
					promptType: "text",
					prompt: "Change the serverPath before running.",
					text: "JDTLS Executable File Path",
					value: this.settings.serverPath,
				},
				{
					index: 1,
					key: "arguments",
					promptType: "text",
					info: "For multiple arguments, please use comma ','<br>Example: --stdio, -v, -vv",
					prompt: "Argument Of Language Server",
					text: "JDTLS Argument",
					value: this.settings.arguments.join(", "),
				},
			],

			cb: (key, value) => {
				switch (key) {
					case "arguments":
						value = value ? value.split(",").map((item) => item.trim()) : [];
						break;
				}
				AppSettings.value[plugin.id][key] = value;
				AppSettings.update();
			},
		};
	}

	get defaultSettings() {
		return {
			serverPath: this.languageserver,
			arguments: this.standart_args,
			languageClientConfig: this.initializeOptions,
		};
	}

	async setupLanguageClient(acodeLanguageClient) {
		let socket = acodeLanguageClient.getSocketForCommand(
			this.settings.serverPath,
			this.settings.arguments,
		);

		let JavaClient = new acodeLanguageClient.LanguageClient({
			type: "socket",
			socket,
			initializationOptions: this.settings.languageClientConfig.initializationOptions,
		});
		
		// JavaClient.setOptions({
		//     fontSize: "14px",
		//     fontFamily: "Fira Code, monospace",
		//     tabSize: 4,
		//     useSoftTabs: true,
		//     newLineMode: "unix",
		//     wrap: true,
		//     indentedSoftWrap: true,
		//     readOnly: false,
		//     highlightActiveLine: true,
		//     showInvisibles: true,
		//     showPrintMargin: true,
		//     printMarginColumn: 80,
		//     enableBasicAutocompletion: true,
		//     enableLiveAutocompletion: true,
		//     enableSnippets: false,
		//     behavioursEnabled: true,
		//     enableFoldWidgets: true,
		//     scrollSpeed: 2,
		//     hScrollBarAlwaysVisible: false,
		//     vScrollBarAlwaysVisible: false,
		//     tooltipFollowsMouse: true,
		//     keyboardHandler: "ace/keyboard/vim",
		//     selectionStyle: "text",
		//     animatedScroll: true,
		//     useWorker: true,
		//     placeholder: "Type your code here...",
		// });

		acodeLanguageClient.registerService(this.name_language_type, JavaClient);

		let handler = () => {
			JavaClient.connection.onNotification("language/status", (params) => {
				window.toast(params.message, 1000);
			});
		};
		socket.addEventListener("open", () => {
			if (JavaClient.isInitialized) handler();
			else JavaClient.requestsQueue.push(() => handler());
			console.log("OPEN CONNECTION");
		});

		acode.registerFormatter(plugin.id, [this.name_language_type], async () => {
			const test = () => {
				const javaCode = editorManager.editor.session.getValue();
				return import("prettier/standalone")
					.then((prettier) => {
						return import("prettier-plugin-java").then((parserJava) => {
							console.log("Prettier and Java plugin loaded successfully.");
							window.toast("Prettier and Java plugin loaded successfully.", 1000);
							return prettier.format(javaCode, {
								parser: this.name_language_type,
								plugins: [parserJava.default],
								tabWidth: 4,
								useTabs: false,
								printWidth: 120,
							});
						});
					})
					.then((formatted) => {
						return formatted;
					})
					.catch((error) => {
						console.error("Error formatting Java code:", error.message || error);

						if (error.name === "SyntaxError") {
							console.warn(
								"The provided code contains syntax errors and cannot be formatted.",
							);
							window.toast(
								"The provided code contains syntax errors and cannot be formatted.",
								1000,
							);
						}
						return editorManager.editor.session.getValue();
					});
			};

			test()
				.then((formattedCode) => {
					editorManager.editor.session.setValue(formattedCode);
				})
				.catch((error) => {
					console.error("Error setting formatted code:", error.message || error);
					window.toast(`Error setting formatted code: ${error.message}`, 1000);
				});
		});
		this.resolveEditor();
	}
	resolveEditor() {
		const originalConsoleLog = console.log;
		console.log = (...args) => {
			originalConsoleLog.apply(console, args);
			if (args[0] === "Resolved:") {
				const resolvedResult = args[1]; // Hasil resolved
				console.log("Test Organize Imports:", resolvedResult);
				if (resolvedResult && resolvedResult.edit) {
					this.applyText(resolvedResult.edit);
				}
			}
		};
	}
	
	applyText(edit) {
		const session = editorManager.editor.getSession();
		for (const [uri, changes] of Object.entries(edit.changes)) {
			changes.forEach((change) => {
				const { range, newText } = change;
				const startPos = { row: range.start.line, column: range.start.character };
				const endPos = { row: range.end.line, column: range.end.character };
				session.replace(
					{
						start: startPos,
						end: endPos,
					},
					newText,
				);
			});
		}
	}

	async destroy() {
		if (AppSettings.value[plugin.id]) {
			delete AppSettings.value[plugin.id];
			AppSettings.update();
		}
		acode.unregisterFormatter(plugin.id);
	}
}

if (window.acode) {
	const acodePlugin = new AcodePlugin();
	acode.setPluginInit(
		plugin.id,
		async (baseUrl, $page, { cacheFileUrl, cacheFile }) => {
			if (!baseUrl.endsWith("/")) {
				baseUrl += "/";
			}
			acodePlugin.baseUrl = baseUrl;
			await acodePlugin.init($page, cacheFile, cacheFileUrl);
		},
		acodePlugin.settingsMenuLayout,
	);

	acode.setPluginUnmount(plugin.id, () => {
		acodePlugin.destroy();
	});
}
