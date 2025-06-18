import { DefaultObject } from '../types';

export async function limitStage(collection: DefaultObject[], pipeline: any) {
  if (typeof pipeline === 'number') {
    return collection.slice(0, pipeline);
  }

  throw new Error('$limit argument must be a positive number');
}
