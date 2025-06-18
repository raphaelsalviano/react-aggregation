import { DefaultObject } from '../types';
import { executeExpression } from '../utils/executeExpression';

export async function unwindStage(collection: DefaultObject[], pipeline: any) {
  if (typeof pipeline === 'string') {
    return executeExpression(collection, pipeline);
  } else {
    if (Object.hasOwn(pipeline, 'path')) {
      return executeExpression(collection, pipeline.path);
    }
  }
  throw new Error('Unrecognized options');
}
