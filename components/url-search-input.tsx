"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

/**
 * Search input that pushes `?q=...` into the URL with a 300ms debounce.
 * The page reads `searchParams.q` server-side to filter results.
 */
export function UrlSearchInput({ placeholder }: { placeholder: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const urlValue = sp.get("q") ?? "";
  const [value, setValue] = useState(urlValue);
  const [, start] = useTransition();

  // External URL change (e.g. clicking a filter chip) → reflect in input
  useEffect(() => {
    setValue(urlValue);
  }, [urlValue]);

  // User typing → debounced URL update
  useEffect(() => {
    if (value === urlValue) return;
    const id = setTimeout(() => {
      const params = new URLSearchParams(sp.toString());
      if (value) params.set("q", value);
      else params.delete("q");
      params.delete("page");
      const qs = params.toString();
      start(() =>
        router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false }),
      );
    }, 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="relative w-full max-w-[230px] sm:w-[230px]">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground-strong" />
      <Input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="bg-sidebar pl-9 text-[12.5px]"
      />
    </div>
  );
}
