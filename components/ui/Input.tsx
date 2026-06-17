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
        <label className="text-[10px] uppercase tracking-widest text-stone block mb-2">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={clsx(
          "w-full bg-[#161816] border text-white text-sm px-4 py-3 rounded-lg",
          "focus:outline-none focus:border-sage transition-colors",
          "placeholder:text-[#3a3c38]",
          error ? "border-red-900/60" : "border-[#2a2c28]",
          className
        )}
        {...props}
      />
      {error && <p className="text-red-400 text-[11px] mt-1">{error}</p>}
      {hint && !error && <p className="text-stone text-[11px] mt-1">{hint}</p>}
    </div>
  )
);

Input.displayName = "Input";
export default Input;
