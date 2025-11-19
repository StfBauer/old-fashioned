/**
 * Stylelint Mock Wrapper
 * 
 * This helps ensure we can track actual calls to stylelint in tests
 */

import * as stylelint from 'stylelint';
import { stylelintMock } from '../setup';

// Create a wrapper function that records the call and passes through to the mock
export function lintWrapper(cssText: string, options?: any): Promise<any> {
    console.log('Stylelint wrapper called with:', { cssTextLength: cssText?.length, options });
    return stylelintMock.default.lint(cssText, options);
}

export default {
    lint: lintWrapper
};
