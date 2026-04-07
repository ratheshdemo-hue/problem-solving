function clampScore(score) {
  const numericScore = Number(score);

  if (!Number.isFinite(numericScore)) {
    return 5;
  }

  return Math.min(10, Math.max(1, Math.round(numericScore)));
}

export function buildMockEvaluation(answer, problemTitle) {
  const answerLength = answer.trim().length;
  const baseScore = Math.min(10, Math.max(3, Math.ceil(answerLength / 80) + 3));

  return {
    score: clampScore(baseScore),
    feedback:
      answerLength > 120
        ? `Mock evaluation: the response to "${problemTitle}" is reasonably detailed, but you should still check the logic and clarity.`
        : `Mock evaluation: the response to "${problemTitle}" is short. Add more steps or reasoning to improve it.`,
    source: "mock",
  };
}

function normalizeEvaluation(payload, fallback) {
  return {
    score: clampScore(payload?.score ?? fallback.score),
    feedback: String(payload?.feedback || fallback.feedback).trim(),
    source: payload?.source || fallback.source,
  };
}

async function requestOpenAIEvaluation({ answer, problemTitle, problemDescription }) {
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const endpoint =
    process.env.AZURE_OPENAI_ENDPOINT ||
    "https://tech-mnoei7r2-swedencentral.cognitiveservices.azure.com/";
  const deployment =
    process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o";
  const apiVersion =
    process.env.AZURE_OPENAI_API_VERSION || "2024-10-21";

  if (!apiKey || !endpoint || !deployment) {
    throw new Error("Missing Azure OpenAI configuration.");
  }

  const prompt = `
You are evaluating a student's answer in a workshop.
Return valid JSON with exactly these keys:
- score: integer from 1 to 10
- feedback: short feedback in 1 or 2 sentences

Problem title: ${problemTitle}
Problem description: ${problemDescription || "No description provided."}
Student answer: ${answer}
  `.trim();

  const normalizedEndpoint = endpoint.endsWith("/")
    ? endpoint.slice(0, -1)
    : endpoint;
  const requestUrl =
    `${normalizedEndpoint}/openai/deployments/${deployment}` +
    `/chat/completions?api-version=${apiVersion}`;

  const response = await fetch(requestUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Evaluate student answers fairly and briefly. Always return JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error("Azure OpenAI evaluation request failed.");
  }

  const result = await response.json();
  const content = result.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("OpenAI evaluation response was empty.");
  }

  return JSON.parse(content);
}

export async function evaluateAnswer({ answer, problemTitle, problemDescription }) {
  const mockEvaluation = buildMockEvaluation(answer, problemTitle);

  if (!process.env.AZURE_OPENAI_API_KEY) {
    return mockEvaluation;
  }

  try {
    const liveEvaluation = await requestOpenAIEvaluation({
      answer,
      problemTitle,
      problemDescription,
    });

    return normalizeEvaluation(
      {
        ...liveEvaluation,
        source: "llm",
      },
      mockEvaluation
    );
  } catch {
    return mockEvaluation;
  }
}
