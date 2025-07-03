import {
  AggregationPipeline,
  DatabaseAdapter,
  DatabaseConfig,
  DefaultObject
} from '../types';

import { lookupStage } from '../stages/lookup';
import { addFieldsStage } from '../stages/addFields';
import { countStage } from '../stages/count';
import { facetStage } from '../stages/facet';
import { groupStage } from '../stages/group';
import { limitStage } from '../stages/limit';
import { projectStage } from '../stages/project';
import { replaceRootStage } from '../stages/replaceRoot';
import { searchStage } from '../stages/search';
import { skipStage } from '../stages/skip';
import { sortStage } from '../stages/sort';
import { unwindStage } from '../stages/unwind';

export default async function aggregate<T = DefaultObject>(
  collectionName: string,
  aggregationPipeline: AggregationPipeline,
  configs: DatabaseConfig[]
) {
  if (!configs || configs.length === 0) {
    throw new Error('No database config found');
  }

  let collection = [] as DefaultObject[];
  let databaseAdapterMatchStage: DatabaseAdapter;

  for (const config of configs) {
    if (config.rules.collections.includes(collectionName)) {
      databaseAdapterMatchStage = config.defaultAdapter;
    }
  }

  for (const pipeline of aggregationPipeline) {
    // @ts-ignore
    for (const stage of pipeline) {
      switch (stage) {
        case '$addFields':
          collection = await addFieldsStage(collection, pipeline[stage]);
          break;
        case '$count':
          collection = await countStage(collection, pipeline[stage]);
          break;
        case '$facet':
          collection = await facetStage(collection, pipeline[stage]);
          break;
        case '$group':
          collection = await groupStage(collection, pipeline[stage]);
          break;
        case '$match':
          collection = await databaseAdapterMatchStage!.matchStage(
            collectionName,
            pipeline[stage]
          );
          break;
        case '$limit':
          collection = await limitStage(collection, pipeline[stage]);
          break;
        case '$lookup':
          collection = await lookupStage(collection, pipeline[stage], configs);
          break;
        case '$project':
          collection = await projectStage(collection, pipeline[stage]);
          break;
        case '$replaceRoot':
          collection = await replaceRootStage(collection, pipeline[stage]);
          break;
        case '$search':
          collection = await searchStage(collection, pipeline[stage]);
          break;
        case '$skip':
          collection = await skipStage(collection, pipeline[stage]);
          break;
        case '$sort':
          collection = await sortStage(collection, pipeline[stage]);
          break;
        case '$unwind':
          collection = await unwindStage(collection, pipeline[stage]);
          break;
        default:
          throw new Error(`The stage ${stage}  has not implemented`);
      }
    }
  }

  return collection as T[];
}
