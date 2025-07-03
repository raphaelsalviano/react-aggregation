import { DefaultObject } from '../types';

export async function skipStage(collection: DefaultObject[], pipeline: any) {
  if (typeof pipeline === 'number') {
    return collection.slice(pipeline);
  }

  throw new Error('$skip argument must be a positive number');
}
