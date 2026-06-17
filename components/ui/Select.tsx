"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown } from "lucide-react";

interface SelectProps {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
}

export default function Select({
  label, error, options, placeholder = "Select…",
  value, onChange, disabled,
}: SelectProps) {
  const [open, setOpen]   = useState(false);
  const [focused, setFoc] = useState(-1);
  const containerRef      = useRef<HTMLDivElement>(null);
  const listRef           = useRef<HTMLDivElement>(null);

  const close = useCallback(() => { setOpen(false); setFoc(-1); }, []);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) close();
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [close]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen((o) => !o); }
    if (e.key === "Escape") close();
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setFoc((f) => Math.min(f + 1, options.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setFoc((f) => Math.max(f - 1, 0)); }
    if (e.key === "Enter" && focused >= 0) { onChange(options[focused].value); close(); }
  }

  useEffect(() => {
    if (focused >= 0 && listRef.current) {
      const el = listRef.current.children[focused] as HTMLElement;
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [focused]);

  const selected = options.find((o) => o.value === value);

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label className="text-[10px] uppercase tracking-widest text-stone block mb-2 font-medium">
          {label}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setOpen((o) => !o)}
          onKeyDown={onKeyDown}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={[
            "w-full bg-white text-sm px-4 py-3 rounded-xl text-left",
            "flex items-center justify-between gap-2 border outline-none",
            "transition-colors duration-150",
            disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
            error      ? "border-red-400"
            : open     ? "border-sage"
            : "border-black/10 hover:border-black/[0.18]",
          ].join(" ")}
        >
          <span className={["truncate", selected ? "text-ink" : "text-stone/50"].join(" ")}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown
            size={14}
            className={[
              "shrink-0 text-stone transition-transform duration-200",
              open ? "rotate-180" : "",
            ].join(" ")}
          />
        </button>

        {open && (
          <div
            ref={listRef}
            role="listbox"
            className="echo-dropdown absolute z-50 top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-black/[0.09] py-1 overflow-y-auto"
            style={{
              maxHeight: 216,
              boxShadow: "0 8px 24px rgba(0,0,0,0.09), 0 2px 8px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.04)",
              scrollbarWidth: "thin",
              scrollbarColor: "#d8d3ca transparent",
            }}
          >
            {options.map((o, i) => {
              const active  = o.value === value;
              const hovered = i === focused;
              return (
                <button
                  key={o.value}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onMouseEnter={() => setFoc(i)}
                  onMouseLeave={() => setFoc(-1)}
                  onClick={() => { onChange(o.value); close(); }}
                  className="w-full text-left px-4 py-2.5 text-sm transition-colors"
                  style={{
                    color: active ? "#e8580a" : "#111210",
                    fontWeight: active ? 600 : 400,
                    background: active
                      ? "rgba(232,88,10,0.06)"
                      : hovered
                      ? "rgba(0,0,0,0.035)"
                      : "transparent",
                  }}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {error && <p className="text-red-600 text-[11px] mt-1">{error}</p>}
    </div>
  );
}
