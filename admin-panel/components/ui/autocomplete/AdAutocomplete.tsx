"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Loader2, Package, X } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

// File type for ad images
interface AdFile {
  id: string;
  filename: string;
  path: string;
  isDefault?: boolean;
}

// Generic ad result type - supports both simple format and full format with files
export interface AdSearchResult {
  id: string;
  title: string;
  price: number | null;
  discountedPrice?: number | null;
  imageUrl?: string | null;
  thumbnail?: string | null;
  files?: AdFile[];
}

interface AdAutocompleteProps {
  value: string;
  selectedTitle?: string;
  onChange: (adId: string, adTitle: string) => void;
  onClear?: () => void;
  searchFn: (query: string) => Promise<AdSearchResult[]>;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  noResultsText?: string;
  icon?: React.ReactNode;
  showDiscountedPrice?: boolean;
}

export function AdAutocomplete({
  value,
  selectedTitle,
  onChange,
  onClear,
  searchFn,
  error,
  disabled,
  placeholder,
  noResultsText,
  icon,
  showDiscountedPrice = false,
}: AdAutocompleteProps) {
  const t = useTranslations("common");
  const locale = useLocale();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<AdSearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(locale, {
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Get image URL - supports imageUrl, thumbnail, or files array
  const getImageUrl = (ad: AdSearchResult) => {
    if (ad.imageUrl) return ad.imageUrl;
    if (ad.thumbnail) return `${apiUrl}/api/files/${ad.thumbnail}`;
    if (ad.files && ad.files.length > 0) {
      const defaultFile = ad.files.find((f) => f.isDefault) || ad.files[0];
      return `${apiUrl}/api/files/${defaultFile.path}`;
    }
    return null;
  };

  // Search for ads
  const searchAds = useCallback(async (query: string) => {
    setIsLoading(true);
    try {
      const data = await searchFn(query);
      setResults(data);
    } catch (err) {
      console.error("Error searching ads:", err);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchFn]);

  // Debounced search - only call API when user types something
  useEffect(() => {
    if (!isOpen || !search.trim()) {
      setResults([]);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchAds(search);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [search, searchAds, isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (ad: AdSearchResult) => {
    onChange(ad.id, ad.title);
    setSearch("");
    setIsOpen(false);
    setResults([]);
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      onChange("", "");
    }
    setSearch("");
    setResults([]);
  };

  const IconComponent = icon || <Package className="w-5 h-5 text-primary flex-shrink-0" />;

  // If we have a selected value, show it
  if (value && selectedTitle) {
    return (
      <div className="relative" ref={containerRef}>
        <div
          className={`flex items-center gap-3 p-3 rounded-xl border-2 ${
            error ? "border-red-300 bg-red-50/50" : "border-primary/30 bg-primary/5"
          } ${disabled ? "opacity-60" : ""}`}
        >
          {IconComponent}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-neutral-900 truncate">
              {selectedTitle}
            </p>
            <p className="text-xs text-neutral-500">
              ID: {value}
            </p>
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-neutral-200 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-neutral-500" />
            </button>
          )}
        </div>
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </div>
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder || t("search")}
          disabled={disabled}
          className={`w-full pl-10 pr-10 py-2.5 border-2 rounded-xl bg-white transition-colors ${
            error
              ? "border-red-300 focus:border-red-400"
              : "border-neutral-200 focus:border-primary"
          } focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed`}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 animate-spin" />
        )}
      </div>

      {/* Error message */}
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
          {/* Show hint to type when no search query */}
          {!search.trim() && !isLoading && (
            <div className="p-4 text-center text-neutral-400 text-sm">
              {t("typeToSearch")}
            </div>
          )}

          {/* Show no results only when user has searched */}
          {search.trim() && results.length === 0 && !isLoading && (
            <div className="p-4 text-center text-neutral-500 text-sm">
              {noResultsText || t("noResults")}
            </div>
          )}

          {results.map((ad) => {
            const imageUrl = getImageUrl(ad);

            return (
              <button
                key={ad.id}
                type="button"
                onClick={() => handleSelect(ad)}
                className="w-full flex items-center gap-3 p-3 hover:bg-neutral-50 transition-colors text-left border-b last:border-b-0"
              >
                {/* Thumbnail */}
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                  {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageUrl}
                      alt={ad.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-6 h-6 text-neutral-400" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-neutral-900 truncate">
                    {ad.title}
                  </p>
                  {ad.price === null ? (
                    <p className="text-sm text-neutral-500 italic">
                      {t("priceOnRequest")}
                    </p>
                  ) : showDiscountedPrice && ad.discountedPrice ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-neutral-400 line-through">
                        {formatPrice(ad.price)} FCFA
                      </span>
                      <span className="text-sm text-red-600 font-semibold">
                        {formatPrice(ad.discountedPrice)} FCFA
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm text-primary font-semibold">
                      {formatPrice(ad.price)} FCFA
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
