

class Operation {
	id: string;
	description: string;
	constructor() {
		this.id = "";
		this.description = "";
	}
}


class OperationNode {
	operation: Operation;
	parent: OperationNode | null;
	children: OperationNode[];
	constructor(operation: Operation) {
		this.operation = operation;
		this.parent = null;
		this.children = [];
	}
}

class OperationTree {
	root: OperationNode;
	constructor() {
		this.root = new OperationNode(new Operation());
	}

	add(operation: Operation, parent: Operation) {
		const node = new OperationNode(operation);
		this.root.children.push(node);
	}

}

