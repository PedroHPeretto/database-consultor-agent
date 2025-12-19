import sqlite, { OPEN_READONLY } from 'sqlite3';
import { getAllOrdersFromUser, getOrderById } from './orders.service';

jest.mock('sqlite3', () => {
  const mockDb = {
    get: jest.fn(),
    all: jest.fn(),
    close: jest.fn(),
  };
  return {
    Database: jest.fn(() => mockDb),
    OPEN_READONLY: 1,
  };
});

describe('Orders service', () => {
  let mockDb: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDb = new (require('sqlite3').Database)();
  });

  describe('Get order by ID', () => {
    it('Should return the order when ID exists', async () => {
      const mockOrder = { id: 1, customer_id: 1, product: 'Mouse', price: 200.00, status: 'DELIVERED', order_date: '2025-07-27' };

      mockDb.get.mockImplementation((query: string, params: any[], callback: any) => {
        callback(null, mockOrder);
      });

      const result = await getOrderById(1);

      expect(result).toEqual(mockOrder);
      expect(mockDb.get).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id'),
        [1],
        expect.any(Function)
      );
    });

    it('Should return undefined if the order does not exist', async () => {
      mockDb.get.mockImplementation((_: any, __: any, callback: any) => {
        callback(null, undefined);
      });

      const result = await getOrderById(999);

      expect(result).toBeUndefined();
      expect(mockDb.get).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id'),
        [999],
        expect.any(Function)
      );
    });

    it('Should throw an error if the database fail', async () => {
      const mockError = new Error('Database connection failed');

      mockDb.get.mockImplementation((_: any, __: any, callback: any) => {
        callback(mockError, null);
      });

      await expect(getOrderById(1)).rejects.toThrow('Database connection failed');
    });
  });

  describe('Get all orders by user', () => {
    it('Should return all orders made by the user', async () => {
      const mockOrder1 = { id: 1, customer_id: 1, product: 'Mouse', price: 200.00, status: 'DELIVERED', order_date: '2025-07-27' };
      const mockOrder2 = { id: 2, customer_id: 1, product: 'Keyboard', price: 200.00, status: 'DELAYED', order_date: '2025-09-30' };

      mockDb.get.mockImplementation((query: string, params: any[], callback: any) => {
        callback(null, [mockOrder1, mockOrder2]);
      });

      const result = await getAllOrdersFromUser(1);

      expect(result).toEqual([mockOrder1, mockOrder2]);
      expect(mockDb.get).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id'),
        [1],
        expect.any(Function)
      );
    });

    it('Should throw an error if the database fail', async () => {
      const mockError = new Error('Database connection failed');

      mockDb.get.mockImplementation((_: any, __: any, callback: any) => {
        callback(mockError, null);
      });

      await expect(getAllOrdersFromUser(1)).rejects.toThrow('Database connection failed');
    });
  });
});