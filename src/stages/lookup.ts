import { DatabaseConfig, DefaultObject, PipelineStage } from '../types';
import aggregate from '../aggregation';

export async function lookupStage(
  collection: DefaultObject[],
  pipeline: PipelineStage,
  configs: DatabaseConfig[]
) {
  return await Promise.all(
    collection.map(async (item) => {
      const {
        from,
        as,
        localField,
        foreignField,
        pipeline: customPipeline
      } = pipeline;

      const localFieldSplit: string[] = localField.split('.');
      let localFieldValue: any;

      for (let i = 0; i < localFieldSplit.length; i++) {
        if (i === 0) {
          if (Array.isArray(item?.[localFieldSplit[i]])) {
            localFieldValue = item?.[localFieldSplit[i]]?.[0];
          } else {
            localFieldValue = item?.[localFieldSplit[i]];
          }
        } else {
          localFieldValue = localFieldValue?.[localFieldSplit[i]];
        }
      }

      const internalPipeline = [
        {
          $match: {
            ...customPipeline[0]['$match'],
            [foreignField]: localFieldValue
          }
        }
      ];

      const result = await aggregate(from, internalPipeline, configs);

      return { ...item, [as]: result } as DefaultObject;
    })
  );
}
