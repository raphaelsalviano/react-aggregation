import '@testing-library/jest-dom';

beforeAll(() => {
  jest.setTimeout(10000);
});

afterAll(() => {
  // clear all tests
});

const originalConsoleError = console.error;

beforeEach(() => {
  console.error = jest.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
});
