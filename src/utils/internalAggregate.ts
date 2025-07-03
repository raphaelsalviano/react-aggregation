import { AggregationPipeline, DefaultObject } from '../types';
import { countStage } from '../stages/count';

export async function internalAggregate(
  collection: DefaultObject[],
  aggregationPipeline: AggregationPipeline
) {
  let resultCollection = collection;

  for (const aggregation of aggregationPipeline) {
    for (const stage in aggregation) {
      switch (stage) {
        case '$sort':
          break;
        case '$count':
          resultCollection = await countStage(
            resultCollection,
            aggregation[stage]
          );
          break;
        case '$limit':
          break;
        case '$skip':
          break;
        default:
          throw new Error(
            `The stage ${stage} has no implemented in aggregateInternal method`
          );
      }
    }
  }

  return resultCollection;
}
