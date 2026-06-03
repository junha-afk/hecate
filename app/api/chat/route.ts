import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { getRelevantTips } from '@/lib/rag';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();
  const lastMessage = messages[messages.length - 1].content;

  // 1. Get RAG context
  const relevantTips = await getRelevantTips(lastMessage);
  const ragContext = relevantTips
    .map(tip => `[관련 팁: ${tip.title}] ${tip.content}`)
    .join('\n');

  const systemPrompt = `
당신은 한국 대학생들을 위한 최고의 연애 조언자 '연애 고수 선배'입니다.
말투는 친근하고 든든한 선배(형/오빠 또는 누나/언니)처럼 해주세요.
상대방이 소개팅, 과팅, 미팅, 썸 등 연애 관련 고민을 털어놓으면 실질적이고 구체적인 조언을 해줍니다.

[참고 정보]
${ragContext}

[지침]
1. 항상 한국어로 대답하세요.
2. 필요하다면 Tavily 검색을 통해 최신 맛집이나 데이트 코스를 추천해주세요.
3. 조언은 현실적이어야 하며, 대학생들의 상황(학생 식당, 자취방, 과제, 시험 기간 등)을 잘 이해하고 있어야 합니다.
4. 카카오톡 대화처럼 너무 길지 않고 자연스럽게 대답해주세요.
`;

  const result = await streamText({
    model: openai('gpt-4o-mini'),
    system: systemPrompt,
    messages,
    maxSteps: 3,
    tools: {
      searchTavily: {
        description: '한국의 최신 데이트 장소, 맛집, 트렌드 등을 검색합니다.',
        parameters: z.object({
          query: z.string().describe('검색할 내용 (예: "홍대 소개팅 맛집", "요즘 유행하는 데이트 코스")'),
        }),
        execute: async ({ query }: { query: string }) => {
          const response = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              api_key: process.env.TAVILY_API_KEY,
              query: query,
              search_depth: 'basic',
              include_answer: true,
              max_results: 5,
            }),
          });
          const data = await response.json();
          return data;
        },
      } as any,
    },
  } as any);

  return (result as any).toDataStreamResponse();
}
