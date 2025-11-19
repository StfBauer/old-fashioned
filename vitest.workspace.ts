import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  "./vitest.config.ts",
  "./packages/vscode-old-fashioned/vitest.config.ts",
  "./packages/shared/vitest.config.ts",
  "./packages/stylelint-oldfashioned-order/vitest.config.ts"
])
