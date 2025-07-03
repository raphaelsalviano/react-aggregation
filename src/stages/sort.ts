import { DefaultObject, PipelineStage } from '../types';
import { extractValueToObject } from '../utils/extractValueToObject';

export async function sortStage(
  collection: DefaultObject[],
  pipeline: PipelineStage
) {
  const field = Object.keys(pipeline)[0];
  const order = pipeline[field];

  const ascendingOrder = (a: any, b: any): number => {
    if (extractValueToObject(field, a) < extractValueToObject(field, b)) {
      return -1;
    }
    if (extractValueToObject(field, a) > extractValueToObject(field, b)) {
      return 1;
    }
    return 0;
  };

  const descendingOrder = (a: any, b: any): number => {
    if (extractValueToObject(field, a) > extractValueToObject(field, b)) {
      return -1;
    }
    if (extractValueToObject(field, a) < extractValueToObject(field, b)) {
      return 1;
    }
    return 0;
  };

  return collection.sort(
    order > 0 ? ascendingOrder : descendingOrder
  ) as DefaultObject[];
}
