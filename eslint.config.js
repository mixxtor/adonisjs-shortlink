import { ESLint } from 'eslint'
import tseslint from 'typescript-eslint'
import prettierConfig from '@adonisjs/prettier-config'

export default tseslint.config({
  languageOptions: {
    parserOptions: {
      project: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
  },
})
