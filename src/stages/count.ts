import { DefaultObject } from '../types';

export async function countStage(collection: DefaultObject[], pipeline: any) {
  if (!pipeline || typeof pipeline !== 'string')
    throw new Error('Invalid pipeline');

  return [{ [pipeline]: collection.length }];
}
