import { userProfile } from "@/lib/ai/profile";
import type { JobInput } from "@/lib/types";

type LLMMatchResult = {
  summary: string;
  reasoning: string;
};

export async function enhanceJobNarrative(job: JobInput): Promise<LLMMatchResult | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        temperature: 0.2,
        response_format: {
          type: "json_object"
        },
        messages: [
          {
            role: "system",
            content:
              "You score jobs for a single candidate. Return JSON with keys summary and reasoning. summary must be one sentence. reasoning must be a tight explanation under 45 words."
          },
          {
            role: "user",
            content: JSON.stringify({
              user_profile_memory: userProfile.memory,
              job
            })
          }
        ]
      })
    });

    if (!response.ok) {
      return null;
    }

    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = json.choices?.[0]?.message?.content;
    if (!content) {
      return null;
    }

    const parsed = JSON.parse(content) as LLMMatchResult;
    if (!parsed.summary || !parsed.reasoning) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}
