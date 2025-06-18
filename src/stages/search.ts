import { DefaultObject, PipelineStage } from '../types';
import sift from 'sift';

export async function searchStage(
  collection: DefaultObject[],
  pipeline: PipelineStage
) {
  return collection.filter(sift(pipeline));
}
