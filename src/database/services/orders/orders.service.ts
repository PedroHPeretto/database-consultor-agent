import sqlite from 'sqlite3';
import path from 'path';

const dbPath = path.resolve(__dirname, 'shop.db');

export const getDb = () => {
  return new sqlite.Database(dbPath, sqlite.OPEN_READONLY, (error) => {
    if (error) {
      console.error('Failed to load database', error.message);
    }
  });
}

export const getOrderById = <T>(id: number): Promise<T> => {
  const db = getDb();

  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM orders WHERE id = ?',
      [id],
      (error, row) => {
        db.close();
        if (error) reject(error);
        else resolve(row as T);
      }
    );
  });
};

export const getAllOrdersFromUser = <T>(id: number): Promise<T> => {
  const db = getDb();

  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM orders WHERE customer_id = ?',
      [id],
      (error, rows) => {
        db.close();
        if (error) reject(error);
        else resolve(rows as T);
      }
    )
  })
}