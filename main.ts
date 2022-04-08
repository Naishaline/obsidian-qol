import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		const debug = false;

		//Literally all the header plugin functionality.
		//TODO add settings support.
		this.registerEvent(this.app.vault.on('rename', (file, oldPath) => {
			const view = this.app.workspace.getActiveViewOfType(MarkdownView);
			if(view == null)
				return
			
			//If we're in a new file, auto do the heading
			if(view.editor.getValue() == ""){
				view.editor.setLine(0, '# ' + file.basename + '\n\n');
				view.editor.setCursor(2);
				return;	
			}

			const oldName = oldPath.slice(0, -3).split("/").last();
			var firstLine = view.editor.getLine(0);

			if(firstLine == null)
				return
			//If the first line isn't a header, don't do anything
			if(!firstLine.startsWith('# '))
				return;
				
			//Get just the text of the title (remove "# ")
			firstLine = firstLine.slice(2, firstLine.length)

			if(firstLine != oldName)
				return;

			view.editor.setLine(0, '# ' + file.basename);
		}));

		//Keeping this for reference lol
		if(debug) {
			// This creates an icon in the left ribbon.
			const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
				// Called when the user clicks the icon.
				new Notice('This is a notice!');
			});
			// Perform additional things with the ribbon
			ribbonIconEl.addClass('my-plugin-ribbon-class');

			// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
			const statusBarItemEl = this.addStatusBarItem();
			statusBarItemEl.setText('Status Bar Text');

			// This adds a simple command that can be triggered anywhere
			this.addCommand({
				id: 'open-sample-modal-simple',
				name: 'Open sample modal (simple)',
				callback: () => {
					new SampleModal(this.app).open();
				}
			});
			// This adds an editor command that can perform some operation on the current editor instance
			this.addCommand({
				id: 'sample-editor-command',
				name: 'Sample editor command',
				editorCallback: (editor: Editor, view: MarkdownView) => {
					console.log(editor.getSelection());
					editor.replaceSelection('Sample Editor Command');
				}
			});
			// This adds a complex command that can check whether the current state of the app allows execution of the command
			this.addCommand({
				id: 'open-sample-modal-complex',
				name: 'Open sample modal (complex)',
				checkCallback: (checking: boolean) => {
					// Conditions to check
					const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
					if (markdownView) {
						// If checking is true, we're simply "checking" if the command can be run.
						// If checking is false, then we want to actually perform the operation.
						if (!checking) {
							new SampleModal(this.app).open();
						}

						// This command will only show up in Command Palette when the check function returns true
						return true;
					}
				}
			});
		}

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			//console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		//this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for my awesome plugin.'});

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
