import { createContext } from "react";
import type { MatchFoundState } from "./types";

type MatchFoundContextValue = {
  matchFound: MatchFoundState;
  acceptMatch: () => void;
  declineMatch: () => void;
};

export const MatchFoundContext = createContext<MatchFoundContextValue | null>(
  null,
);
