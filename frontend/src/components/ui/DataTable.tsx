'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Column<T> {
    key: keyof T | string;
    label: string;
    sortable?: boolean;
    render?: (value: any, row: T) => React.ReactNode;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    onRowClick?: (row: T) => void;
    pagination?: boolean;
    pageSize?: number;
}

export function DataTable<T extends { id: string | number }>({
    data,
    columns,
    onRowClick,
    pagination = true,
    pageSize = 10,
}: DataTableProps<T>) {
    const [sortColumn, setSortColumn] = useState<keyof T | string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = useState(1);

    const handleSort = (columnKey: keyof T | string) => {
        if (sortColumn === columnKey) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(columnKey);
            setSortDirection('asc');
        }
    };

    const sortedData = [...data].sort((a, b) => {
        if (!sortColumn) return 0;

        // Type assertion for indexing since keyof T | string is tricky
        const key = sortColumn as keyof T;
        const aVal = a[key];
        const bVal = b[key];

        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    const paginatedData = pagination
        ? sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
        : sortedData;

    const totalPages = Math.ceil(data.length / pageSize);

    return (
        <div className="bg-white dark:bg-background rounded-xl border border-slate-200 dark:border-border-dark overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-100 dark:border-border-dark">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={String(column.key)}
                                    className={`px-6 py-4 ${column.sortable ? 'cursor-pointer hover:bg-primary/8 dark:hover:bg-violet-500/15 transition-colors' : ''}`}
                                    onClick={() => column.sortable && handleSort(column.key)}
                                >
                                    <div className="flex items-center gap-2 group">
                                        {column.label}
                                        {column.sortable && (
                                            <span className={`text-slate-400 group-hover:text-primary transition-colors ${sortColumn === column.key ? 'text-primary' : ''}`}>
                                                {sortColumn === column.key ? (
                                                    sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                                                ) : (
                                                    <div className="flex flex-col opacity-0 group-hover:opacity-50">
                                                        <ChevronUp className="w-2 h-2 -mb-0.5" />
                                                        <ChevronDown className="w-2 h-2" />
                                                    </div>
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {paginatedData.length > 0 ? (
                            paginatedData.map((row) => (
                                <tr
                                    key={row.id}
                                    className={`hover:bg-primary/5 dark:hover:bg-violet-500/10 transition-colors ${onRowClick ? 'cursor-pointer' : ''
                                        }`}
                                    onClick={() => onRowClick?.(row)}
                                >
                                    {columns.map((column) => (
                                        <td key={String(column.key)} className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                                            {column.render
                                                // @ts-expect-error: dynamic key access of column render function
                                                ? column.render(row[column.key], row)
                                                // @ts-expect-error: dynamic key access of row object
                                                : String(row[column.key])
                                            }
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-500 text-sm">
                                    No data available
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {pagination && totalPages > 1 && (
                <div className="px-6 py-4 border-t border-slate-100 dark:border-border-dark flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                    <p className="text-xs font-medium text-slate-500">
                        Showing <span className="font-bold text-slate-900 dark:text-white">{(currentPage - 1) * pageSize + 1}</span> to <span className="font-bold text-slate-900 dark:text-white">{Math.min(currentPage * pageSize, data.length)}</span> of{' '}
                        <span className="font-bold text-slate-900 dark:text-white">{data.length}</span> results
                    </p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <Button variant="outline" size="sm"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
