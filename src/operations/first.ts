import { DefaultObject } from '../types';

export function firstOperation(
  collection: DefaultObject[],
  expression: string
) {
  if (expression.toLowerCase().includes('root')) {
    return collection[0] as DefaultObject;
  }
  return collection[0][expression.slice(1)] as any;
}
