import { MockDatabaseAdapter } from '../../mocks/database-adapter';
import { mockProducts } from '../../__fixtures__';

/**
 * Tests for the $match aggregation stage implementation
 * These tests verify the behavior of filtering data using match criteria
 */
describe('$match Stage', () => {
  let adapter: MockDatabaseAdapter;

  beforeEach(() => {
    // Initialize a new adapter instance before each test with mock products data
    adapter = new MockDatabaseAdapter({
      products: mockProducts
    });
  });

      /**
       * Tests for basic filtering operations using simple match criteria
       */
      describe('basic filtering', () => {
    /**
     * Test exact matching by a specific field value
     * Verifies that only products with category 'electronics' are returned
     */
    it('should filter by exact match', async () => {
      const result = await adapter.matchStage('products', {
        category: 'electronics'
      });

      expect(result).toHaveLength(2);
      expect(result.every((p) => p.category === 'electronics')).toBe(true);
    });

    /**
     * Test filtering by boolean field value
     * Verifies that only products with active=true are returned
     */
    it('should filter by boolean field', async () => {
      const result = await adapter.matchStage('products', { active: true });

      expect(result).toHaveLength(2);
      expect(result.every((p) => p.active === true)).toBe(true);
    });

    /**
     * Test filtering by exact string field value
     * Verifies that only the product with name='Laptop' is returned
     */
    it('should filter by string field', async () => {
      const result = await adapter.matchStage('products', { name: 'Laptop' });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Laptop');
    });
  });

      /**
       * Tests for complex filtering operations using MongoDB-style operators
       */
      describe('complex criteria', () => {
    /**
     * Test filtering using the $gt (greater than) operator
     * Verifies that only products with price > 500 are returned
     */
    it('should filter by price range using $gt', async () => {
      const result = await adapter.matchStage('products', {
        price: { $gt: 500 }
      });

      expect(result).toHaveLength(2);
      expect(result.every((p) => p.price > 500)).toBe(true);
    });

    /**
     * Test filtering using the $lt (less than) operator
     * Verifies that only products with price < 100 are returned
     */
    it('should filter by price range using $lt', async () => {
      const result = await adapter.matchStage('products', {
        price: { $lt: 100 }
      });

      expect(result).toHaveLength(1);
      expect(result[0].price).toBe(25);
    });

    /**
     * Test filtering using both $gte (greater than or equal) and $lte (less than or equal) operators
     * Verifies that only products with 25 <= price <= 800 are returned
     */
    it('should filter by price range using $gte and $lte', async () => {
      const result = await adapter.matchStage('products', {
        price: { $gte: 25, $lte: 800 }
      });

      expect(result).toHaveLength(2);
      expect(result.every((p) => p.price >= 25 && p.price <= 800)).toBe(true);
    });

    /**
     * Test filtering using the $in operator (matches any value in the specified array)
     * Verifies that only products with category in ['electronics', 'books'] are returned
     */
    it('should filter using $in operator', async () => {
      const result = await adapter.matchStage('products', {
        category: { $in: ['electronics', 'books'] }
      });

      expect(result).toHaveLength(3);
      expect(
        result.every((p) => ['electronics', 'books'].includes(p.category))
      ).toBe(true);
    });

    /**
     * Test filtering using the $nin (not in) operator
     * Verifies that only products with category not in ['books'] are returned
     */
    it('should filter using $nin operator', async () => {
      const result = await adapter.matchStage('products', {
        category: { $nin: ['books'] }
      });

      expect(result).toHaveLength(2);
      expect(result.every((p) => p.category !== 'books')).toBe(true);
    });

    /**
     * Test filtering using the $ne (not equal) operator
     * Verifies that only products with active not equal to false are returned
     */
    it('should filter using $ne operator', async () => {
      const result = await adapter.matchStage('products', {
        active: { $ne: false }
      });

      expect(result).toHaveLength(2);
      expect(result.every((p) => p.active !== false)).toBe(true);
    });

    /**
     * Test filtering with multiple conditions combined (implicit AND operation)
     * Verifies that only products matching all conditions are returned
     */
    it('should filter by multiple conditions', async () => {
      const result = await adapter.matchStage('products', {
        category: 'electronics',
        active: true,
        price: { $gt: 1000 }
      });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Laptop');
    });
  });

      /**
       * Tests for edge cases and error handling
       */
      describe('edge cases', () => {
    /**
     * Test behavior when no documents match the criteria
     * Verifies that an empty array is returned when no matches are found
     */
    it('should return empty array when no matches', async () => {
      const result = await adapter.matchStage('products', {
        category: 'nonexistent'
      });

      expect(result).toHaveLength(0);
    });

    /**
     * Test behavior when attempting to match against a collection that doesn't exist
     * Verifies that an empty array is returned when the collection doesn't exist
     */
    it('should handle nonexistent collection', async () => {
      const result = await adapter.matchStage('nonexistent', {
        category: 'electronics'
      });

      expect(result).toHaveLength(0);
    });

    /**
     * Test behavior when providing empty criteria
     * Verifies that all documents are returned when no filtering criteria are provided
     */
    it('should handle empty criteria', async () => {
      const result = await adapter.matchStage('products', {});

      expect(result).toHaveLength(3); // Returns all products
    });

    /**
     * Test behavior when matching a null value against a nonexistent field
     * Verifies that an empty array is returned when matching null against nonexistent field
     */
    it('should handle null criteria gracefully', async () => {
      const result = await adapter.matchStage('products', {
        nonexistentField: null
      });

      expect(result).toHaveLength(0);
    });
  });

  /**
   * Tests for field existence checking using the $exists operator
   */
  describe('field existence tests', () => {
    /**
     * Test filtering for documents where a specific field exists
     * Verifies that only products with manufacturerId field are returned
     */
    it('should filter by field existence using $exists', async () => {
      const result = await adapter.matchStage('products', {
        manufacturerId: { $exists: true }
      });

      expect(result).toHaveLength(3);
      expect(result.every((p) => p.manufacturerId !== undefined)).toBe(true);
    });

    /**
     * Test filtering for documents where a specific field doesn't exist
     * Verifies that only products without nonexistentField are returned
     */
    it('should filter by field non-existence using $exists', async () => {
      const result = await adapter.matchStage('products', {
        nonexistentField: { $exists: false }
      });

      expect(result).toHaveLength(3); // All products don't have this field
    });
  });
});
