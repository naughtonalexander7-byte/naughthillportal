"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/actions";

export type NavItem = { href: string; label: string };

export default function PortalShell({
  navItems,
  userLabel,
  roleLabel,
  children,
}: {
  navItems: NavItem[];
  userLabel: string;
  roleLabel: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen w-full">
      <aside className="flex w-64 shrink-0 flex-col border-r border-navy/10 bg-navy text-white">
        <div className="px-6 py-6">
          <Image
            src="/logo-white.png"
            alt="NaughtHill Group"
            width={500}
            height={113}
            className="h-auto w-36"
            priority
          />
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin" || item.href === "/dashboard"
                ? pathname === item.href
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3.5 py-2.5 font-heading text-sm font-semibold transition ${
                  isActive
                    ? "bg-green text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 px-6 py-5">
          <p className="truncate text-sm font-semibold text-white">
            {userLabel}
          </p>
          <p className="text-xs uppercase tracking-wide text-white/45">
            {roleLabel}
          </p>
          <form action={signOut} className="mt-3">
            <button
              type="submit"
              className="text-xs font-semibold text-white/60 hover:text-white"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 bg-grey-light px-8 py-8 md:px-12 md:py-10">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
