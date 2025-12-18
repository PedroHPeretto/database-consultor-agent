import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import sqlite from 'sqlite3';
import path from 'path';
import { z } from 'zod';

const dbPath = path.resolve(process.cwd(), 'src/database/shop.db');
const db = new sqlite.Database(dbPath, sqlite.OPEN_READONLY, (error) => {
  if (error) {
    console.error('Failed to load database', error.message);
  }
});

const dbGet = (query: string, params: any[]) => {
  return new Promise<any>((resolve, reject) => {
    db.get(query, params, (error, row) => {
      if (error) reject(error);
      else resolve(row);
    });
  });
};

const dbAll = (query: string, params: any[]) => {
  return new Promise<any>((resolve, reject) => {
    db.all(query, params, (error, rows) => {
      if (error) reject(error);
      else resolve(rows);
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

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log('Shop MCP Server running on stdio')
}

main().catch((error) => {
  console.error('Failed to initialize MCP Server:', error);
  process.exit(1);
});
