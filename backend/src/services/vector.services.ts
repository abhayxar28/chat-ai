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
  try {
    if (!vectors || !Array.isArray(vectors) || vectors.length === 0) {
      return;
    }

    if (!messageId) {
      return;
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
  } catch (error) {
    console.error("[Vector] Error creating memory:", error);
    // Silently fail - vector memory is optional
  }
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
  try {
    const data = await chatgptIndex.query({
      vector: queryVector,
      topK: limit,
      filter: metadata,
      includeMetadata: true,
    });

    return data.matches ?? [];
  } catch (error) {
    console.error("[Vector] Error querying memory:", error);
    // Return empty array on error - vector memory is optional
    return [];
  }
}