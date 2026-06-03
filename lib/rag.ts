import { openai } from '@ai-sdk/openai';
import { embed, embedMany } from 'ai';
import { datingTips } from './knowledge';

// Simple cosine similarity
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magA * magB);
}

export async function getRelevantTips(query: string, limit = 2) {
  try {
    // 1. Get embedding for the query
    const { embedding: queryEmbedding } = await embed({
      model: openai.embedding('text-embedding-3-small'),
      value: query,
    });

    // 2. Get embeddings for all tips (in a real app, these would be pre-calculated and stored)
    const { embeddings: tipEmbeddings } = await embedMany({
      model: openai.embedding('text-embedding-3-small'),
      values: datingTips.map(tip => `${tip.category}: ${tip.title}. ${tip.content}`),
    });

    // 3. Calculate similarities
    const results = datingTips.map((tip, index) => ({
      ...tip,
      similarity: cosineSimilarity(queryEmbedding, tipEmbeddings[index]),
    }));

    // 4. Sort and return top matches
    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  } catch (error) {
    console.error('Error in getRelevantTips:', error);
    return [];
  }
}
