export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export const tokens = {
  background: "hsl(var(--background))",
  foreground: "hsl(var(--foreground))",
  primary: "hsl(var(--primary))",
  primaryForeground: "hsl(var(--primary-foreground))",
  muted: "hsl(var(--muted))",
  mutedForeground: "hsl(var(--muted-foreground))",
} 