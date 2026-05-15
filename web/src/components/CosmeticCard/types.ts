export const CosmeticRarity = {
  Consumer: 1,
  Industrial: 2,
  MilSpec: 3,
  Restricted: 4,
  Classified: 5,
  Covert: 6,
  Contraband: 7,
  Extraordinary: 8,
} as const;

export type CosmeticRarity =
  (typeof CosmeticRarity)[keyof typeof CosmeticRarity];

export type CosmeticType =
  | "weaponSkin"
  | "knifeSkin"
  | "gloves"
  | "agent"
  | "mvpEffect"
  | "badge"
  | "nameplate"
  | "profileTheme"
  | "skinPack";

export interface CosmeticCardProps {
  id: string;
  name: string;
  imageUrl: string;
  price?: number;
  rarity: CosmeticRarity;
  type: CosmeticType;
  onClick?: () => void;
}

export const cosmeticRarityMeta: Record<
  CosmeticRarity,
  {
    label: string;
    color: string;
  }
> = {
  [CosmeticRarity.Consumer]: {
    label: "Consumer Grade",
    color: "#B0C3D9",
  },
  [CosmeticRarity.Industrial]: {
    label: "Industrial Grade",
    color: "#5E98D9",
  },
  [CosmeticRarity.MilSpec]: {
    label: "Mil-Spec",
    color: "#4B69FF",
  },
  [CosmeticRarity.Restricted]: {
    label: "Restricted",
    color: "#8847FF",
  },
  [CosmeticRarity.Classified]: {
    label: "Classified",
    color: "#D32CE6",
  },
  [CosmeticRarity.Covert]: {
    label: "Covert",
    color: "#EB4B4B",
  },
  [CosmeticRarity.Contraband]: {
    label: "Contraband",
    color: "#E4AE39",
  },
  [CosmeticRarity.Extraordinary]: {
    label: "Extraordinary",
    color: "#FFD700",
  },
};

export const cosmeticTypeLabels: Record<CosmeticType, string> = {
  weaponSkin: "Weapon Skin",
  knifeSkin: "Knife Skin",
  gloves: "Gloves",
  agent: "Agent",
  mvpEffect: "MVP Effect",
  badge: "Badge",
  nameplate: "Nameplate",
  profileTheme: "Profile Theme",
  skinPack: "Skin Pack",
};
