import { DefaultObject } from '../types';

const propertiesSupportExpression = ['input', 'as', 'cond'];

export function filterOperation(collection: DefaultObject[], expression: any) {
  if (typeof expression !== 'object')
    throw new Error('Invalid expression object');

  for (const [key] of Object.entries(expression)) {
    if (!propertiesSupportExpression.includes(key))
      throw new Error('Unsupported property');
  }

  const { input } = expression;

  return (collection[input.slice(1)] as any)?.filter(
    (item: DefaultObject) => item
  ) as DefaultObject[];
}
