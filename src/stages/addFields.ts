import { DefaultObject, PipelineStage } from '../types';
import { SUPPORTED_OPERATIONS } from '../constants';
import { executeOperation } from '../operations';

function executeObjectExpression(expression: any, item: DefaultObject) {
  if (SUPPORTED_OPERATIONS.includes(Object.keys(expression)[0] as any)) {
    return executeOperation(expression, item);
  }
  throw new Error('Object expression is not supported');
}

export async function addFieldsStage(
  collection: DefaultObject[],
  pipeline: PipelineStage
) {
  if (!pipeline || typeof pipeline !== 'object')
    throw new Error('$addFields stage needs a query object.');

  return collection.map((item) => {
    for (const [newField, expression] of Object.entries(pipeline)) {
      if (typeof expression === 'string') {
        if (expression[0] === '$') {
          item[newField] = item[expression.slice(1)];
        }
      } else if (typeof expression === 'object') {
        item[newField] = executeObjectExpression(expression, item);
      } else {
        if (typeof expression !== 'number')
          throw new Error('Expression or value is not supported');
        item[newField] = expression;
      }
    }
    return item;
  });
}
