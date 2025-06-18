import { DefaultObject } from '../types';

export function executeExpression(collection: DefaultObject[], path: string) {
  const result: DefaultObject[] = [];
  collection.forEach((item) => {
    const fieldValues = item[path.slice(1)];
    if (fieldValues) {
      if (Array.isArray(fieldValues)) {
        fieldValues.forEach((value) => {
          result.push({ ...item, [path.slice(1)]: value });
        });
      } else {
        result.push({ ...item, [path.slice(1)]: fieldValues });
      }
    }
  });
  return result;
}
