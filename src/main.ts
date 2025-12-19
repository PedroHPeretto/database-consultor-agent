import express from 'express';
import cors from 'cors';
import { HumanMessage } from '@langchain/core/messages';
import { AgentApp, getAgentInstance } from './agent';

const app = express()

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT

let agent: AgentApp | null = null

async function initializeServer() {
  try {
    console.log('Initializing Agent and MCP tools...');
    
    agent = await getAgentInstance();
    console.log('Agent ready...');
    
    app.listen(PORT, () => {
      console.log(`Server running on port: ${PORT}`)
    })
  } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  }
}

app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

app.get('/', (req, res) => {
  return res.status(200).json({ message: ':)' });
})

app.post('/chat', async (req, res) => {
  const { question, threadId } = req.body;

  if (!question || !threadId) {
    console.error(`Missing question or thread ID on request`);
    res.status(400).json({ error: 'Missing question or thread ID' });
  }

  try {;
    if (!agent) {
      agent = await getAgentInstance();
    }

    const config = {
      configurable: { thread_id: threadId },
    };

    const finalState = await agent.invoke(
      { messages: [new HumanMessage(question)] },
      config,
    );

    const lastMessage = finalState.messages[finalState.messages.length - 1];

    const content = lastMessage.content || "";

    let cleanResponse = '';

    if (typeof content === 'string') {
      cleanResponse = content.trim();
    } else if (Array.isArray(content)) {
      cleanResponse = content.map((c) => c.text || '').join(' ').trim();
    }

    return res.status(200).json({ response: cleanResponse });
  } catch (error: any) {
    console.error('Error on process question:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

app.get('/health', (req, res) => {
  try {
    return res.status(200).json({ status: 'ok', agent_status: agent ? 'ready' : 'initializing' });
  } catch (error: any) {
    console.error('Error on check Agent health:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

initializeServer();