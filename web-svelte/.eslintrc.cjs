module.exports = {
	root: true,
	extends: [
		'eslint:recommended',
		'@typescript-eslint/recommended',
		'prettier'
	],
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint'],
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2020,
		extraFileExtensions: ['.svelte']
	},
	env: {
		browser: true,
		es2017: true,
		node: true
	},
	overrides: [
		{
			files: ['*.svelte'],
			parser: 'svelte-eslint-parser',
			parserOptions: {
				parser: '@typescript-eslint/parser'
			}
		}
	],
	rules: {
		// Use single quotes as per code style standards
		'quotes': ['error', 'single'],
		// Enforce snake_case for variables and functions
		'@typescript-eslint/naming-convention': [
			'error',
			{
				'selector': 'variableLike',
				'format': ['snake_case', 'camelCase']
			},
			{
				'selector': 'function',
				'format': ['snake_case', 'camelCase']
			},
			{
				'selector': 'typeLike',
				'format': ['PascalCase']
			}
		],
		// 2-space indentation
		'indent': ['error', 2],
		// Allow unused vars with underscore prefix
		'@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }]
	}
};