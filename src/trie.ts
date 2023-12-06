import { App, TFile, TFolder } from 'obsidian';

class TrieNode {
    children: { [key: string]: TrieNode };
    endOfPath: boolean;

    constructor() {
        this.children = {};
        this.endOfPath = false;
    }
}

class Trie {
    root: TrieNode;

    constructor() {
        this.root = new TrieNode();
    }

    addPath(path: string): void {
        let node = this.root;
        for (let char of path) {
            if (!node.children[char]) {
                node.children[char] = new TrieNode();
            }
            node = node.children[char];
        }
        node.endOfPath = true;
    }

    getPath(path: string): boolean {
        let node = this.root;
        for (let char of path) {
            if (!node.children[char]) {
                return false;
            }
            node = node.children[char];
        }
        return node.endOfPath;
    }
}

export async function populateTrie(app: App): Promise<Trie> {
    const trie = new Trie();
    const files: TFile[] = app.vault.getFiles();
    const folders: TFolder[] = app.vault.getFolders();

    files.forEach(file => trie.addPath(file.path));
    folders.forEach(folder => trie.addPath(folder.path));

    return trie;
}
