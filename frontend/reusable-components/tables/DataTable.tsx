import * as React from 'react';
import Link from 'next/link';

export interface ColumnDef<T> {
  key: keyof T | string;
  label: string;
  render?: (value: unknown, row: T) => React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  getRowHref?: (row: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  rowClassName?: string;
}

/**
 * Reusable DataTable component for displaying tabular data
 * Uses CSS Grid for consistent styling with DefectTable and GroupedDataTable
 * 
 * @example
 * ```tsx
 * const columns: ColumnDef<TestCase>[] = [
 *   { key: 'title', label: 'Title' },
 *   { key: 'priority', label: 'Priority', render: (val, row) => <Badge>{row.priority}</Badge> },
 *   { key: 'status', label: 'Status' }
 * ];
 * 
 * <DataTable columns={columns} data={testCases} onRowClick={(row) => handleClick(row.id)} />
 * ```
 */
export function DataTable<T>({
  columns,
  data,
  onRowClick,
  getRowHref,
  isLoading = false,
  emptyMessage = 'No data available',
  rowClassName = 'cursor-pointer hover:bg-white/5',
}: DataTableProps<T>) {
  // Calculate grid columns - use auto for flexible sizing
  const gridColumns = columns.map(() => '1fr').join(' ');

  return (
    <div className="space-y-0">
      {isLoading ? (
        <div className="text-center py-8">
          <div className="text-white/60">Loading...</div>
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-white/60">{emptyMessage}</div>
        </div>
      ) : (
        <>
          {/* Header Row */}
          <div
            className="grid gap-3 px-3 py-2 text-xs font-semibold text-white/60 border-b border-white/10 rounded-t-md"
            style={{ gridTemplateColumns: gridColumns }}
          >
            {columns.map((col, idx) => (
              <div
                key={idx}
                className={col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''}
              >
                {col.label}
              </div>
            ))}
          </div>

          {/* Data Rows */}
          {data.map((row, idx) => {
            const rowHref = getRowHref?.(row);
            const rowClass = `grid gap-3 px-3 py-2.5 transition-colors items-center text-sm rounded-sm hover:bg-accent/20 ${
              idx % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.04] border-b border-white/10'
            } ${
              idx === data.length - 1 ? 'rounded-b-md' : ''
            } ${
              rowHref || onRowClick ? 'cursor-pointer' : ''
            } ${rowClassName || ''}`;

            const cells = columns.map((col, colIdx) => (
              <div
                key={`${idx}-${colIdx}`}
                className={col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : col.className}
              >
                {col.render ? col.render((row as Record<string, unknown>)[String(col.key)] as unknown, row) : String((row as Record<string, unknown>)[String(col.key)])}
              </div>
            ));

            if (rowHref) {
              return (
                <Link
                  key={idx}
                  href={rowHref}
                  className={rowClass}
                  style={{ gridTemplateColumns: gridColumns }}
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest('button, [role="button"]')) {
                      e.preventDefault();
                    }
                  }}
                >
                  {cells}
                </Link>
              );
            }

            return (
              <div
                key={idx}
                className={rowClass}
                style={{ gridTemplateColumns: gridColumns }}
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest('button, [role="button"]')) return;
                  onRowClick?.(row);
                }}
              >
                {cells}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

export default DataTable;
