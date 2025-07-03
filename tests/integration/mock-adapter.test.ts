import { MockDatabaseAdapter } from '../mocks/database-adapter';
import { mockProducts, mockUsers } from '../__fixtures__';

describe('MockDatabaseAdapter Integration', () => {
  let adapter: MockDatabaseAdapter;

  beforeEach(() => {
    adapter = new MockDatabaseAdapter({
      products: mockProducts,
      users: mockUsers
    });
  });

  describe('getCollection method', () => {
    it('should return all products', async () => {
      const products = await adapter.getCollection('products');

      expect(products).toHaveLength(3);
      expect(products[0]).toHaveProperty('name');
      expect(products[0]).toHaveProperty('price');
    });

    it('should return all users', async () => {
      const users = await adapter.getCollection('users');

      expect(users).toHaveLength(2);
      expect(users[0]).toHaveProperty('name');
      expect(users[0]).toHaveProperty('email');
    });

    it('should return empty array for non-existent collection', async () => {
      const result = await adapter.getCollection('nonexistent');

      expect(result).toHaveLength(0);
    });
  });

  describe('matchStage method', () => {
    it('should work with getCollection result', async () => {
      const allProducts = await adapter.getCollection('products');
      expect(allProducts).toHaveLength(3);

      const electronicsProducts = await adapter.matchStage('products', {
        category: 'electronics'
      });

      expect(electronicsProducts).toHaveLength(2);
      expect(
        electronicsProducts.every((p) => p.category === 'electronics')
      ).toBe(true);
    });
  });

  describe('helper methods', () => {
    it('should add new collection', () => {
      const newData = [{ _id: '1', name: 'Test Item' }];
      adapter.addToCollection('test', newData);

      expect(adapter.getAllCollections()).toContain('test');
    });

    it('should clear collection', async () => {
      adapter.clearCollection('products');

      const products = await adapter.getCollection('products');
      expect(products).toHaveLength(0);
    });

    it('should list all collections', () => {
      const collections = adapter.getAllCollections();

      expect(collections).toContain('products');
      expect(collections).toContain('users');
      expect(collections).toHaveLength(2);
    });
  });
});
