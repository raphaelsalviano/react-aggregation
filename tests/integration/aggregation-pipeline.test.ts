import { MockDatabaseAdapter } from '../mocks/database-adapter';
import { mockManufacturers, mockProducts } from '../__fixtures__';

/**
 * Integration tests for the aggregation pipeline functionality
 * These tests verify the behavior of different aggregation stages working together
 */
describe('Aggregation Pipeline Integration', () => {
  let adapter: MockDatabaseAdapter;

  beforeEach(() => {
    // Initialize a new adapter instance before each test with mock data
    adapter = new MockDatabaseAdapter({
      products: mockProducts,
      manufacturers: mockManufacturers
    });
  });

      /**
       * Tests for the matchStage method in an integration context
       * Verifies that the method correctly filters collections in real-world scenarios
       */
      describe('matchStage method', () => {
    /**
     * Test basic match functionality against a named collection
     * Verifies that documents are correctly filtered by category
     */
    it('should execute $match stage with collection name', async () => {
      const result = await adapter.matchStage('products', {
        category: 'electronics'
      });

      expect(result).toHaveLength(2);
      expect(result.every((p) => p.category === 'electronics')).toBe(true);
    });

    /**
     * Test handling of complex criteria with multiple conditions
     * Verifies that documents meeting all criteria are correctly filtered
     * (electronics category + active + price > 1000)
     */
    it('should handle complex match criteria', async () => {
      const result = await adapter.matchStage('products', {
        category: 'electronics',
        active: true,
        price: { $gt: 1000 }
      });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Laptop');
    });

    /**
     * Test behavior when no documents match the given criteria
     * Verifies that an empty array is returned when no matches are found
     */
    it('should return empty array for non-matching criteria', async () => {
      const result = await adapter.matchStage('products', {
        category: 'nonexistent'
      });

      expect(result).toHaveLength(0);
    });
  });

      /**
       * Tests for error handling in the aggregation pipeline
       * Verifies that the adapter handles edge cases gracefully without throwing exceptions
       */
      describe('error handling', () => {
    /**
     * Test behavior when an invalid collection name is provided
     * Verifies that the adapter returns an empty array rather than throwing an error
     */
    it('should handle invalid collection name gracefully', async () => {
      const result = await adapter.matchStage('invalidCollection', {
        active: true
      });

      expect(result).toHaveLength(0);
    });

    /**
     * Test behavior when empty criteria are provided
     * Verifies that all documents in the collection are returned when no filter is specified
     */
    it('should handle empty criteria', async () => {
      const result = await adapter.matchStage('products', {});

      expect(result).toHaveLength(3); // Returns all products
    });
  });
});
