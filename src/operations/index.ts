import { OperationsObject } from '../types';

import { SUPPORTED_OPERATIONS } from '../constants';

import { firstOperation } from './first';
import { filterOperation } from './filter';

const operations: OperationsObject = {
  $first: firstOperation,
  $filter: filterOperation
};

export function executeOperation(accumulatorObject: any, items: any) {
  const accumulatorName = Object.keys(accumulatorObject)[0] as any;
  const expression = accumulatorObject[accumulatorName];

  if (SUPPORTED_OPERATIONS.includes(accumulatorName)) {
    if (['string', 'number', 'object'].includes(typeof expression)) {
      // @ts-ignore
      return operations[accumulatorName](items, expression);
    }
  }

  throw new Error(`${accumulatorName} or ${expression} is not supported!`);
}
