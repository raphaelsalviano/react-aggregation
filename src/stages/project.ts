import { DefaultObject, PipelineStage } from '../types';

export async function projectStage(
  collection: DefaultObject[],
  pipeline: PipelineStage
) {
  return collection?.map((item) => {
    for (const [key, value] of Object.entries(pipeline)) {
      if (value || typeof value === 'string')
        throw new Error('Includes operation not implemented');
      delete item[key];
    }
    return item;
  });
}
