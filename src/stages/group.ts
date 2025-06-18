import { DefaultObject, PipelineStage } from '../types';
import { extractIdentifier } from '../utils/extractIdentifier';
import { executeOperation } from '../operations';

export async function groupStage(
  collection: DefaultObject[],
  pipeline: PipelineStage
) {
  const results: { [key: string]: any }[] = [];
  const { _id, ...groupFields } = pipeline;

  for (const item of collection) {
    const identifier = extractIdentifier(_id, item);
    const currentItem = results.find((result) => result._id === identifier);

    if (!currentItem) {
      results.push({
        _id: identifier,
        __originalItem: [item]
      });
    } else {
      currentItem.__originalItem.push(item);
    }
  }
  for (const [fieldName, accumulatorObject] of Object.entries(groupFields)) {
    for (const group of results) {
      group[fieldName] = executeOperation(
        accumulatorObject,
        group.__originalItem
      );
    }
  }
  results.forEach((result) => delete result.__originalItem);
  return results;
}
