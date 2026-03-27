import { Home, MessageCircle, User, FileText, Rocket, LogOut } from "lucide-react";

export const NAVIGATION_ITEMS = [
  { 
    title: "Home", 
    icon: Home, 
    href: "/",
    description: "Return to homepage"
  },
  { 
    title: "About", 
    icon: FileText, 
    href: "/about",
    description: "Learn more about us"
  },
  { 
    title: "Join Us", 
    icon: User, 
    href: "/auth",
    description: "Sign up or login"
  },
  { 
    title: "Launch", 
    icon: Rocket, 
    href: "/main",
    description: "Start your simulation"
  },
  { 
    title: "Contact Us", 
    icon: MessageCircle, 
    href: "/contact-us",
    description: "Get in touch"
  },
];

export const AUTHENTICATED_NAVIGATION_ITEMS = [
  { 
    title: "Home", 
    icon: Home, 
    href: "/",
    description: "Return to homepage"
  },
  { 
    title: "About", 
    icon: FileText, 
    href: "/about",
    description: "Learn more about us"
  },
  { 
    title: "Launch", 
    icon: Rocket, 
    href: "/main",
    description: "Start your simulation"
  },
  { 
    title: "History", 
    icon: FileText, 
    href: "/jobs",
    description: "View past simulations"
  },
  { 
    title: "Contact Us", 
    icon: MessageCircle, 
    href: "/contact-us",
    description: "Get in touch"
  },
  { 
    title: "Sign Out", 
    icon: LogOut, 
    href: "#signout",
    description: "Sign out of your account"
  },
];

export const HERO_CONTENT = {
  title: "Persona Labs",
  subtitle: "Accelerate launches with",
  highlight: "AI audience simulations.",
  description: "Test product-market fit and refine messaging before spending a dollar.",
  cta: "Launch"
};

export const ANIMATION_DURATIONS = {
  fast: 0.3,
  medium: 0.5,
  slow: 1,
  textReveal: 4,
} as const;