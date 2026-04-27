import type { ComponentType, SVGProps } from "react";
import {
  GithubMark,
  LeetcodeMark,
} from "@/features/integrations/components/brand-icons";
import type { Provider } from "@/features/integrations/server/queries";

type IconType = ComponentType<SVGProps<SVGSVGElement> & { className?: string }>;

export type ProviderMeta = {
  key: Provider;
  name: string;
  blurb: string;
  icon: IconType;
  // Tailwind classes for the icon tile (background tint + foreground tone).
  tileBg: string;
  tileFg: string;
};

export const PROVIDER_META: Record<Provider, ProviderMeta> = {
  GITHUB: {
    key: "GITHUB",
    name: "GitHub",
    blurb: "Track commits, pull requests, and coding hours",
    icon: GithubMark,
    tileBg: "bg-foreground/10",
    tileFg: "text-foreground",
  },
  LEETCODE: {
    key: "LEETCODE",
    name: "LeetCode",
    blurb: "Track problems solved, streaks, and difficulty",
    icon: LeetcodeMark,
    tileBg: "bg-kpi-orange/15",
    tileFg: "text-kpi-orange",
  },
};
