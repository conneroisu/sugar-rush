import type SugarRushPlugin from "../main";

/**
 * @abstract
 * @property name - the name of the operation
 * @property description - the description of the operation
 * @property icon - the icon of the operation
 * @property plugin - the plugin for the operation, SugarRushPlugin.
 * @method run void()
 * */
export abstract class AbstractOperation {
	abstract description: string;
	abstract icon: string;
	abstract plugin: SugarRushPlugin;
	abstract run(): void;
}
