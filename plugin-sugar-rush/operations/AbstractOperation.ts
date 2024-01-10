import type SugarRushPlugin from "plugin-sugar-rush/main";

export default abstract class AbstractOperation {
	plugin: SugarRushPlugin;
	id: string;
	icon: string;
	description: string;

	constructor(
		plugin: SugarRushPlugin,
		id: string,
		icon: string,
		description: string
	) {
		this.plugin = plugin;
		this.id = id;
		this.icon = icon;
		this.description = description;
	}

	abstract run(): void;
}
