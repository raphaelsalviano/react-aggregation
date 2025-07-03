export const mockProducts = [
  {
    _id: '1',
    name: 'Laptop',
    price: 1500,
    category: 'electronics',
    active: true,
    manufacturerId: 'mfg1',
    tags: ['computer', 'work'],
    specifications: {
      ram: '16GB',
      storage: '512GB SSD'
    }
  },
  {
    _id: '2',
    name: 'Smartphone',
    price: 800,
    category: 'electronics',
    active: true,
    manufacturerId: 'mfg2',
    tags: ['phone', 'mobile'],
    specifications: {
      ram: '8GB',
      storage: '128GB'
    }
  },
  {
    _id: '3',
    name: 'Programming Book',
    price: 25,
    category: 'books',
    active: false,
    manufacturerId: 'mfg3',
    tags: ['education', 'reading'],
    pages: 350
  }
];

export const mockUsers = [
  {
    _id: 'user1',
    name: 'João Silva',
    email: 'joao@email.com',
    age: 30,
    preferences: ['electronics', 'books'],
    address: {
      city: 'São Paulo',
      country: 'Brasil'
    }
  },
  {
    _id: 'user2',
    name: 'Maria Santos',
    email: 'maria@email.com',
    age: 25,
    preferences: ['electronics'],
    address: {
      city: 'Rio de Janeiro',
      country: 'Brasil'
    }
  }
];

export const mockManufacturers = [
  {
    _id: 'mfg1',
    name: 'TechCorp',
    country: 'USA',
    founded: 1995
  },
  {
    _id: 'mfg2',
    name: 'MobileTech',
    country: 'Korea',
    founded: 2000
  },
  {
    _id: 'mfg3',
    name: 'BookPublisher',
    country: 'UK',
    founded: 1985
  }
];
