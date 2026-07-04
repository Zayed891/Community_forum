"use client";

import { useEffect, useRef, useState } from "react";

type Option<T> = { value: T; label: string };

type Props<T extends string | number> = {
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  prefix?: string;
  className?: string;
};

export function Dropdown<T extends string | number>({
  value,
  options,
  onChange,
  prefix,
  className,
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className={`relative ${className ?? ""}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-left text-sm text-gray-500"
      >
        {prefix && <span className="shrink-0">{prefix}</span>}
        <span className="truncate font-medium text-gray-900">{selected?.label}</span>
        <svg
          viewBox="0 0 24 24"
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ml-auto shrink-0 text-gray-400"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 z-20 mt-2 max-h-64 min-w-max overflow-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
        >
          {options.map((opt) => (
            <li key={String(opt.value)}>
              <button
                type="button"
                role="option"
                aria-selected={opt.value === value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`flex w-full cursor-pointer items-center justify-between gap-4 px-3 py-2 text-left text-sm whitespace-nowrap hover:bg-brand-light ${
                  opt.value === value ? "font-semibold text-brand-dark" : "text-gray-700"
                }`}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
