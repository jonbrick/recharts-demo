"use client";

import { useTheme } from "next-themes";
import { Button } from "./Button";
import { RiSunFill, RiMoonFill, RiComputerFill } from "@remixicon/react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const getIcon = () => {
    switch (theme) {
      case "light":
        return <RiSunFill className="h-4 w-4" />;
      case "dark":
        return <RiMoonFill className="h-4 w-4" />;
      default:
        return <RiComputerFill className="h-4 w-4" />;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case "light":
        return "Light";
      case "dark":
        return "Dark";
      default:
        return "System";
    }
  };

  return (
    <Button
      variant="secondary"
      onClick={toggleTheme}
      className="flex items-center gap-2"
    >
      {getIcon()}
      <span className="hidden sm:inline">{getLabel()}</span>
    </Button>
  );
}
