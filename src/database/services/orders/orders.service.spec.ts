import { getAllOrdersFromCustomer, getOrderById } from './orders.service';
import { getCustomerById } from '../customers/customers.service';

jest.mock('../customers/customers.service');

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

const mockGetCustomerById = getCustomerById as jest.Mock;

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
        expect.stringContaining('SELECT * FROM orders WHERE id = ?'),
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
        expect.stringContaining('SELECT * FROM orders WHERE id = ?'),
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

  describe('Get all orders made by the customer', () => {
    const mockCustomer = { id: 1, name: 'Pedro', email: 'pedro@email.com' };

    it('Should return all orders made by the customer', async () => {
      const mockOrder1 = { id: 1, customer_id: 1, product: 'Mouse', price: 200.00, status: 'DELIVERED', order_date: '2025-07-27' };
      const mockOrder2 = { id: 2, customer_id: 1, product: 'Keyboard', price: 200.00, status: 'DELAYED', order_date: '2025-09-30' };

      mockGetCustomerById.mockResolvedValue(mockCustomer);

      mockDb.all.mockImplementation((query: string, params: any[], callback: any) => {
        callback(null, [mockOrder1, mockOrder2]);
      });

      const result = await getAllOrdersFromCustomer(1);

      expect(result).toEqual([mockOrder1, mockOrder2]);
      expect(mockGetCustomerById).toHaveBeenCalledWith(1);
      expect(mockDb.all).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM orders WHERE customer_id = ?'),
        [1],
        expect.any(Function)
      );
    });

    it('Should throw an error if user was not found', async () => {
      mockGetCustomerById.mockResolvedValue(null);

      await expect(getAllOrdersFromCustomer(1)).rejects.toThrow('Customer not found');
      expect(mockGetCustomerById).toHaveBeenCalledWith(1);
    });

    it('Should throw an error if the database fail', async () => {
      mockGetCustomerById.mockResolvedValue(mockCustomer);

      const mockError = new Error('Database connection failed');

      mockDb.all.mockImplementation((_: any, __: any, callback: any) => {
        callback(mockError, null);
      });

      await expect(getAllOrdersFromCustomer(1)).rejects.toThrow('Database connection failed');
    });
  });
});
