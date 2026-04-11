import { useLayoutEffect } from "react";
import { useLocation } from "react-router";

export function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo({ behavior: "smooth", left: 0, top: 0 });
  }, [pathname]);

  return null;
}
