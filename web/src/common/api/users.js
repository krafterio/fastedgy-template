import { useApiModel } from 'vue-fastedgy';

export function useUserApiModel() {
  return useApiModel('user', { prefix: '/{app}' });
}
