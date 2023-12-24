export const plugins = [
    "@typescript-eslint/eslint-plugin",
    "eslint-plugin-tsdoc"
];
export const parser = '@typescript-eslint/parser';
export const parserOptions = {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
    ecmaVersion: 2018,
    sourceType: "module"
};
export const rules = {
    "tsdoc/syntax": "warn"
};
