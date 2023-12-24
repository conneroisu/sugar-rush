import type SugarRushPlugin from "plugin-sugar-rush/main";

export abstract class AbstractOperation {
	abstract name: string;
	abstract description: string;
	abstract icon: string;
	abstract id: string;
	abstract plugin: SugarRushPlugin;
	abstract run(): void;
}
