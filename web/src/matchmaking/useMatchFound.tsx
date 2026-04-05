import { useContext } from "react";
import { MatchFoundContext } from "./MatchFoundContext";

export function useMatchFound() {
  const context = useContext(MatchFoundContext);

  if (!context) {
    throw new Error("useMatchFound must be used within MatchFoundProvider");
  }

  return context;
}
