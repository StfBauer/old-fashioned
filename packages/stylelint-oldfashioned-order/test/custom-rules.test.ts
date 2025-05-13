import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const rulesFilePath = path.resolve(__dirname, '../src/rules/custom-formatting-rules.ts');
const ruleExists = fs.existsSync(rulesFilePath);

describe('Custom Formatting Rules', () => {
    it('custom rules file should exist', () => {
        expect(ruleExists).toBe(true);
    });

    if (ruleExists) {
        const ruleFileContent = fs.readFileSync(rulesFilePath, 'utf8');

        it('should include unitless-zero rule', () => {
            expect(ruleFileContent).toContain('export const unitlessZero');
        });

        it('should include strip-spaces rule', () => {
            expect(ruleFileContent).toContain('export const stripSpaces');
        });

        it('should include color-case rule', () => {
            expect(ruleFileContent).toContain('export const colorCase');
        });

        it('should include color-shorthand rule', () => {
            expect(ruleFileContent).toContain('export const colorShorthand');
        });

        it('should include vendor-prefix-align rule', () => {
            expect(ruleFileContent).toContain('export const vendorPrefixAlign');
        });

        it('should include space-before-colon rule', () => {
            expect(ruleFileContent).toContain('export const spaceBeforeColon');
        });

        it('should include space-after-colon rule', () => {
            expect(ruleFileContent).toContain('export const spaceAfterColon');
        });

        it('should include space-before-combinator rule', () => {
            expect(ruleFileContent).toContain('export const spaceBeforeCombinator');
        });

        it('should include space-after-combinator rule', () => {
            expect(ruleFileContent).toContain('export const spaceAfterCombinator');
        });

        it('should include space-between-declarations rule', () => {
            expect(ruleFileContent).toContain('export const spaceBetweenDeclarations');
        });

        it('should include space-before-opening-brace rule', () => {
            expect(ruleFileContent).toContain('export const spaceBeforeOpeningBrace');
        });

        it('should include space-after-opening-brace rule', () => {
            expect(ruleFileContent).toContain('export const spaceAfterOpeningBrace');
        });

        it('should include space-after-selector-delimiter rule', () => {
            expect(ruleFileContent).toContain('export const spaceAfterSelectorDelimiter');
        });

        it('should include space-before-selector-delimiter rule', () => {
            expect(ruleFileContent).toContain('export const spaceBeforeSelectorDelimiter');
        });

        it('should include space-before-closing-brace rule', () => {
            expect(ruleFileContent).toContain('export const spaceBeforeClosingBrace');
        });
    }
});