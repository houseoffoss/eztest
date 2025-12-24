import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/frontend/reusable-elements/tables/BaseTable';

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
  isLoading?: boolean;
  emptyMessage?: string;
  rowClassName?: string;
}

/**
 * Reusable DataTable component for displaying tabular data
 * Used in: TestSuite (test cases), TestCase (execution history), and other pages
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
  isLoading = false,
  emptyMessage = 'No data available',
  rowClassName = 'cursor-pointer hover:bg-white/5',
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col, idx) => (
              <TableHead
                key={idx}
                className={col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''}
              >
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-8">
                <div className="text-white/60">Loading...</div>
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-8">
                <div className="text-white/60">{emptyMessage}</div>
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, idx) => (
              <TableRow
                key={idx}
                className={onRowClick ? rowClassName : ''}
                onClick={(e) => {
                  // Prevent row click if clicking on a button or interactive element
                  if ((e.target as HTMLElement).closest('button, [role="button"]')) {
                    return;
                  }
                  onRowClick?.(row);
                }}
              >
                {columns.map((col, colIdx) => (
                  <TableCell
                    key={`${idx}-${colIdx}`}
                    className={col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : col.className}
                  >
                    {col.render ? col.render((row as Record<string, unknown>)[String(col.key)] as unknown, row) : String((row as Record<string, unknown>)[String(col.key)])}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default DataTable;

