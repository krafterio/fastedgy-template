import { ref, computed } from "vue";
import { useFetcher } from "vue-fastedgy";

/**
 * Composable for drag & drop resequencing functionality
 *
 * @param {string} modelName - API model name
 * @param {Object} metadata - Model metadata from metadata store
 * @param {boolean|undefined} sortableConfig - Sortable configuration override
 * @returns {Object} Sortable state and methods
 */
export function useSortable(modelName, metadata, sortableConfig) {
    const fetcher = useFetcher();

    const isSortable = ref(false);
    const sortableField = ref(null);

    if (sortableConfig === undefined) {
        if (metadata?.sortable) {
            isSortable.value = true;
            sortableField.value = metadata.sortable_field || "sequence";
        }
    } else if (sortableConfig === true) {
        isSortable.value = true;
        sortableField.value = metadata?.sortable_field || "sequence";
    }

    /**
     * Resequence items by updating their sequence field
     * @param {Array<number>} ids - New order of item IDs
     * @returns {Promise<void>}
     */
    const resequence = async (ids) => {
        if (!isSortable.value || !sortableField.value) {
            console.warn("[useSortable] Resequencing is not enabled");
            return;
        }

        await fetcher.put("/dataset/resequence", {
            model_name: modelName,
            ids,
            sequence_field: sortableField.value,
        });
    };

    /**
     * Get the sortable field name (if sortable)
     * @returns {string|null}
     */
    const getSortableField = () => sortableField.value;

    return {
        isSortable,
        sortableField: computed(() => sortableField.value),
        resequence,
        getSortableField,
    };
}
