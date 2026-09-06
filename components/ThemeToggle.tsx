"use client";

import { useThemeStore } from "@/store/themeStore";

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();
  const next = theme === "light" ? "dark" : "light";
  return (
    <button
      type="button"
      className="icon-btn"
      onClick={toggleTheme}
      aria-label={next === "dark" ? "Switch to dark mode" : "Switch to light mode"}
    >
      {theme === "light" ? "☾" : "☀"}
    </button>
  );
}
