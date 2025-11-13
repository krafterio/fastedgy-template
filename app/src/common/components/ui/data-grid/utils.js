export function getNestedValue(obj, path, defaultValue = undefined) {
    if (!obj || !path) return defaultValue;

    return (
        path.split(".").reduce((acc, part) => {
            return acc?.[part];
        }, obj) ?? defaultValue
    );
}

export function downloadBlob(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}
