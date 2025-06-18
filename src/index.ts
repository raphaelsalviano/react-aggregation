import aggregate from './aggregation';
import * as Types from './types';

const ReactAggregation = aggregate;

export namespace ReactAggregation {
  export type AggregationPipeline = Types.AggregationPipeline;
  export type PipelineStage = Types.PipelineStage;
  export type DefaultObject = Types.DefaultObject;
  export type DatabaseAdapter = Types.DatabaseAdapter;
  export type DatabaseRules = Types.DatabaseRules;
  export type DatabaseConfig = Types.DatabaseConfig;
}

export * from './types';
export default ReactAggregation;
