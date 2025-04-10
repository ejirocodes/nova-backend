import {
  prefixes,
  PrefixType,
} from 'src/common/api/interfaces/prefix.interface';
import { v7 as uuidv7 } from 'uuid';

/**
 * Generates a new prefixed identifier using UUID v4
 * @param prefix The prefix to use for the identifier
 * @returns A string in the format ⁠ prefix_uuid ⁠
 */
export function generateUniqueId<TPrefix extends PrefixType>(
  prefix: TPrefix,
): `${(typeof prefixes)[TPrefix]}_${string}` {
  const uuid = uuidv7().replace(/-/g, '').slice(0, 27);
  return `${prefixes[prefix]}_${uuid}` as const;
}
