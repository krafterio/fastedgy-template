import { useApiModel } from 'vue-fastedgy';

export function useAttachmentApiModel(params = {}) {
  return useApiModel('attachment', { prefix: '/{app}', ...params });
}
