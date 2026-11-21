const AVAILABILITY_BY_ORIGIN = {
  "0": "availableInUsa",
  "1": "availableInNigeria",
  "2": "availableInUk",
  "3": "availableInCanada",
} as const;

export const REGION_NAME_BY_ORIGIN: Record<string, string> = {
  "0": "the United States",
  "1": "Nigeria",
  "2": "the United Kingdom",
  "3": "Canada",
};

type AvailabilityKey = (typeof AVAILABILITY_BY_ORIGIN)[keyof typeof AVAILABILITY_BY_ORIGIN];

export type RegionAvailability = Partial<Record<AvailabilityKey, boolean | string | null>>;

function flagIsAvailable(flag: boolean | string | null | undefined): boolean {
  if (flag == null) return true;
  if (flag === true || flag === "true") return true;
  if (flag === false || flag === "false") return false;
  return true;
}

/** True when the product can be sold in the shopper's selected store region. */
export function isAvailableInShopperRegion(
  product: RegionAvailability | null | undefined,
  sourceOrigin: string | null | undefined
): boolean {
  const key = sourceOrigin ? AVAILABILITY_BY_ORIGIN[sourceOrigin as keyof typeof AVAILABILITY_BY_ORIGIN] : undefined;
  if (!key || !product) return true;
  return flagIsAvailable(product[key]);
}
