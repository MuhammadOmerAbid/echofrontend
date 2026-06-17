"use client";

import { InputHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="text-[10px] uppercase tracking-widest text-stone block mb-2 font-medium">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={clsx(
          "w-full bg-white border text-ink text-sm px-4 py-3 rounded-xl",
          "focus:outline-none focus:border-sage transition-colors",
          "placeholder:text-stone/60",
          error ? "border-red-400" : "border-black/10",
          className
        )}
        {...props}
      />
      {error && <p className="text-red-600 text-[11px] mt-1">{error}</p>}
      {hint && !error && <p className="text-stone text-[11px] mt-1">{hint}</p>}
    </div>
  )
);

Input.displayName = "Input";
export default Input;
