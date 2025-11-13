import { useApiModel } from "vue-fastedgy";

export function useStateApiModel() {
    return useApiModel("state", { prefix: "/{app}" });
}
