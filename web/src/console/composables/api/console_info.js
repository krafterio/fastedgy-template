import { useFetcherService } from 'vue-fastedgy';

/**
 * What the console asks for to know whether it may be opened at all.
 *
 * @param {{ prefix?: string }} [params]
 */
export function useConsoleInfoApi(params = {}) {
  const fetcher = useFetcherService();
  const base = params.prefix || '/{app}';

  return {
    /**
     * operationId: get_console_info
     * GET /api/console/info
     *
     * @returns {Promise<Record<string, any>>}
     */
    read: async () => (await fetcher.get(`${base}/info`)).data,
  };
}
