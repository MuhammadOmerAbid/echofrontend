"use client";

import { TextareaHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  charCount?: number;
  maxChars?: number;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, charCount, maxChars, className, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="text-[10px] uppercase tracking-widest text-stone block mb-2 font-medium">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={clsx(
          "w-full bg-white border text-ink text-sm px-4 py-3 rounded-xl",
          "focus:outline-none focus:border-sage transition-colors resize-none",
          "placeholder:text-stone/60 font-light leading-relaxed",
          error ? "border-red-400" : "border-black/10",
          className
        )}
        {...props}
      />
      {(maxChars !== undefined || error) && (
        <div className="flex justify-between mt-1">
          {error ? <p className="text-red-600 text-[11px]">{error}</p> : <span />}
          {maxChars !== undefined && (
            <p className="text-[10px] text-stone">
              {maxChars - (charCount ?? 0)} chars remaining
            </p>
          )}
        </div>
      )}
    </div>
  )
);

Textarea.displayName = "Textarea";
export default Textarea;
