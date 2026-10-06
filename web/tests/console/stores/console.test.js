import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useConsoleStore } from '@/console/stores/console';

const read = vi.hoisted(() => vi.fn());

vi.mock('@/console/composables/api/console_info', () => ({
  useConsoleInfoApi: () => ({ read }),
}));

describe('console store', () => {
  beforeEach(() => {
    localStorage.setItem('access_token', 'token');
    localStorage.setItem('refresh_token', 'refresh');
    setActivePinia(createPinia());
  });

  it('keeps a network error, which carries no response', async () => {
    const offline = new TypeError('Failed to fetch');
    read.mockRejectedValue(offline);
    const store = useConsoleStore();

    await store.fetchAdmin();

    expect(store.error).toBe(offline);
    expect(store.loading).toBe(false);
  });
});
