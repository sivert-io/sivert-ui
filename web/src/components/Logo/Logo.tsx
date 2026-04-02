import type { SVGProps } from "react";
import Flow from "./flow.svg?react";
import FlowSolid from "./flow_solid.svg?react";

type LogoProps = SVGProps<SVGSVGElement> & { solid?: boolean };

export function Logo({ className = "", solid, ...props }: LogoProps) {
  return solid ? (
    <FlowSolid className={`w-auto ${className}`} {...props} />
  ) : (
    <Flow className={`w-auto ${className}`} {...props} />
  );
}
