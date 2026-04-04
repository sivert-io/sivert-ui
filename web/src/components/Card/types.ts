import type React from "react";

export interface CardProps extends React.ComponentProps<"div"> {
  children: React.ReactNode;
}
