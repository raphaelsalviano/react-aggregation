import { SUPPORTED_OPERATIONS } from '../constants';

export interface DatabaseAdapter {
  matchStage<T = DefaultObject>(
    collectionName: string,
    pipeline: PipelineStage
  ): Promise<T[]>;
}

export interface DatabaseRules {
  collections: string[];
}

export interface DatabaseConfig {
  defaultAdapter: DatabaseAdapter;
  rules: DatabaseRules;
}

export type DefaultObject = Record<string, any>;

export type PipelineStage = Record<string, any>;
export type AggregationPipeline = PipelineStage[];

export type OperationsObject = {
  [operation in (typeof SUPPORTED_OPERATIONS)[number]]: (
    collection: any,
    expression: any
  ) => any;
};
