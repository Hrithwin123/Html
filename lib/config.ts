export const siteConfig = {
  name: "Persona Labs",
  description: "Accelerate launches with AI audience simulations. Test product-market fit and refine messaging before spending a dollar.",
  url: "https://persona-labs.com",
  ogImage: "/og-image.png",
  links: {
    twitter: "https://twitter.com/persona-labs",
    github: "https://github.com/persona-labs",
    linkedin: "https://linkedin.com/company/persona-labs",
  },
  creator: "Persona Labs Team",
} as const;

export const navigationConfig = {
  showMobileMenu: true,
  showDesktopTooltips: true,
  animationDuration: 1000,
} as const;

export const animationConfig = {
  reducedMotion: false,
  defaultDuration: 0.5,
  defaultEasing: "easeOut",
} as const;