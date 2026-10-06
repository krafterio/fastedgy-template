/**
 * The entry point, run as the browser runs it: a plugin it installs with the
 * wrong arguments throws here, before the first screen, as it would on load.
 */

import { describe, expect, it } from 'vitest';

describe('main entry point', () => {
  it('mounts the app', async () => {
    document.body.innerHTML = '<div id="app"></div>';

    await import('@/main/main.js');

    expect(document.querySelector('#app main')).not.toBeNull();
  });
});
