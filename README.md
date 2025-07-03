# react-aggregation

[![npm version](https://badge.fury.io/js/react-aggregation.svg)](https://badge.fury.io/js/react-aggregation)
[![GitHub Package Registry version](https://img.shields.io/github/package-json/v/raphaelsalviano/react-aggregation.svg?label=github)](https://github.com/raphaelsalviano/react-aggregation/packages)
[![npm downloads](https://img.shields.io/npm/dm/react-aggregation.svg)](https://www.npmjs.com/package/react-aggregation)
[![Build Status](https://github.com/raphaelsalviano/react-aggregation/workflows/CI/badge.svg)](https://github.com/raphaelsalviano/react-aggregation/actions)
[![License](https://img.shields.io/npm/l/react-aggregation.svg)](https://github.com/seuusuario/react-aggregation/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.8.4-blue.svg)](https://www.typescriptlang.org/)

A TypeScript library for creating aggregation pipelines in React applications, inspired by MongoDB's aggregation syntax,
allowing you to filter, transform, and manipulate data efficiently.

## Table of Contents

- [Installation](#installation)
- [Setup and Usage](#setup)
- [Supported Stages](#supported-stages)
- [Types](#types)
- [Testing](#testing)
- [Contribution](#contribution)
- [Code of Conduct](#code-of-conduct)
- [License](#license)

## Installation

The library can be installed using the following methods:

### Using npm

```bash
npm install react-aggregation
```

### Using yarn

```bash
yarn add react-aggregation
```

After installation, you can import it to start using it in your React application.

### Import Options

Você pode importar a biblioteca de várias maneiras:

```typescript
// Importação padrão (recomendada)
import ReactAggregation from 'react-aggregation';

// Importação nomeada da função principal
import { aggregate } from 'react-aggregation';

// Importação nomeada do alias ReactAggregation
import { ReactAggregation } from 'react-aggregation';

// Importação de tipos e outras funções
import { DatabaseAdapter, DefaultObject, PipelineStage } from 'react-aggregation';
```

## Setup

To use `react-aggregation` with any database, you need to create a custom adapter that will interface between the
library and your chosen database.

### 1. Creating a Database Adapter

The main component for using the library with your preferred database is the adapter. Below is an example of how to
create a custom adapter:

```typescript
import { DatabaseAdapter, DefaultObject, PipelineStage } from 'react-aggregation';
import sift from 'sift';

// Custom adapter for your database
export class MyAdapterDatabase implements DatabaseAdapter {

  // Implementation of the $match stage (filtering)
  async matchStage<T = DefaultObject>(
    collection: DefaultObject[],
    criteria: PipelineStage
  ): Promise<T[]> {
    try {
      // Using sift to implement MongoDB-style queries
      const filteredCollection = collection.filter(sift(criteria));
      return filteredCollection as T[];
    } catch (error) {
      console.error('Error executing $match stage:', error);
      return [] as T[];
    }
  }

  // Database-specific helper methods
  private async getDatabaseData(collectionName: string): Promise<any[]> {
    // Implement your database-specific logic
    // Return data as an array of objects
    return [];
  }

}
```

### Complete Example with Realm

Here's a specific adapter for Realm:

```typescript
import { DatabaseAdapter, DefaultObject, PipelineStage } from 'react-aggregation';
import Realm from 'realm';
import sift from 'sift';

export class RealmAdapter implements DatabaseAdapter {
  private realmInstance?: Realm;

  // Method to initialize Realm
  async initialize(
    schemas: Realm.ObjectSchema[],
    partition: string,
    path: string,
    networkuser: string,
    token: string
  ): Promise<boolean> {
    try {
      if (!schemas || !schemas.length) {
        throw new Error('Schemas are required');
      }

      const realmAccessBehavior: Realm.OpenRealmBehaviorConfiguration = {
        type: 'downloadBeforeOpen' as Realm.OpenRealmBehaviorType,
        timeOutBehavior: 'openLocalRealm' as Realm.OpenRealmTimeOutBehavior,
        timeOut: 900000,
      };

      const anonymousUser = await this.loginCustomRealm(networkuser, token);

      const realmConfiguration: Realm.Configuration = {
        schema: schemas,
        path: path,
        sync: {
          newRealmFileBehavior: realmAccessBehavior,
          existingRealmFileBehavior: realmAccessBehavior,
          user: anonymousUser as unknown as Realm.User,
          partitionValue: partition,
          onError: (_session, error) => console.error('Error on sync:', error),
        },
      };

      this.realmInstance = await Realm.open(realmConfiguration);
      return !!this.realmInstance;
    } catch (error) {
      console.error('Error initializing Realm:', error);
      return false;
    }
  }

  // Implementation of getCollection for Realm
  async getCollection<T = DefaultObject>(collectionName: string): Promise<T[]> {
    if (!this.realmInstance) {
      throw new Error('Realm has not been initialized');
    }

    try {
      const objects = this.realmInstance.objects<T>(collectionName);
      return Array.from(objects).map(obj => this.serializeRealmObject(obj)) as T[];
    } catch (error) {
      console.error(`Error getting collection ${collectionName}:`, error);
      return [] as T[];
    }
  }

  // Implementation of toArray for Realm
  async toArray<T = DefaultObject>(collection: never): Promise<T[]> {
    const objects = collection as unknown as Realm.Results<any>;
    return Array.from(objects).map(obj => this.serializeRealmObject(obj)) as T[];
  }

  // Implementation of matchStage for Realm
  async matchStage<T = DefaultObject>(
    collection: DefaultObject[],
    criteria: PipelineStage
  ): Promise<T[]> {
    try {
      // Using sift to implement MongoDB-style queries
      const filteredCollection = collection.filter(sift(criteria));
      return filteredCollection as T[];
    } catch (error) {
      console.error('Error executing $match stage:', error);
      return [] as T[];
    }
  }

  // Helper to serialize Realm objects
  private serializeRealmObject<T>(obj: T): T {
    if (!obj) return obj;

    // Realm.Object has a toJSON method, but sometimes
    // manual serialization is needed for nested objects
    return JSON.parse(JSON.stringify(obj));
  }

  // Method for Realm authentication
  private async loginCustomRealm(networkuser: string, token: string): Promise<Realm.User> {
    // Implement Realm authentication logic
    // This is just an example and should be adapted to your case

    const credentials = Realm.Credentials.jwt(token);
    const app = new Realm.App({ id: networkuser });
    return app.logIn(credentials);
  }

  // Method to close connection
  async close(): Promise<boolean> {
    if (this.realmInstance) {
      this.realmInstance.close();
      this.realmInstance = null;
      return true;
    }
    return false;
  }

}
```

### 2. Configuring the Library

Once you've created the adapter, you need to configure it for use with the library:

```typescript
import ReactAggregation, { DatabaseConfig } from 'react-aggregation';
import { RealmAdapter } from './adapters/realmAdapter';
import { ProdutoSchema, UsuarioSchema } from './schemas';

// Create and initialize the Realm adapter
const realmAdapter = new RealmAdapter();
await realmAdapter.initialize(
  [ProductSchema, UserSchema],
  'my_partition',
  'database_path',
  'auth_user',
  'auth_token'
);

// Configure the library
const databaseConfigs: DatabaseConfig[] = [
  {
    defaultAdapter: realmAdapter,
    rules: {
      collections: ['Product', 'User']
    }
  }
];

// Example of using the aggregate function
async function getActiveProducts() {
  // Aggregation pipeline with multiple stages
  const aggregationPipeline = [
    { $match: { active: true } },
    { $sort: { price: -1 } },
    { $limit: 10 }
  ];

  // Execute the aggregation
  const result = await ReactAggregation('Product', aggregationPipeline, databaseConfigs);

  console.log('Active products:', result);
  return result;
}

```

### 3. Using Aggregation Stages

The function supports various aggregation stages, similar to those in MongoDB: `aggregate`

```typescript
// Example of pipeline with multiple stages
const aggregationPipeline = [
  // $match stage - filters documents
  { $match: { category: 'electronics', price: { $gt: 1000 } } },

  // $lookup stage - combines documents from another collection
  {
    $lookup: {
      from: 'manufacturers',
      localField: 'manufacturerId',
      foreignField: '_id',
      as: 'manufacturerInfo'
    }
  },

  // $unwind stage - expands arrays
  { $unwind: '$manufacturerInfo' },

  // $project stage - selects specific fields
  {
    $project: {
      name: 1,
      price: 1,
      'manufacturerInfo.name': 1,
      discount: { $multiply: ['$price', 0.1] }
    }
  },

  // $sort stage - sorts results
  { $sort: { price: -1 } },

  // $limit stage - limits number of results
  { $limit: 5 }
];

const result = await aggregate('Product', aggregationPipeline, databaseConfigs);
```

### 4. Integrating with React Components

Here's an example of how to integrate the library with React components:

```typescript jsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import ReactAggregation from 'react-aggregation';
import { databaseConfigs } from './database/config';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

const ProductsScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Pipeline with multiple stages
        const aggregationPipeline = [
          { $match: { category: 'electronics' } },
          { $sort: { price: -1 } },
          { $limit: 20 }
        ];

        // Execute aggregation
        const result = await ReactAggregation<Product>(
          'Product',
          aggregationPipeline,
          databaseConfigs
        );

        setProducts(result);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <View>
        <Text>Loading products...</Text>
      </View>
    );
  }

  return (
    <View>
      <Text>Electronic Products</Text>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View>
            <Text>{item.name}</Text>
            <Text>$ {item.price.toFixed(2)}</Text>
          </View>
        )}
      />
    </View>
  );
};

export default ProductsScreen;
```

## Supported Stages

The current library supports the following aggregation stages:

| Stage          | Description                                                    |
|----------------|----------------------------------------------------------------|
| `$addFields`   | Adds new fields to documents                                   |
| `$count`       | Counts documents in the pipeline                               |
| `$facet`       | Processes multiple aggregation pipelines in parallel           |
| `$group`       | Groups documents by a specified expression                     |
| `$limit`       | Limits the number of documents passed to the next stage        |
| `$lookup`      | Performs a "join" with documents from another collection       |
| `$match`       | Filters documents to pass only those that match the conditions |
| `$project`     | Selects specific fields from documents                         |
| `$replaceRoot` | Substitui o documento por um documento especificado            |
| `$search`      | Realiza pesquisa de texto                                      |
| `$skip`        | Pula um número específico de documentos                        |
| `$sort`        | Ordena documentos                                              |
| `$unwind`      | Deconstruir um campo de array em múltiplos documentos          |

## Types

Here you can find the library's `types`.

```typescript
// Basic types
export type DefaultObject = Record<string, any>;
export type PipelineStage = Record<string, any>;
export type AggregationPipeline = PipelineStage[];

// Database adapter interface
export interface DatabaseAdapter {
  // Implements the match operation (filtering)
  matchStage<T = DefaultObject>(
    collection: DefaultObject[],
    pipeline: PipelineStage
  ): Promise<T[]>;
}

// Database rules configuration
export interface DatabaseRules {
  /**
   * Collections available to be used
   * by the database instance
   */
  collections: string[];
}

// Complete database configuration
export interface DatabaseConfig {
  defaultAdapter: DatabaseAdapter;
  rules: DatabaseRules;
}
```

## Testing

The project includes a comprehensive test suite to ensure reliability and correctness of all aggregation operations. The
tests are organized into different categories to cover various aspects of the library.

### Test Structure

``` 
tests/
├── unit/                    # Unit tests for individual components
│   └── stages/             # Tests for aggregation stages
│       └── match.test.ts   # $match stage tests
├── integration/            # Integration tests
│   └── aggregation-pipeline.test.ts  # Pipeline integration tests
├── performance/            # Performance tests
│   └── large-datasets.test.ts        # Large dataset handling tests
├── __fixtures__/          # Mock data for testing
└── mocks/                 # Mock implementations
    └── database-adapter.ts # Mock database adapter
```

### Running Tests

To run the test suite, use the following commands:

``` bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test --watch

# Run tests with coverage report
yarn test --coverage

# Run specific test file
yarn test match.test.ts

# Run tests for specific pattern
yarn test --testNamePattern="should filter"
```

### Test Categories

#### 1. Unit Tests

Unit tests focus on individual aggregation stages and their specific functionality:

- **$match Stage Tests**: Test filtering operations with various criteria
    - Basic filtering (exact matches, boolean fields, string fields)
    - Complex criteria (operators like , , , , ) `$gt``$lt``$in``$nin``$ne`
    - Field existence checks using `$exists`
    - Edge cases and error handling

``` typescript
// Example unit test
it('should filter by exact match', async () => {
  const result = await adapter.matchStage('products', {
    category: 'electronics'
  });
  
  expect(result).toHaveLength(2);
  expect(result.every(p => p.category === 'electronics')).toBe(true);
});
```

#### 2. Integration Tests

Integration tests verify that different components work together correctly:

- **Aggregation Pipeline**: Tests the complete pipeline execution
- **Database Adapter Integration**: Tests adapter methods with real-world scenarios
- **Error Handling**: Tests graceful handling of invalid inputs and edge cases

``` typescript
// Example integration test
it('should execute complex aggregation pipeline', async () => {
  const pipeline = [
    { $match: { category: 'electronics', active: true } },
    { $sort: { price: -1 } },
    { $limit: 5 }
  ];
  
  const result = await aggregate('products', pipeline, configs);
  expect(result).toHaveLength(5);
  expect(result[0].price).toBeGreaterThan(result[1].price);
});
```

#### 3. Performance Tests

Performance tests ensure the library handles large datasets efficiently:

- **Large Dataset Handling**: Tests with 10,000+ documents
- **Memory Usage**: Verifies efficient memory management
- **Execution Time**: Ensures operations complete within acceptable timeframes

``` typescript
// Example performance test
it('should handle large dataset efficiently', async () => {
  const startTime = performance.now();
  
  const result = await adapter.matchStage('products', {
    category: 'electronics'
  });
  
  const executionTime = performance.now() - startTime;
  expect(executionTime).toBeLessThan(1000); // Less than 1 second
});
```

### Mock Data and Fixtures

The test suite uses mock data to ensure consistent and predictable test results:

``` typescript
// Example mock data structure
export const mockProducts = [
  {
    _id: '1',
    name: 'Laptop',
    price: 1200,
    category: 'electronics',
    active: true,
    manufacturerId: 'man1'
  },
  {
    _id: '2',
    name: 'Book',
    price: 25,
    category: 'books',
    active: true,
    manufacturerId: 'man2'
  }
];
```

### Writing Tests

When contributing to the project, please ensure your changes include appropriate tests:

1. **Unit Tests**: For new aggregation stages or modifications to existing ones
2. **Integration Tests**: For features that involve multiple components
3. **Performance Tests**: For changes that might affect performance

#### Test Guidelines

- Use descriptive test names that explain what is being tested
- Include both positive and negative test cases
- Test edge cases and error conditions
- Ensure tests are independent and can run in any order
- Use meaningful assertions that verify the expected behavior

``` typescript
// Good test example
describe('$match Stage', () => {
  describe('complex criteria', () => {
    it('should filter using multiple conditions with AND logic', async () => {
      const result = await adapter.matchStage('products', {
        category: 'electronics',
        active: true,
        price: { $gt: 1000 }
      });
      
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Laptop');
      expect(result[0].category).toBe('electronics');
      expect(result[0].active).toBe(true);
      expect(result[0].price).toBeGreaterThan(1000);
    });
  });
});
```

### Continuous Integration

The project uses automated testing in CI/CD pipelines to ensure:

- All tests pass before merging changes
- Code coverage remains above the minimum threshold
- Performance benchmarks are maintained
- No regressions are introduced

### Test Coverage

The project maintains high test coverage across all components:

- **Statements**: > 90%
- **Branches**: > 85%
- **Functions**: > 90%
- **Lines**: > 90%

To check current coverage:

``` bash
yarn test --coverage
```

This will generate a detailed coverage report showing which parts of the code are covered by tests and which areas need
additional testing.

## Contribution

We appreciate your interest in contributing to the `react-aggregation` project! Your help is essential to improve and
expand the library. Below are the guidelines for contributing.

### How to Contribute

1. **Fork the Repository**
    - Fork the project to your GitHub account
    - Clone the repository to your local environment:

```shell
   git clone https://github.com/seu-usuario/react-aggregation.git
   cd react-aggregation
```

2. **Environment Setup**
    - Install dependencies:

```shell
   yarn install
```

    - Build the project:

```shell
   yarn build
```

3. **Create a Branch**
    - Create a branch for your contribution:

```shell
   git checkout -b feature/your-feature-name
```

- Use prefixes that indicate the type of contribution:
    - `feature/` for new functionalities
    - `fix/` for bug fixes
    - `docs/` for documentation improvements
    - `test/` for adding or improving tests

4. **Development**
    - Implement your changes following the project's code style
    - Add or update relevant tests
    - Run tests to ensure everything is working:

```shell
   yarn test
```

5. **Submit your Contribution**
    - Commit your changes with clear messages:

```shell
   git commit -m "feat: add support for $replaceWith stage"
```

- Push to your repository:

```shell
   git push origin feature/your-feature-name
```

    6. **Create a Pull Request**
    - Open a Pull Request (PR) to the main repository
    - Describe your changes in detail
    - Reference any related issues

### Code Guidelines

- Keep the code clean and well-documented
- Follow existing naming conventions
- Add JSDoc for new functions and methods
- Maintain high test coverage for new features

### Contribution Areas

- **New Aggregation Stages**: Implementation of stages not yet supported
- **Performance Optimizations**: Improvements in the performance of existing stages
- **Database Adapters**: Implementations for other databases
- **Documentation**: Examples, tutorials, and documentation improvements
- **Tests**: Expansion of test coverage and test cases

### Reporting Bugs

If you find bugs or issues, please:

1. Check if the issue has already been reported
2. Use the bug report template to provide:
    - Library version
    - Environment (Node.js version, React version, operating system)
    - Steps to reproduce
    - Expected behavior vs. actual behavior
    - Screenshots or logs if applicable

### Requesting Features

To request new features:

1. Clearly describe what you would like to see implemented
2. Explain why this feature would be useful to the community
3. Provide examples of how the feature could be used

## Code of Conduct

### Our Pledge

In the interest of fostering an open and welcoming environment, we as contributors and maintainers pledge to
make participation in our project a harassment-free experience for everyone, regardless of age, body
size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance,
race,
religion, or sexual identity and orientation.

### Our Standards

Examples of behavior that contributes to creating a positive environment include:

- Using welcoming and inclusive language
- Respecting different viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

Examples of unacceptable behavior include:

- The use of sexualized language or imagery
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Other conduct which could reasonably be considered inappropriate in a professional setting

### Responsibilities

Project maintainers are responsible for clarifying the standards of acceptable behavior and are expected to take
appropriate corrective action in response to any instances of unacceptable behavior.
Project maintainers have the right and responsibility to remove, edit, or reject comments, commits,
code, wiki edits, issues, and other contributions that are not aligned with this Code of Conduct, or to ban
temporarily or permanently any contributor for other behaviors that they deem inappropriate, threatening,
offensive, or harmful.

## License

The react-aggregation project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

```
MIT License

Copyright (c) 2023 react-aggregation

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

The MIT License is a permissive license, which means that:

- You can freely use the code in personal and commercial projects
- You can modify and distribute the code
- You can include the code in projects with different licenses
- The only obligation is to include a copy of the MIT license and copyright notice in any copy of the software/source
  code

This license was chosen to maximize reuse and contribution to the project, while maintaining minimal requirements for
end users.
