import { Link } from '@inertiajs/react';
import { liteClient as algoliasearch } from 'algoliasearch/lite';
import { Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    Highlight,
    InstantSearch,
    useHits,
    useSearchBox,
} from 'react-instantsearch';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SearchBarProps {
    className?: string;
    placeholder?: string;
    onSelect?: () => void;
}

const ALGOLIA_APP_ID = import.meta.env.VITE_ALGOLIA_APP_ID as
    | string
    | undefined;
const ALGOLIA_SEARCH_KEY = import.meta.env.VITE_ALGOLIA_SEARCH_KEY as
    | string
    | undefined;
const ALGOLIA_INDEX_NAME = import.meta.env.VITE_ALGOLIA_INDEX_NAME as
    | string
    | undefined;

function useClickOutside(handler: () => void) {
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const onClick = (event: MouseEvent) => {
            if (!ref.current || ref.current.contains(event.target as Node)) {
                return;
            }
            handler();
        };

        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, [handler]);

    return ref;
}

function SearchInput({
    placeholder,
    onFocus,
    onBlur,
    isActive,
    onQueryChange,
}: {
    placeholder: string;
    onFocus: () => void;
    onBlur: () => void;
    isActive: boolean;
    onQueryChange: (query: string) => void;
}) {
    const { query, refine } = useSearchBox();

    return (
        <div className="relative">
            <Search className="absolute top-1/2 left-4 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" />
            <Input
                type="text"
                value={query}
                onChange={(e) => {
                    refine(e.target.value);
                    onQueryChange(e.target.value);
                }}
                onFocus={onFocus}
                onBlur={onBlur}
                placeholder={placeholder}
                className={cn(
                    'h-11 rounded-2xl border border-primary/40 bg-white/95 pr-4 pl-11 text-sm shadow-md transition-all duration-200 focus-visible:border-primary focus-visible:shadow-lg focus-visible:ring-1 focus-visible:ring-primary/30',
                    isActive && 'rounded-t-2xl rounded-b-none',
                )}
            />
        </div>
    );
}

function SearchResults({ onSelect }: { onSelect: () => void }) {
    const { hits } = useHits();

    if (!hits.length) {
        return (
            <div className="px-4 py-3 text-sm text-muted-foreground">
                No products found.
            </div>
        );
    }

    return (
        <div className="max-h-72 overflow-auto py-2">
            {hits.map((hit: any) => {
                const slug =
                    hit.seoUrl || hit.slug || hit.seo_url || hit.objectID;
                const categorySlug =
                    hit.categorySlug || hit.category_slug || hit.categoryslug;
                const image =
                    hit.image1 ||
                    hit.primary_image ||
                    hit.thumbnail ||
                    hit.image;
                const category =
                    hit.category_name || hit.category || hit.categoryName;
                const stock = typeof hit.stock === 'number' ? hit.stock : null;
                const name = hit.name || 'Product';

                return (
                    <Link
                        key={hit.objectID}
                        href={
                            categorySlug
                                ? `/category/${categorySlug}/product/${slug}`
                                : `/product/${slug}`
                        }
                        className="flex items-center gap-3 px-4 py-2 transition hover:bg-muted"
                        onClick={onSelect}
                    >
                        <div className="h-10 w-10 overflow-hidden rounded-md bg-muted">
                            {image ? (
                                <img
                                    src={
                                        image.startsWith('http')
                                            ? image
                                            : `/uploads/products/${image}`
                                    }
                                    alt={name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="h-full w-full" />
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium text-foreground">
                                <Highlight attribute="name" hit={hit} />
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                {category ? (
                                    <span className="rounded-full bg-muted px-2 py-0.5">
                                        {category}
                                    </span>
                                ) : null}
                                {typeof hit.price === 'number' ? (
                                    <span>₹{hit.price}</span>
                                ) : null}
                                {stock !== null ? (
                                    <span
                                        className={cn(
                                            'rounded-full px-2 py-0.5',
                                            stock > 0
                                                ? 'bg-emerald-50 text-emerald-700'
                                                : 'bg-rose-50 text-rose-700',
                                        )}
                                    >
                                        {stock > 0
                                            ? 'In stock'
                                            : 'Out of stock'}
                                    </span>
                                ) : null}
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}

export function SearchBar({
    className = '',
    placeholder = 'Search products...',
    onSelect,
}: SearchBarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const close = () => {
        setIsOpen(false);
        onSelect?.();
    };
    const wrapperRef = useClickOutside(close);
    const future = useMemo(() => ({ preserveSharedStateOnUnmount: true }), []);

    const searchClient = useMemo(() => {
        if (!ALGOLIA_APP_ID || !ALGOLIA_SEARCH_KEY) return null;
        return algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY);
    }, []);

    if (!searchClient || !ALGOLIA_INDEX_NAME) {
        return (
            <form className={`relative ${className}`}>
                <div className="relative">
                    <Search className="absolute top-1/2 left-4 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder={placeholder}
                        className="h-11 rounded-2xl border border-primary/40 bg-white/95 pr-4 pl-11 text-sm shadow-md transition-all duration-200 focus-visible:border-primary focus-visible:shadow-lg focus-visible:ring-1 focus-visible:ring-primary/30"
                    />
                </div>
            </form>
        );
    }

    return (
        <div className={`relative ${className}`} ref={wrapperRef}>
            <InstantSearch
                searchClient={searchClient}
                indexName={ALGOLIA_INDEX_NAME}
                future={future}
            >
                <SearchInput
                    placeholder={placeholder}
                    onFocus={() => {
                        setIsOpen(true);
                    }}
                    onBlur={() => {
                        setTimeout(() => setIsOpen(false), 150);
                    }}
                    isActive={isOpen && searchQuery.length > 0}
                    onQueryChange={setSearchQuery}
                />
                {isOpen && searchQuery.length > 0 && (
                    <div className="absolute z-50 mt-0 w-full rounded-b-2xl border border-t-0 bg-background shadow-lg">
                        <SearchResults onSelect={close} />
                        <div className="border-t px-4 py-2 text-right">
                            <Button
                                asChild
                                size="sm"
                                variant="ghost"
                                className="text-xs"
                            >
                                <Link href="/product" onClick={close}>
                                    View all products
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}
            </InstantSearch>
        </div>
    );
}
