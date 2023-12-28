import { TAbstractFile } from "obsidian";

/**
 * 
 **/
export default class TSAbstractFile extends TAbstractFile {
	operation!: string;
	/**
	 * Create a new TSAstractFile
	 **/
	constructor(file: TAbstractFile, operation: string) {
		super();
		return Object.assign(this, file, { operation });
	}
}
