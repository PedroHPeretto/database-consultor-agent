import request from "supertest";

jest.mock('./agent', () => ({
  getAgentInstance: jest.fn(),
}));

import { getAgentInstance } from "./agent";
import { app } from "./main";

describe('POST /chat', () => {
  const mockInvoke = jest.fn();

  beforeAll(() => {
    (getAgentInstance as jest.Mock).mockResolvedValue({
      invoke: mockInvoke,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Should return status code 200 and agent response', async () => {
    mockInvoke.mockResolvedValue({
      messages: [{ content: 'Testing...' }],
    });

    const response = await request(app)
      .post('/chat')
      .send({
        question: 'Test',
        threadId: 'test-123',
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ response: 'Testing...' });
    expect(mockInvoke).toHaveBeenCalled();
  });

  it('Should return an error with status code 400 on bad requests', async () => {
    const response = await request(app)
      .post('/chat')
      .send({
        question: 'Only question',
      });
    
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Missing question or thread ID' });
  });

  it('Should handle erros properly', async () => {
    mockInvoke.mockRejectedValue(new Error('AWS Bedrock exploded'));

    const response = await request(app)
      .post('/chat')
      .send({
        question: 'Test',
        threadId: 'test-123',
      });
    
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Internal Server Error');
      expect(response.body).toHaveProperty('details');
  })
});