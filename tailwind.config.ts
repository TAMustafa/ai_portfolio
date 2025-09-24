import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';
import fs from 'fs';
import path from 'path';

const hasFrontend = fs.existsSync(path.resolve(process.cwd(), 'frontend'));

export default {
  content: hasFrontend
    ? [
        './frontend/index.html',
        './frontend/src/**/*.{ts,tsx}',
      ]
    : [
        './index.html',
        './src/**/*.{ts,tsx}',
      ],
  theme: {
    extend: {
      typography: ({ theme }) => ({
        invert: {
          css: {
            '--tw-prose-body': theme('colors.gray.300'),
            '--tw-prose-headings': theme('colors.gray.100'),
            '--tw-prose-lead': theme('colors.gray.400'),
            '--tw-prose-links': theme('colors.indigo.300'),
            '--tw-prose-bold': theme('colors.gray.100'),
            '--tw-prose-counters': theme('colors.gray.400'),
            '--tw-prose-bullets': theme('colors.gray.600'),
            '--tw-prose-hr': theme('colors.gray.700'),
            '--tw-prose-quotes': theme('colors.gray.100'),
            '--tw-prose-quote-borders': theme('colors.indigo.700'),
            '--tw-prose-captions': theme('colors.gray.400'),
            '--tw-prose-code': theme('colors.teal.300'),
            '--tw-prose-pre-code': theme('colors.gray.200'),
            '--tw-prose-pre-bg': theme('colors.gray.900'),
            '--tw-prose-th-borders': theme('colors.gray.700'),
            '--tw-prose-td-borders': theme('colors.gray.800'),
          },
        },
      }),
    },
  },
  plugins: [typography],
} satisfies Config;
