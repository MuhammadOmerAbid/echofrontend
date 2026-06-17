"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

interface NavbarProps {
  transparent?: boolean;
  showAdmin?: boolean;
}

export default function Navbar({ transparent = false, showAdmin = true }: NavbarProps) {
  const pathname = usePathname();
  const onSubmit = pathname === "/submit";

  return (
    <nav
      className={clsx(
        "flex items-center justify-between px-8 py-4 z-50",
        transparent
          ? "fixed top-0 left-0 right-0 bg-ink/80 backdrop-blur-xl border-b border-white/[0.05]"
          : "sticky top-0 bg-ink border-b border-white/[0.06]"
      )}
    >
      <Link href="/" className="font-serif italic text-white text-xl">
        <span className="text-sage2">Ec</span>ho
      </Link>

      <div className="hidden md:flex items-center gap-7">
        {(transparent ? [
          { href: "#how-it-works", label: "How It Works" },
          { href: "#features",     label: "Features"     },
          { href: "#about",        label: "About"        },
          { href: "#track",        label: "Track"        },
        ] : [
          { href: "/",        label: "Home"   },
          { href: "/#about",  label: "About"  },
          { href: "/#track",  label: "Track"  },
          { href: "/submit",  label: "Submit" },
        ]).map(({ href, label }) => (
          <a
            key={href}
            href={href}
            className={clsx(
              "text-sm transition-colors",
              pathname === href || (href === "/submit" && onSubmit)
                ? "text-sage2 font-medium"
                : "text-stone hover:text-white"
            )}
          >
            {label}
          </a>
        ))}
      </div>

      <div className="flex items-center gap-4">
        {showAdmin && (
          <Link
            href="/admin/login"
            className="text-stone text-sm hover:text-white transition-colors hidden sm:block"
          >
            Admin
          </Link>
        )}
        {!onSubmit && (
          <Link
            href="/submit"
            className="bg-sage hover:bg-sage2 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors duration-200"
          >
            Submit →
          </Link>
        )}
      </div>
    </nav>
  );
}
