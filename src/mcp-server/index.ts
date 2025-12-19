import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from 'zod';
import { getAllOrdersFromUser, getOrderById } from "../database/services/orders/orders.service";

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
      const order = await getOrderById(order_id);

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
      const orders = await getAllOrdersFromUser(customer_id);

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
