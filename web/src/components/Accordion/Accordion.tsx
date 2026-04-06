import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { AccordionProps } from "./types";
import { MdArrowDropDown } from "react-icons/md";

export function Accordion({ children, label }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ height: "32px" }}
      animate={{ height: isOpen ? "auto" : "32px" }}
      className="flex flex-col gap-2 rounded-xl border border-primary/20 bg-black/20 relative"
    >
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className="pl-8 min-h-8 text-left text-sm font-medium"
      >
        {label}
      </button>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.div
        initial={{ rotate: 0 }}
        animate={{ rotate: isOpen ? 180 : 0 }}
        className="pointer-events-none absolute top-0 left-0 grid place-items-center w-8 h-8"
      >
        <MdArrowDropDown size={32} />
      </motion.div>
    </motion.div>
  );
}
