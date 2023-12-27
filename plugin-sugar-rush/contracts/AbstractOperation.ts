import type SugarRushPlugin from "../main";

export abstract class AbstractOperation {
	abstract name: string;
	abstract description: string;
	abstract icon: string;
	abstract plugin: SugarRushPlugin;
	abstract run(): void;
}
