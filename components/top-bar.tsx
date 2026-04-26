import { cn } from "@/lib/utils";
import { UrlSearchInput } from "@/components/url-search-input";

type Props = {
  searchPlaceholder?: string;
  className?: string;
};

/**
 * Per-page right-side controls. Bell + UserButton live in the persistent
 * layout overlay (see <PersistentTopRight/>) so they don't re-mount on
 * every navigation.
 */
export function TopBar({ searchPlaceholder, className }: Props) {
  if (!searchPlaceholder) return null;
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <UrlSearchInput placeholder={searchPlaceholder} />
    </div>
  );
}
