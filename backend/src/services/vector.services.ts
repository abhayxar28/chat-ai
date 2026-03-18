import { Pinecone } from "@pinecone-database/pinecone";

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const chatgptIndex = pc.index("cohot-chatgpt");

interface CreateMemoryParams {
  vectors: number[];
  metadata?: Record<string, any>;
  messageId: string;
}

export async function createMemory({
  vectors,
  metadata,
  messageId,
}: CreateMemoryParams) {
  if (!vectors || !Array.isArray(vectors) || vectors.length === 0) {
    throw new Error("Invalid vectors");
  }

  if (!messageId) {
    throw new Error("messageId is required");
  }

  await chatgptIndex.upsert({
    records: [
        {
            id: String(messageId),
            values: vectors,
            metadata
        }
    ]
  });
}

interface QueryMemoryParams {
  queryVector: number[];
  limit?: number;
  metadata?: Record<string, any>;
}

export async function queryMemory({
  queryVector,
  limit = 5,
  metadata,
}: QueryMemoryParams) {
  const data = await chatgptIndex.query({
    vector: queryVector,
    topK: limit,
    filter: metadata,
    includeMetadata: true,
  });

  return data.matches ?? [];
}