import sqlite from 'sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.resolve(__dirname, 'shop.db');

if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('Removing old database...');
}

const db = new sqlite.Database(dbPath);

db.serialize(() => {
  console.log('Creating tables...');

  db.run(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      product TEXT NOT NULL,
      price REAL NOT NULL,
      status TEXT NOT NULL,
      order_date TEXT NOT NULL,
      FOREIGN KEY(customer_id) REFERENCES customers(id)
    )
  `);

  console.log('Inserting fake data...')

  const stmtCustomer = db.prepare("INSERT INTO customers (id, name, email) VALUES (?, ?, ?)");

  stmtCustomer.run(1, 'Pedro Henrique', 'pedro@email.com');
  stmtCustomer.run(2, 'Paulo Silva', 'paulo@email.com');
  stmtCustomer.run(3, 'Felipe dos Santos', 'felipe@email.com');
  stmtCustomer.run(4, 'Luiza Pereira', 'luiza@email.com');
  stmtCustomer.run(5, 'Juliana Marques', 'juliana@email.com');

  stmtCustomer.finalize();

  const stmtOrders = db.prepare("INSERT INTO orders (id, customer_id, product, price, status, order_date) VALUES (?, ?, ?, ?, ?, ?)");

  stmtOrders.run(1, 1, 'Barbeador', 250.00, 'IN_TRANSPORT', '2025-12-03');
  stmtOrders.run(2, 1, 'Notebook', 3000.00, 'DELIVERED', '2025-11-24');
  stmtOrders.run(3, 2, 'Bola de futebol', 54.50, 'IN_TRANSPORT', '2025-12-10');
  stmtOrders.run(4, 3, 'Camiseta', 120.00, 'IN_TRANSPORT', '2025-12-04');
  stmtOrders.run(5, 4, 'Salto', 340.00, 'DELIVERED', '2025-11-29');
  stmtOrders.run(6, 4, 'Batom', 60.00, 'DELAYED', '2025-11-02');
  stmtOrders.run(7, 5, 'Bolsa', 700.90, 'IN_TRANSPORT', '2025-12-05');

  stmtOrders.finalize();
});

db.close(() => {
  console.log('Database "shop.db" created successfully on path src/database/');
});