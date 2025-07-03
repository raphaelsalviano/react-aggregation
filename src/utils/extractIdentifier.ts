/**
 * Extracts and resolves an identifier from the provided input objects.
 *
 * @param {any} ideObj - The object containing an identifier key whose value will be processed.
 * @param {any} item - The object from which the resolved value is extracted based on the identifier path.
 * @return {any} The resolved identifier value from the item object, or undefined if the identifier is invalid or cannot be resolved.
 */
export function extractIdentifier(ideObj: any, item: any) {
  const identifier = Object.values(ideObj)[0] as string;

  if (!identifier || identifier.length == 0) {
    return undefined;
  }

  const split = identifier?.slice(1).split('.');
  let count: any;
  for (let i = 0; i < split.length; i++) {
    if (i > 0) {
      if (count) {
        if (Array.isArray(count[split[i]])) {
          count = count[split[i]]?.[0];
        } else {
          count = count[split[i]];
        }
      }
    } else {
      if (Array.isArray(item[split[i]])) {
        count = item[split[i]]?.[0];
      } else {
        count = item[split[i]];
      }
    }
  }
  return count;
}
