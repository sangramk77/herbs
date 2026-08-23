import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

export interface DataTableColumn<T> {
    key: string;
    label: string;
    sortable?: boolean;
    render?: (item: T, index: number) => React.ReactNode;
    className?: string;
}

interface DataTableProps<T> {
    data: T[];
    columns: DataTableColumn<T>[];
    searchable?: boolean;
    searchPlaceholder?: string;
    searchKeys?: (keyof T)[];
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    containerClassName?: string;
    compact?: boolean;
    itemsPerPageOptions?: number[];
    defaultItemsPerPage?: number;
    showItemsPerPage?: boolean;
    serverPagination?: {
        currentPage: number;
        lastPage: number;
        total: number;
        perPage: number;
        links?: { url: string | null; label: string; active: boolean }[];
    };
    onPageChange?: (url: string) => void;
    onRowClick?: (item: T) => void;
}

export function DataTable<T extends Record<string, any>>({
    data,
    columns,
    searchable = true,
    searchPlaceholder = 'Search...',
    searchKeys = [],
    searchValue,
    onSearchChange,
    containerClassName,
    compact = false,
    itemsPerPageOptions = [5, 10, 25, 50],
    defaultItemsPerPage = 5,
    showItemsPerPage = true,
    serverPagination,
    onPageChange,
    onRowClick,
}: DataTableProps<T>) {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);
    const isServerPaginated = !!serverPagination;
    const effectiveSearchQuery = searchValue ?? searchQuery;

    // Filter data based on search query
    const filteredData = useMemo(() => {
        if (
            isServerPaginated ||
            !effectiveSearchQuery ||
            searchKeys.length === 0
        ) {
            return data;
        }

        return data.filter((item) =>
            searchKeys.some((key) => {
                const value = item[key];
                if (value === null || value === undefined) return false;
                return String(value)
                    .toLowerCase()
                    .includes(effectiveSearchQuery.toLowerCase());
            }),
        );
    }, [data, effectiveSearchQuery, searchKeys, isServerPaginated]);

    // Calculate pagination
    const totalPages = isServerPaginated
        ? serverPagination!.lastPage
        : Math.ceil(filteredData.length / itemsPerPage);
    const activePage = isServerPaginated
        ? serverPagination!.currentPage
        : currentPage;
    const totalItems = isServerPaginated
        ? serverPagination!.total
        : filteredData.length;
    const perPage = isServerPaginated
        ? serverPagination!.perPage
        : itemsPerPage;
    const startIndex = totalItems === 0 ? 0 : (activePage - 1) * perPage;
    const endIndex = isServerPaginated
        ? Math.min(startIndex + currentDataLength(data), totalItems)
        : startIndex + perPage;
    const currentData = isServerPaginated
        ? filteredData
        : filteredData.slice(startIndex, endIndex);

    // Reset to page 1 when search query changes
    const handleSearch = (value: string) => {
        if (onSearchChange) {
            onSearchChange(value);
            return;
        }
        setSearchQuery(value);
        setCurrentPage(1);
    };

    // Reset to page 1 when items per page changes
    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(Number(value));
        setCurrentPage(1);
    };

    const compactHead = compact ? 'h-10 px-3 text-xs uppercase' : '';
    const compactCell = compact ? 'p-3 text-sm' : '';

    return (
        <div className={cn('space-y-4', containerClassName)}>
            {/* Search and Items Per Page */}
            {searchable && (
                <div className="flex items-center justify-between gap-4">
                    {showItemsPerPage && !isServerPaginated && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-700 dark:text-zinc-400">
                                Show
                            </span>
                            <Select
                                value={String(itemsPerPage)}
                                onValueChange={handleItemsPerPageChange}
                            >
                                <SelectTrigger className="w-20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {itemsPerPageOptions.map((option) => (
                                        <SelectItem
                                            key={option}
                                            value={String(option)}
                                        >
                                            {option}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <span className="text-sm text-gray-700 dark:text-zinc-400">
                                entries
                            </span>
                        </div>
                    )}

                    <div className="relative w-full max-w-sm">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-zinc-500" />
                        <Input
                            placeholder={searchPlaceholder}
                            value={effectiveSearchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-9 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                        />
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="rounded-lg border border-gray-200 bg-white dark:border-zinc-800 dark:bg-black">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent dark:border-zinc-800">
                            {columns.map((column) => (
                                <TableHead
                                    key={column.key}
                                    className={cn(
                                        'dark:text-zinc-400',
                                        compactHead,
                                        column.className,
                                    )}
                                >
                                    {column.label}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentData.length > 0 ? (
                            currentData.map((item, index) => (
                                <TableRow
                                    key={index}
                                    className={cn(
                                        'dark:border-zinc-800',
                                        onRowClick && 'cursor-pointer',
                                    )}
                                    onClick={() => onRowClick?.(item)}
                                >
                                    {columns.map((column) => (
                                        <TableCell
                                            key={column.key}
                                            className={cn(
                                                'dark:text-zinc-300',
                                                compactCell,
                                                column.className,
                                            )}
                                        >
                                            {column.render
                                                ? column.render(
                                                      item,
                                                      startIndex + index,
                                                  )
                                                : item[column.key]}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center dark:text-zinc-400"
                                >
                                    No results found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {/* Pagination */}
                {totalItems > 0 && (
                    <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-zinc-800">
                        <div className="text-sm text-gray-700 dark:text-zinc-400">
                            Showing{' '}
                            <span className="font-medium">
                                {startIndex + 1}
                            </span>{' '}
                            to{' '}
                            <span className="font-medium">
                                {Math.min(endIndex, totalItems)}
                            </span>{' '}
                            of <span className="font-medium">{totalItems}</span>{' '}
                            results
                        </div>
                        <div className="flex items-center gap-2">
                            {!isServerPaginated ? (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setCurrentPage((prev) =>
                                                Math.max(prev - 1, 1),
                                            )
                                        }
                                        disabled={currentPage === 1}
                                        className="gap-1 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Previous
                                    </Button>
                                    <div className="flex items-center gap-1">
                                        {Array.from(
                                            { length: totalPages },
                                            (_, i) => i + 1,
                                        ).map((page) => (
                                            <Button
                                                key={page}
                                                variant={
                                                    currentPage === page
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                size="sm"
                                                onClick={() =>
                                                    setCurrentPage(page)
                                                }
                                                className={
                                                    currentPage === page
                                                        ? ''
                                                        : 'dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
                                                }
                                            >
                                                {page}
                                            </Button>
                                        ))}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setCurrentPage((prev) =>
                                                Math.min(prev + 1, totalPages),
                                            )
                                        }
                                        disabled={currentPage === totalPages}
                                        className="gap-1 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </>
                            ) : (
                                <div className="flex items-center gap-1">
                                    {(serverPagination?.links ?? []).map(
                                        (link, index) => (
                                            <Button
                                                key={index}
                                                variant={
                                                    link.active
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                size="sm"
                                                onClick={() =>
                                                    link.url &&
                                                    onPageChange?.(link.url)
                                                }
                                                disabled={!link.url}
                                                className={
                                                    link.active
                                                        ? ''
                                                        : 'dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
                                                }
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                            />
                                        ),
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function currentDataLength<T>(data: T[]) {
    return data.length;
}
