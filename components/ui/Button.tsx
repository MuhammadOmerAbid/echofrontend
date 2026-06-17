"use client";

import { ButtonHTMLAttributes } from "react";
import { clsx } from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  loading?: boolean;
}

const VARIANTS = {
  primary:   "bg-sage text-white hover:bg-sage2 disabled:opacity-50",
  secondary: "border border-black/15 text-stone hover:border-sage hover:text-sage",
  ghost:     "border border-black/10 text-stone hover:text-ink hover:border-black/25",
  danger:    "bg-red-50 border border-red-200 text-red-700 hover:bg-red-100",
};

const SIZES = {
  sm: "text-[12px] px-4 py-2",
  md: "text-[13px] px-6 py-3",
  lg: "text-[13px] px-7 py-3.5",
};

export default function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={loading || disabled}
      className={clsx(
        "rounded-xl font-semibold transition-colors duration-200 cursor-pointer",
        VARIANTS[variant],
        SIZES[size],
        fullWidth && "w-full",
        (loading || disabled) && "cursor-not-allowed",
        className
      )}
      {...props}
    >
      {loading ? "Loading…" : children}
    </button>
  );
}
