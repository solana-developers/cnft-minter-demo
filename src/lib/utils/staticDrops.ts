import { STATIC_DROP_KEYS, StaticDropKey } from "@/lib/constants/staticDrops";

/**
 * Temporary helper function for static drop keys
 * todo: this will be removed when there is a database
 */
export function locateStaticDrop(dropKey: string): Option<StaticDropKey> {
  return STATIC_DROP_KEYS.filter(
    (item: StaticDropKey) =>
      item.key.toLocaleLowerCase() == dropKey.toLocaleLowerCase(),
  )?.[0];
}
