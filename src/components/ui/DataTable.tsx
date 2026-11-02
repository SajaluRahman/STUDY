'use client';

import { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown, ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { cn } from '@/lib/utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Column<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface DataTableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  searchable?: boolean;
  searchKeys?: string[];
  pageSize?: number;
  emptyTitle?: string;
  emptyDescription?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DataTable<T = any>({
  columns,
  data,
  searchable = true,
  searchKeys,
  pageSize = 10,
  emptyTitle = 'No data found',
  emptyDescription = 'There are no records to display yet.',
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = [...data];
    if (search && searchKeys) {
      const q = search.toLowerCase();
      result = result.filter(item => {
        const record = item as Record<string, unknown>;
        return searchKeys.some(key => String(record[key] ?? '').toLowerCase().includes(q));
      });
    }
    if (sortKey) {
      result.sort((a, b) => {
        const aRecord = a as Record<string, unknown>;
        const bRecord = b as Record<string, unknown>;
        const aVal = String(aRecord[sortKey] ?? '');
        const bVal = String(bRecord[sortKey] ?? '');
        const cmp = aVal.localeCompare(bVal, undefined, { numeric: true });
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return result;
  }, [data, search, searchKeys, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const paginated = filtered.slice(startIndex, startIndex + pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDir === 'asc') setSortDir('desc');
      else {
        setSortKey(null);
        setSortDir('asc');
      }
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      {searchable && (
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search records..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-50/50"
            />
          </div>
          <span className="text-xs text-slate-400 ml-auto">
            {filtered.length} {filtered.length === 1 ? 'record' : 'records'}
          </span>
        </div>
      )}

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
                  {columns.map(col => (
                    <th
                      key={col.key}
                      onClick={() => col.sortable && handleSort(col.key)}
                      className={cn(
                        'py-3.5 px-4 font-semibold',
                        col.sortable && 'cursor-pointer select-none hover:text-slate-800',
                        col.className
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{col.label}</span>
                        {col.sortable && sortKey === col.key && (
                          sortDir === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-teal-600" /> : <ChevronDown className="w-3.5 h-3.5 text-teal-600" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {paginated.map((item, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-slate-50/50 transition-colors">
                    {columns.map(col => (
                      <td key={col.key} className={cn('py-3.5 px-4', col.className)}>
                        {col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>
                Showing {startIndex + 1} to {Math.min(startIndex + pageSize, filtered.length)} of {filtered.length} entries
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(1)}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  title="First page"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  title="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-1 font-semibold text-slate-800">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  title="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  title="Last page"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
