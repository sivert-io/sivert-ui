import type { Transition } from "motion/react";

export const springTransition: Transition = {
  type: "spring",
  stiffness: 800,
  damping: 30,
};
