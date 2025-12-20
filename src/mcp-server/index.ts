import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from 'zod';
import { getAllOrdersFromCustomer, getOrderById } from "../database/services/orders/orders.service";
import { getCustomerById } from "../database/services/customers/customers.service";

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
  "get_customer",
  {
    inputSchema: {
      customer_id: z.number()
    },
    description: 'Number that indentifies the customer (example: 1, 2, 38, 57)',
  },
  async ({ customer_id }) => {
    try {
      const customer = await getCustomerById(customer_id);

      if (!customer) {
        return {
          content: [{ type: 'text', text: `Customer ${customer_id} not found` }],
        };
      }

      return {
        content: [{ type: 'text', text: JSON.stringify(customer, null, 2) }],
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
  "get_order",
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
      const orders = await getAllOrdersFromCustomer(customer_id);

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
