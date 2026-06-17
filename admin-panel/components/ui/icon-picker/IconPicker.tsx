"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Search, X } from "lucide-react";
import { searchIcons, getIconByName } from "./lucide-icons";

interface IconPickerProps {
  value: string | null;
  onChange: (iconName: string | null) => void;
  label?: string;
  error?: string;
}

export function IconPicker({ value, onChange, label, error }: IconPickerProps) {
  const t = useTranslations("categories.form");
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setResults(searchIcons(query, 40));
    }, 150);
    return () => clearTimeout(timer);
  }, [query]);

  // Initialize results when opening
  useEffect(() => {
    if (isOpen && !query) {
      setResults(searchIcons("", 40));
    }
  }, [isOpen, query]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = useCallback((iconName: string) => {
    onChange(iconName);
    setQuery("");
    setIsOpen(false);
  }, [onChange]);

  const handleClear = useCallback(() => {
    onChange(null);
    setQuery("");
  }, [onChange]);

  const SelectedIcon = value ? getIconByName(value) : null;

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}

      <div ref={containerRef} className="relative">
        {/* Input with selected icon preview */}
        <div
          className={`flex items-center gap-2 px-3 py-2.5 border-2 rounded-xl bg-white transition-colors cursor-text ${
            error
              ? "border-red-300 focus-within:border-red-400"
              : isOpen
              ? "border-primary"
              : "border-neutral-200 focus-within:border-primary"
          }`}
          onClick={() => {
            setIsOpen(true);
            inputRef.current?.focus();
          }}
        >
          {/* Selected icon preview */}
          {SelectedIcon && !isOpen ? (
            <div className="flex items-center gap-2 flex-1">
              <div className="w-8 h-8 flex items-center justify-center bg-neutral-100 rounded-lg">
                <SelectedIcon className="w-5 h-5 text-neutral-700" />
              </div>
              <span className="text-sm text-neutral-700">{value}</span>
            </div>
          ) : (
            <>
              <Search className="w-4 h-4 text-neutral-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                placeholder={t("iconPlaceholder")}
                className="flex-1 outline-none text-sm bg-transparent"
              />
            </>
          )}

          {/* Clear button */}
          {value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="p-1 hover:bg-neutral-100 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-neutral-500" />
            </button>
          )}
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div
            className="absolute z-50 w-full mt-2 bg-white border border-neutral-200 rounded-xl shadow-lg"
            style={{ maxHeight: "280px", overflowY: "auto" }}
          >
            {results.length === 0 ? (
              <div className="p-4 text-center text-sm text-neutral-500">
                {t("iconNoResults")}
              </div>
            ) : (
              <div className="p-2 grid grid-cols-4 gap-1">
                {results.map((iconName) => {
                  const IconComponent = getIconByName(iconName);
                  if (!IconComponent) return null;

                  return (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => handleSelect(iconName)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                        value === iconName
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-neutral-100"
                      }`}
                      title={iconName}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span className="text-xs truncate w-full text-center">
                        {iconName.length > 8 ? iconName.slice(0, 8) + "..." : iconName}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
