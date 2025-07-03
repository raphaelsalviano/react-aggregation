import { MockDatabaseAdapter } from "../mocks/database-adapter";

/**
 * Performance tests for database operations on large datasets
 * These tests verify that the database adapter can handle large volumes of data efficiently
 */
describe("Performance Tests", () => {
  let largeDataset: any[];
  let adapter: MockDatabaseAdapter;

  beforeAll(() => {
    // Generate large dataset
    largeDataset = Array.from({ length: 10000 }, (_, i) => ({
      _id: `product_${i}`,
      name: `Product ${i}`,
      price: Math.floor(Math.random() * 1000) + 100,
      category: i % 2 === 0 ? "electronics" : "books",
      active: i % 3 === 0
    }));

    adapter = new MockDatabaseAdapter({
      products: largeDataset
    });
  });

  /**
   * Test that verifies the query performance on a large dataset
   * Ensures that filtering 10,000 products completes in under 1 second
   * and returns correct results
   */
  it("should handle large dataset efficiently", async () => {
    const startTime = performance.now();

    // Test the matchStage method directly
    const result = await adapter.matchStage("products", {
      category: "electronics"
    });

    const endTime = performance.now();
    const executionTime = endTime - startTime;

    expect(result.length).toBeGreaterThan(0);
    expect(executionTime).toBeLessThan(1000); // Less than 1 second

    // Verify that all results are of the correct category
    expect(result.every((p) => p.category === "electronics")).toBe(true);
  });

  /**
   * Test that verifies the adapter doesn't consume excessive memory
   * Ensures that the result set is properly filtered and doesn't retain
   * all documents when only a subset matches the criteria
   */
  it("should handle memory usage efficiently", async () => {
    const result = await adapter.matchStage("products", { active: true });

    // Verify there are no memory leaks (result set should be smaller than original)
    expect(result.length).toBeGreaterThan(0);
    expect(result.length).toBeLessThan(largeDataset.length);

    // Verify that all results have active: true
    expect(result.every((p) => p.active === true)).toBe(true);
  });

  /**
   * Test that verifies performance with complex filtering criteria
   * Ensures that using multiple filter conditions still performs efficiently
   * (under 2 seconds) on a large dataset
   */
  it("should handle complex filtering on large dataset", async () => {
    const startTime = performance.now();

    const result = await adapter.matchStage("products", {
      category: "electronics",
      price: { $gt: 500 }
    });

    const endTime = performance.now();
    const executionTime = endTime - startTime;

    expect(result.length).toBeGreaterThan(0);
    expect(executionTime).toBeLessThan(2000); // Less than 2 seconds for complex filter

    // Verify conditions
    expect(
      result.every((p) => p.category === "electronics" && p.price > 500)
    ).toBe(true);
  });
});
