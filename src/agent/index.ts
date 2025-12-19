import { ChatBedrockConverse } from "@langchain/aws";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { MemorySaver, MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import path from 'path';
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { AIMessage } from "@langchain/core/messages";

async function createAgent() {
  const mcpClient = new MultiServerMCPClient({
    'shop-server': {
      transport: 'stdio',
      command: 'npx',
      args: [
        'ts-node',
        path.resolve(__dirname, '../mcp-server/index.ts'),
      ],
    },
  });

  console.log('Conecting to MCP Server and loading tools...');
  const tools = await mcpClient.getTools();

  console.log(`Tools loaded: ${tools.map((t) => t.name).join(", ")}`);

  const model = new ChatBedrockConverse({
    model: 'anthropic.claude-3-5-sonnet-20240620-v1:0',
    region: 'us-east-1',
    temperature: 0,
    maxTokens: 4096,
  }).bindTools(tools);

  async function callModel(state: typeof MessagesAnnotation.State) {
    const response = await model.invoke(state.messages);
    return { messages: [response] };
  }

  const toolNode = new ToolNode(tools);

  function shouldContinue(state: typeof MessagesAnnotation.State) {
    const lastMessage = state.messages[state.messages.length - 1] as AIMessage;

    if (lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
      return 'tools';
    }

    return '__end__';
  }

  const workflow = new StateGraph(MessagesAnnotation)
    .addNode('agent', callModel)
    .addNode('tools', toolNode)
    .addEdge('__start__', 'agent')
    .addConditionalEdges('agent', shouldContinue, { tools: 'tools', __end__: '__end__' })
    .addEdge('tools', 'agent');

  const app = workflow.compile({ checkpointer: new MemorySaver() });

  return app;
}

let agentInstance: any = null;

export async function getAgentInstance() {
  if (agentInstance) return agentInstance;

  agentInstance = await createAgent();

  console.log('Agent instance ready!');
  return agentInstance;
}