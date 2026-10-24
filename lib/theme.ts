import type { Theme } from "./types";

export const THEME_COLORS: Record<Theme, string> = {
  light: "#ffffff",
  dark: "#000000",
};

export function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;

  const themeColor = THEME_COLORS[theme];
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", themeColor);

  const statusBar = document.querySelector(
    'meta[name="apple-mobile-web-app-status-bar-style"]',
  );
  if (statusBar) {
    statusBar.setAttribute(
      "content",
      theme === "dark" ? "black-translucent" : "default",
    );
  }
}

export function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "light";
  try {
    const raw = window.localStorage.getItem("timer:prefs");
    if (!raw) return "light";
    const parsed = JSON.parse(raw) as { theme?: Theme };
    return parsed.theme === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}
