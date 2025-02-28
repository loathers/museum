import { IconButton } from "@chakra-ui/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { LuMoon, LuSun } from "react-icons/lu";

function useColorMode() {
  const { resolvedTheme, setTheme } = useTheme();
  const toggleColorMode = () => {
    setTheme(resolvedTheme === "light" ? "dark" : "light");
  };
  return {
    colorMode: resolvedTheme,
    setColorMode: setTheme,
    toggleColorMode,
  };
}

export function ColourModeToggle() {
  const [mounted, setMounted] = useState(false);
  const { toggleColorMode, colorMode } = useColorMode();

  useEffect(() => setMounted(true), []);

  if (!mounted) return <IconButton loading={true} />;

  return (
    <IconButton
      onClick={toggleColorMode}
      title={
        colorMode === "light" ? "Switch to dark mode" : "Switch to light mode"
      }
    >
      {colorMode === "light" ? <LuSun /> : <LuMoon />}
    </IconButton>
  );
}
