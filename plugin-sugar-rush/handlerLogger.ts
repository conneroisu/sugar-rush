import type SugarRushPlugin from "./main";
import { db } from "./db/schema";

export default class SugarRushLoggerHandler {
	private plugin: SugarRushPlugin;
	
	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
	}
	
	get() {
		console.log(this.plugin.manifest.name, "v" + this.plugin.manifest.version, "loaded");
	}

	insertLog(message: string){
		db.insert(loggings).values({message: message}).execute();
	}

}
