/**
 * Get file download URL from file path
 * @param {string} filePath - The file path
 * @returns {string} Download URL
 */
export function getApiFileDownloadUrl(filePath) {
    if (!filePath) return null;
    return `/storage/download/${filePath}`;
}

/**
 * Get attachment download URL from attachment ID
 * @param {string} attachmentId - The attachment ID
 * @returns {string} Download URL
 */
export function getApiAttachmentDownloadUrl(attachmentId) {
    if (!attachmentId) return null;
    return `/storage/download/attachments/${attachmentId}?force_download=true`;
}

/**
 * Format file size from bytes to human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Get file type icon based on mimetype
 * @param {string} mimetype - File mimetype
 * @returns {string} Icon name
 */
export function getFileTypeIcon(mimetype) {
    if (!mimetype) return "File";

    if (mimetype.startsWith("image/")) return "FileImage";
    if (mimetype.startsWith("video/")) return "FileVideo";
    if (mimetype.startsWith("audio/")) return "FileAudio";
    if (mimetype.includes("pdf")) return "FileText";
    if (mimetype.includes("word") || mimetype.includes("document"))
        return "FileText";
    if (mimetype.includes("sheet") || mimetype.includes("excel"))
        return "FileSpreadsheet";
    if (mimetype.includes("presentation") || mimetype.includes("powerpoint"))
        return "FilePresentation";
    if (
        mimetype.includes("zip") ||
        mimetype.includes("rar") ||
        mimetype.includes("7z")
    )
        return "FileArchive";

    return "File";
}
