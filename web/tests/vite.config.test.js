/**
 * The config as `vite build --mode <mode>` loads it: a mode reads its own
 * `.env.<mode>` files on top of `.env`.
 */

import fs from 'node:fs';
import { resolve } from 'node:path';
import { loadConfigFromFile } from 'vite';
import { afterEach, describe, expect, it, vi } from 'vitest';

const web = resolve(import.meta.dirname, '..');
const modeEnvFile = resolve(web, '../.env.regression.local');

afterEach(() => {
  fs.rmSync(modeEnvFile, { force: true });
  vi.unstubAllEnvs();
});

describe('vite config', () => {
  it('reads the env file of the mode it runs in', async () => {
    vi.stubEnv('VITE_API_URL', undefined);
    fs.writeFileSync(modeEnvFile, 'VITE_API_URL=https://regression.example.io\n');

    const { config } = await loadConfigFromFile(
      { command: 'build', mode: 'regression' },
      resolve(web, 'vite.config.js'),
      web,
      'silent'
    );

    expect(config.define['import.meta.env.VITE_API_URL']).toBe('"https://regression.example.io"');
  });
});
