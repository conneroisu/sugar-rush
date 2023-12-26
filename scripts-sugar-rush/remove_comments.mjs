// removes the comments from the typescript code files in the /plugin-sugar-rush folder
import { promises as fs } from 'fs';

const dir = '../plugin-sugar-rush/';
const files = await fs.readdir(dir);

for (const file of files) {
    if (file.endsWith('.ts')) {
        const contents = await fs.readFile(`${dir}/${file}`, { encoding: 'utf-8' });
        const newContents = contents.replace(/\/\/ .*/g, '');
        await fs.writeFile(`${dir}/${file}`, newContents, { encoding: 'utf-8' });
    }
}
