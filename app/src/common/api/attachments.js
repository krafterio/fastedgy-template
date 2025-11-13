import { useApiModel, useFetcherService } from "vue-fastedgy";

export function useAttachmentApiModel() {
    const apiModel = useApiModel("attachment", { prefix: "/{app}" });

    return {
        ...apiModel,
        upload: async (files) => {
            const fetcher = useFetcherService();
            const formData = new FormData();

            for (const file of files) {
                formData.append(file.name, file);
            }

            return await fetcher.post("/storage/upload/attachments", formData);
        },
    };
}
