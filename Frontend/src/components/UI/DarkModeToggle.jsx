import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const DarkModeToggle = () => {
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) return savedTheme === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation(); // ✅ prevent dropdown from closing immediately
        setIsDark(!isDark);
      }}
      className="w-full flex items-center gap-2 px-4 py-2 rounded-lg 
                 hover:bg-gray-100 dark:hover:bg-gray-700  text-black dark:text-white transition-all"
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
      <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
    </button>
  );
};

export default DarkModeToggle;
