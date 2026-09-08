import { useApiModel } from 'vue-fastedgy';

export function useStateApiModel(params = {}) {
  return useApiModel('state', { prefix: '/{app}', ...params });
}
