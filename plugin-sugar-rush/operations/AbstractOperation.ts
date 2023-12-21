export abstract class AbstractOperation {
	abstract name: string;
	abstract description: string;
	abstract icon: string;
	abstract id: string;
	abstract run(): void;
}
