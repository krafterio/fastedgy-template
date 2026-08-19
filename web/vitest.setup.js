/**
 * Global setup for the web test suite.
 *
 * Components go through i18n for every user-facing string: `$t()` in templates,
 * and the `v-tc` directive from vue-fastedgy for free text. Without both
 * installed, `mount()` throws on an unknown directive before a single assertion
 * runs, so they belong here rather than in each test.
 *
 * `fallbackFormat: true` is what the apps use: the English text is the key, so
 * an untranslated string renders as itself instead of a missing-key warning.
 */

import { config } from '@vue/test-utils';
import { createI18nExtra } from 'vue-fastedgy';
import { createI18n } from 'vue-i18n';

const i18n = createI18n({
  legacy: false,
  locale: 'fr',
  fallbackLocale: 'fr',
  availableLocales: ['fr'],
  fallbackFormat: true,
  // With the English text as the key, a missing entry is the normal case,
  // not something to warn about on every assertion.
  missingWarn: false,
  fallbackWarn: false,
});

config.global.plugins = [i18n, createI18nExtra(i18n)];
