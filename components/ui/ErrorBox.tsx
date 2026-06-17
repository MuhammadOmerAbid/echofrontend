import { clsx } from "clsx";

interface ErrorBoxProps {
  message: string;
  className?: string;
}

export default function ErrorBox({ message, className }: ErrorBoxProps) {
  return (
    <div
      className={clsx(
        "bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl font-light",
        className
      )}
    >
      {message}
    </div>
  );
}
