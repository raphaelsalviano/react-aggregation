import { DefaultObject, PipelineStage } from '../types';
import { internalAggregate } from '../utils/internalAggregate';

export async function facetStage(
  collection: DefaultObject[],
  pipeline: PipelineStage
) {
  const objResult: any = {};

  for (const [key, value] of Object.entries(pipeline)) {
    objResult[key] = await internalAggregate(collection, value);
  }

  return [objResult] as DefaultObject[];
}
