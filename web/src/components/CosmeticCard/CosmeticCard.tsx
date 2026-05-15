import { Card } from "../Card";
import type { CosmeticCardProps } from "./types";
import { cosmeticRarityMeta } from "./types";

export function CosmeticCard({
  imageUrl,
  name,
  price,
  rarity,
  onClick,
}: CosmeticCardProps) {
  const rarityMeta = cosmeticRarityMeta[rarity];

  return (
    <Card
      onClick={onClick}
      className="flex h-full flex-col gap-3 rounded-lg border p-3 cursor-pointer"
      style={{ borderColor: rarityMeta.color }}
    >
      <div className="flex aspect-4/3 items-center justify-center rounded-md bg-primary/5 p-3">
        <img
          src={imageUrl}
          alt={name}
          className="max-h-full max-w-full object-contain"
          loading="lazy"
        />
      </div>

      <div className="flex flex-col gap-1">
        <p
          className="truncate text-base font-bold"
          style={{ color: rarityMeta.color }}
        >
          {name}
        </p>

        {typeof price === "number" ? (
          <p className="text-sm font-mono text-primary">
            {price.toLocaleString()}
          </p>
        ) : null}
      </div>
    </Card>
  );
}
