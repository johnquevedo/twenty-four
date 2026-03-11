"use client";

import { useEffect, useMemo, useState } from "react";
import { ThemePreference } from "@/lib/game/types";

function getSystemTheme(): Exclude<ThemePreference, "system"> {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function useTheme(themePreference: ThemePreference) {
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">(getSystemTheme);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const update = () => {
      setSystemTheme(media.matches ? "dark" : "light");
    };

    update();
    media.addEventListener("change", update);

    return () => {
      media.removeEventListener("change", update);
    };
  }, []);

  const activeTheme = useMemo(
    () => (themePreference === "system" ? systemTheme : themePreference),
    [systemTheme, themePreference],
  );

  useEffect(() => {
    document.documentElement.dataset.theme = activeTheme;
  }, [activeTheme]);

  return activeTheme;
}
