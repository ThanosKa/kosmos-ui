import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';

const eslintConfig = defineConfig([
  ...nextVitals,
  {
    // kosmos-style: every Button in Kosmos code passes `variant`, and clickable controls are Buttons.
    // (Installed copies keep `variant` optional, so apps that replace shadcn's Button still build.)
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "JSXOpeningElement[name.name='Button']:not(:has(JSXAttribute[name.name='variant']))",
          message: 'Pass `variant` explicitly on every <Button> (kosmos-style).',
        },
        {
          selector: "JSXOpeningElement[name.name='button']",
          message: 'Use the Kosmos <Button variant="..."> instead of a raw <button> (kosmos-style).',
        },
      ],
    },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    '.source/**',
    '.claude/**',
    '.scratch/**',
    'public/r/**',
  ]),
]);

export default eslintConfig;
