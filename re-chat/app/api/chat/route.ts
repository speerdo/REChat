import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { DataAPIClient } from "@datastax/astra-db-ts";

const {
  OPENAI_API_KEY,
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_API_TOKEN,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_COLLECTION,
} = process.env;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

const client = new DataAPIClient(ASTRA_DB_API_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, {namespace: ASTRA_DB_NAMESPACE});

export async function POST(req: Request) {

  try {
    const { messages } = await req.json();
    const lastUserMessage = messages[messages.length - 1];
    
    let docContext = '';
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: lastUserMessage.content,
      encoding_format: 'float',
    });

    try {
      const collection = await db.collection(ASTRA_DB_COLLECTION);
      const cursor = collection.find(null, {
        sort: {
          $vector: embeddingResponse.data[0].embedding,
        },
        limit: 10,
      });

      const docs = await cursor.toArray();
      const docsMap = docs.map((doc) => doc.content).join('\n');
      docContext = docsMap;
      console.log('docContext', docContext);
    } catch (error) {
      console.error('Error fetching context from Astra DB:', error);
      docContext = 'No context found';
    }

    const template = {
      role: 'system',
      content: `
      You are a helpful assistant that can answer questions and help with tasks related to Real Estate in Hamilton County, Indiana. The context will provide the most recent data available on the housing market in the area. If the context
      doesn't include the information you need please answer based on your existing knowledge and don't mention the source 
      of the information. Format your responses with markedown where appropriate and don't return images.
      Here is some context that might be relevant to the conversation:
      ${docContext}
      END CONTEXT

      QUESTION: ${lastUserMessage.content}
      `,
    };

    const allMessages = [template, ...messages];

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: allMessages,
      stream: true,
    });

    // @ts-expect-error - Type compatibility issue between ai and OpenAI packages
    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
    
  } catch (error) {
    console.error('Error in chat API:', error);
    return new Response('Error', { status: 500 });
  }
}
