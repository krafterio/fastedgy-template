import { useApiModel } from 'vue-fastedgy';

export function useUserApiModel(params = {}) {
  return useApiModel('user', { prefix: '/{app}', ...params });
}
