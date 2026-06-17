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
  secondary: "border border-leaf/40 text-leaf hover:border-leaf hover:text-white",
  ghost:     "border border-[#2a2c28] text-stone hover:text-white hover:border-stone",
  danger:    "bg-red-900/30 border border-red-900/40 text-red-300 hover:bg-red-900/50",
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
        "rounded-lg font-medium transition-colors duration-200 cursor-pointer",
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
