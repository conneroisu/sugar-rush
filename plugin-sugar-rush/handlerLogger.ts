import type SugarRushPlugin from "./main";

export default class SugarRushLoggerHandler {
	private plugin: SugarRushPlugin;

	constructor(plugin: SugarRushPlugin) {
		this.plugin = plugin;
	}

	get(): any {
		const db = require('better-sqlite3')('logs.db');
		// select all logs
		return db.prepare('SELECT * FROM logs').all();
	}

	insertLog(message: string) {
		const db = require('better-sqlite3')('logs.db');
		// db.prepare('CREATE TABLE IF NOT EXISTS logs (id INTEGER PRIMARY KEY AUTOINCREMENT, message TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)').run();
		db.prepare('INSERT INTO logs (message) VALUES (?)').run(message);
	}
}
