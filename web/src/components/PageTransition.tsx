import type { PropsWithChildren } from "react";
import { motion } from "motion/react";
import { springTransition } from "../lib/transitions";

export function PageTransition({ children }: PropsWithChildren) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
      animate={{
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: springTransition,
      }}
      exit={{
        opacity: 0,
        y: -12,
        filter: "blur(6px)",
        transition: {
          duration: 0.06,
          ease: "easeIn",
        },
      }}
      className="w-full will-change-transform will-change-opacity"
    >
      {children}
    </motion.div>
  );
}
