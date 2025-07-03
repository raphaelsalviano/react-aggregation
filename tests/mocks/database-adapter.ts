import { DatabaseAdapter, DefaultObject, PipelineStage } from '../../src';

export class MockDatabaseAdapter implements DatabaseAdapter {
  private collections: Map<string, DefaultObject[]> = new Map();

  constructor(initialData: Record<string, DefaultObject[]> = {}) {
    Object.entries(initialData).forEach(([name, data]) => {
      this.collections.set(name, data);
    });
  }

  async getCollection<T = DefaultObject>(collectionName: string): Promise<T[]> {
    return (this.collections.get(collectionName) || []) as T[];
  }

  async matchStage<T = DefaultObject>(
    collectionName: string,
    criteria: PipelineStage
  ): Promise<T[]> {
    const collection = this.collections.get(collectionName) || [];

    // Implementação simplificada para testes
    return collection.filter((item) => {
      return Object.entries(criteria).every(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          // Operadores complexos como $gt, $lt, etc.
          return this.evaluateComplexCriteria(item[key], value);
        }
        return item[key] === value;
      });
    }) as T[];
  }

  // Método adicional para facilitar testes
  addToCollection(collectionName: string, data: DefaultObject[]): void {
    this.collections.set(collectionName, data);
  }

  // Método para limpar uma coleção
  clearCollection(collectionName: string): void {
    this.collections.delete(collectionName);
  }

  // Método para obter todas as coleções (útil para debug)
  getAllCollections(): string[] {
    return Array.from(this.collections.keys());
  }

  private evaluateComplexCriteria(fieldValue: any, criteria: any): boolean {
    // Operadores de comparação
    if (criteria.$gt !== undefined) {
      return fieldValue > criteria.$gt;
    }
    if (criteria.$lt !== undefined) {
      return fieldValue < criteria.$lt;
    }
    if (criteria.$lte !== undefined) {
      return fieldValue <= criteria.$lte;
    }
    if (criteria.$gte !== undefined) {
      return fieldValue >= criteria.$gte;
    }
    if (criteria.$eq !== undefined) {
      return fieldValue === criteria.$eq;
    }
    if (criteria.$ne !== undefined) {
      return fieldValue !== criteria.$ne;
    }

    // Operadores de array
    if (criteria.$in !== undefined) {
      return Array.isArray(criteria.$in) && criteria.$in.includes(fieldValue);
    }
    if (criteria.$nin !== undefined) {
      return (
        Array.isArray(criteria.$nin) && !criteria.$nin.includes(fieldValue)
      );
    }

    // Operadores de existência
    if (criteria.$exists !== undefined) {
      return criteria.$exists
        ? fieldValue !== undefined
        : fieldValue === undefined;
    }

    // Operadores de string/regex
    if (criteria.$regex !== undefined) {
      const regex = new RegExp(criteria.$regex, criteria.$options || '');
      return regex.test(String(fieldValue));
    }

    // Operadores lógicos
    if (criteria.$and !== undefined) {
      return (
        Array.isArray(criteria.$and) &&
        criteria.$and.every((condition: any) =>
          this.evaluateComplexCriteria(fieldValue, condition)
        )
      );
    }
    if (criteria.$or !== undefined) {
      return (
        Array.isArray(criteria.$or) &&
        criteria.$or.some((condition: any) =>
          this.evaluateComplexCriteria(fieldValue, condition)
        )
      );
    }

    return true;
  }
}
