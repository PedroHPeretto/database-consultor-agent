import { getCustomerById } from "./customers.service";

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

describe('Customers service', () => {
  let mockDb: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDb = new (require('sqlite3').Database)();
  });

  describe('Get customer by ID', () => {
    it('Should return the customer when ID exists', async () => {
      const mockCustomer = { id: 1, name: 'Pedro', email: 'pedro@email.com' };

      mockDb.get.mockImplementation((query: string, params: any[], callback: any) => {
        callback(null, mockCustomer);
      });

      const result = await getCustomerById(1);

      expect(result).toEqual(mockCustomer);
      expect(mockDb.get).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM customers WHERE id = ?'),
        [1],
        expect.any(Function)
      );
    });

    it('Should return undefined if customer does not exist', async () => {
      mockDb.get.mockImplementation((_: any, __: any, callback: any) => {
        callback(null, undefined);
      });

      const result = await getCustomerById(999);

      expect(result).toBeUndefined();
      expect(mockDb.get).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM customers WHERE id = ?'),
        [999],
        expect.any(Function)
      );
    });

    it('Should throw an error if the database fail', async () => {
      const mockError = new Error('Database connection failed');

      mockDb.get.mockImplementation((_: any, __: any, callback: any) => {
        callback(mockError, null);
      });

      await expect(getCustomerById(1)).rejects.toThrow('Database connection failed');
    });
  });
});