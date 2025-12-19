import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import sqlite from 'sqlite3';
import path from 'path';
import { z } from 'zod';

const dbPath = path.resolve(__dirname, '../database/shop.db');

const db = new sqlite.Database(dbPath, sqlite.OPEN_READONLY, (error) => {
  if (error) {
    console.error('Failed to load database', error.message);
  }
});

const dbGet = <T>(query: string, params: any[]): Promise<T | undefined> => {
  return new Promise<any>((resolve, reject) => {
    db.get(query, params, (error, row) => {
      if (error) reject(error);
      else resolve(row as T);
    });
  });
};

const dbAll = <T>(query: string, params: any[]): Promise<T | undefined> => {
  return new Promise<any>((resolve, reject) => {
    db.all(query, params, (error, rows) => {
      if (error) reject(error);
      else resolve(rows as T);
    });
  });
};

const server = new McpServer(
  {
    name: 'shop-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  },
);

server.registerTool(
  "consult_order_status",
  {
    inputSchema: {
      order_id: z.number()
    },
    description: 'Number that indentifies the order (example: 1, 2, 38, 57)',
  },
  async ({ order_id }) => {
    try {
      const order = await dbGet(
        'SELECT id, product, status, price, order_date FROM orders WHERE id = ?',
        [order_id]
      )

      if (!order) {
        return {
          content: [{ type: 'text', text: `Order ${order_id} not found` }],
        };
      }

      return {
        content: [{ type: 'text', text: JSON.stringify(order, null, 2) }],
      };
    } catch (error: any) {
      return {
        content: [{ type: 'text', text: `Error on processing: ${error.message}` }],
        isError: true,
      };
    }
  }
);

server.registerTool(
  "list_all_customer_orders",
  {
    inputSchema: {
      customer_id: z.number()
    },
    description: 'Number that indentifies the customer (example: 1, 2, 38, 57)',
  },
  async ({ customer_id }) => {
    try {
      const customer = await dbGet(
        'SELECT id, name, email FROM customers WHERE id = ?',
        [customer_id]
      )

      if (!customer) {
        return {
          content: [{ type: 'text', text: `Customer ${customer_id} not found` }],
        };
      }

      const orders = await dbAll(
        'SELECT id, product, status, price, order_date FROM orders WHERE customer_id = ?',
        [customer_id]
      )

      return {
        content: [{ type: 'text', text: JSON.stringify(orders, null, 2) }],
      };
    } catch (error: any) {
      return {
        content: [{ type: 'text', text: `Error on processing: ${error.message}` }],
        isError: true,
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Shop MCP Server running on stdio')
}

main().catch((error) => {
  console.error('Failed to initialize MCP Server:', error);
  process.exit(1);
});
