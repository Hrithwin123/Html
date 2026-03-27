import { LucideIcon } from "lucide-react";

export interface NavigationItem {
  title: string;
  icon: LucideIcon;
  href: string;
  description?: string;
  onClick?: () => void;
}

export interface HeroContent {
  title: string;
  subtitle: string;
  highlight: string;
  description: string;
  cta: string;
}

export interface AnimationConfig {
  duration?: number;
  delay?: number;
  ease?: string;
}