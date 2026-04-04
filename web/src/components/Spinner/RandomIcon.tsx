import { useState } from "react";

import c4 from "./icons/c4.svg?react";
import carePackage from "./icons/care_package.svg?react";
import chatwheelSorry from "./icons/chatwheel_sorry.svg?react";
import chatwheelThanks from "./icons/chatwheel_thanks.svg?react";
import ctLogo from "./icons/ct_logo_1c.svg?react";
import ctSilhouette from "./icons/ct_silhouette.svg?react";
import incgrenade from "./icons/incgrenade.svg?react";
import kill from "./icons/kill.svg?react";
import molotov from "./icons/molotov.svg?react";
import tLogo from "./icons/t_logo_1c.svg?react";

type IconProps = React.SVGProps<SVGSVGElement>;
type IconComponent = React.ComponentType<IconProps>;

const icons: IconComponent[] = [
  c4,
  carePackage,
  chatwheelSorry,
  chatwheelThanks,
  ctLogo,
  ctSilhouette,
  incgrenade,
  kill,
  molotov,
  tLogo,
];

function getRandomIcon(): IconComponent {
  return icons[Math.floor(Math.random() * icons.length)];
}

export function useRandomSpinnerIcon(): IconComponent {
  const [Icon] = useState<IconComponent>(() => getRandomIcon());
  return Icon;
}
