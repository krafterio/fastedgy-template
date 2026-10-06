/**
 * Global setup for the web test suite.
 *
 * Components go through i18n for every user-facing string: `$t()` in templates,
 * and the `v-tc` directive from vue-fastedgy for free text. Without both
 * installed, `mount()` throws on an unknown directive before a single assertion
 * runs, so they belong here rather than in each test.
 *
 * `createI18nExtra` is what the apps use: the source text is the key, so an
 * untranslated string renders as itself instead of a missing-key warning.
 */

import { config } from '@vue/test-utils';
import { createI18nExtra } from 'vue-fastedgy';

config.global.plugins = [
  createI18nExtra({
    availableLocales: ['fr'],
    // With the source text as the key, a missing entry is the normal case,
    // not something to warn about on every assertion.
    missingWarn: false,
  }),
];
