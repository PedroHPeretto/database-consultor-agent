import { getDb } from '../orders/orders.service';

export const getCustomerById = <T>(id: number): Promise<T> => {
  const db = getDb();

  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM customers WHERE id = ?',
      [id],
      (error, row) => {
        if (error) reject(error);
        else resolve(row as T);
      },
    );
  });
};