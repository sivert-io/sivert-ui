import type React from "react";

export interface ModalProps {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: (open: boolean) => void;
}
