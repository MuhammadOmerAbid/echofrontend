import { clsx } from "clsx";

interface ErrorBoxProps {
  message: string;
  className?: string;
}

export default function ErrorBox({ message, className }: ErrorBoxProps) {
  return (
    <div
      className={clsx(
        "bg-red-900/20 border border-red-900/40 text-red-300 text-sm px-4 py-3 rounded-lg",
        className
      )}
    >
      {message}
    </div>
  );
}
