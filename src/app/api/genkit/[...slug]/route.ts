import {genkit} from '@/ai/genkit';
import {toNextRequest, fromNextResponse} from '@genkit-ai/next';

export async function POST(req: Request) {
  const nextRequest = await toNextRequest(req);
  const genkitResponse = await genkit.handleRequest(nextRequest);
  return fromNextResponse(genkitResponse);
}
