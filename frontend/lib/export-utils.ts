/**
 * Export utility functions for downloading data as CSV or Excel
 */

export interface ExportOptions {
  projectId: string;
  endpoint: string;
  format: 'csv' | 'excel';
  filename?: string;
  filters?: Record<string, string | undefined>;
}

/**
 * Export data to CSV or Excel file
 */
export async function exportData(options: ExportOptions): Promise<void> {
  const { projectId, endpoint, format, filename, filters = {} } = options;

  try {
    // Build query parameters
    const params = new URLSearchParams({
      format,
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined && value !== 'all')
      ),
    });

    const url = `${endpoint}?${params.toString()}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Export failed' }));
      throw new Error(error.message || 'Export failed');
    }

    // Get filename from Content-Disposition header or use default
    const contentDisposition = response.headers.get('Content-Disposition');
    let exportFilename = filename || `export-${Date.now()}.${format === 'csv' ? 'csv' : 'xlsx'}`;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+?)"?$/);
      if (filenameMatch) {
        exportFilename = filenameMatch[1];
      }
    }

    // Get the blob
    const blob = await response.blob();
    
    // Create download link
    const urlObj = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = urlObj;
    a.download = exportFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(urlObj);
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
}

