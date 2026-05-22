import { useEffect, useState } from "react";

export function useIsMobileNavbar() {
  const [isMobileNavbar, setIsMobileNavbar] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");

    function handleChange() {
      setIsMobileNavbar(mediaQuery.matches);
    }

    handleChange();
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return isMobileNavbar;
}
