module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'scope-enum': [
            2,
            'always',
            ['stylelint-oldfashioned-order', 'vscode-old-fashioned', 'shared', 'repo', 'docs', 'ci']
        ]
    }
};
