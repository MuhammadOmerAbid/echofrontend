"use client";

import { SelectHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="text-[10px] uppercase tracking-widest text-stone block mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={clsx(
            "w-full bg-[#161816] border text-white text-sm px-4 py-3 rounded-lg",
            "focus:outline-none focus:border-sage transition-colors appearance-none cursor-pointer",
            error ? "border-red-900/60" : "border-[#2a2c28]",
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-stone text-xs">
          ▾
        </span>
      </div>
      {error && <p className="text-red-400 text-[11px] mt-1">{error}</p>}
    </div>
  )
);

Select.displayName = "Select";
export default Select;
