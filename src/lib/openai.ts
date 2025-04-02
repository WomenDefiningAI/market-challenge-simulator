import OpenAI from "openai";
import type { SimulationInput } from "./types";

export class OpenAIError extends Error {
	constructor(
		message: string,
		public readonly code?: string,
	) {
		super(message);
		this.name = "OpenAIError";
	}
}

export async function analyzeMarket(input: SimulationInput): Promise<string> {
	try {
		const client = new OpenAI({
			apiKey: input.apiKey,
		});

		const prompt = `Analyze this market entry opportunity and create 5 unique detailed personas:

Company Information:
${input.companyInfo}

Market Entry Challenge:
${input.marketChallenge}

Please provide your analysis in the following format:

MARKET PERSONAS
1. Early Adopter - [Name] (Part of 15% early adopter segment)
- Age: [age]
- Occupation: [specific job title]
- Background: [2-3 sentences about their context]
- Key Characteristics:
  * [characteristic 1]
  * [characteristic 2]
  * [characteristic 3]
- Goals: [comma-separated list]
- Pain Points: [comma-separated list]
- Adoption Likelihood: [percentage]

2. Early Adopter - [Different Name] (Part of 15% early adopter segment)
[Same structure as above with different details]

3. Mainstream - [Different Name] (Part of 60% mainstream segment)
[Same structure as above with different details]

4. Mainstream - [Different Name] (Part of 60% mainstream segment)
[Same structure as above with different details]

5. Mainstream - [Different Name] (Part of 60% mainstream segment)
[Same structure as above with different details]

STRATEGIC RECOMMENDATIONS
1. [First recommendation based on persona insights]
2. [Second recommendation based on persona insights]
3. [Third recommendation based on persona insights]

ADOPTION TIMELINE
Month 1: [adoption rate]% - Early Adopters
Month 3: [adoption rate]% - Early Adopters
Month 6: [adoption rate]% - Early Adopters + Early Mainstream
Month 12: [adoption rate]% - Full Mainstream Adoption

Please ensure each persona is unique with distinct characteristics, goals, and pain points that represent different aspects of their market segment.`;

		const response = await client.chat.completions.create({
			model: "gpt-4o",
			messages: [{ role: "user", content: prompt }],
			temperature: 0.7,
		});

		if (!response.choices[0]?.message?.content) {
			throw new OpenAIError("No response content received");
		}

		return response.choices[0].message.content;
	} catch (error) {
		return handleOpenAIError(error);
	}
}

function handleOpenAIError(error: unknown): never {
	console.error("OpenAI API Error:", error);

	if (error instanceof OpenAI.APIError) {
		// Handle specific OpenAI API errors
		switch (error.status) {
			case 401:
				throw new OpenAIError("Invalid API key", "INVALID_API_KEY");
			case 429:
				throw new OpenAIError("Rate limit exceeded", "RATE_LIMIT_EXCEEDED");
			case 500:
				throw new OpenAIError("OpenAI service error", "SERVICE_ERROR");
			default:
				throw new OpenAIError(
					`OpenAI API error: ${error.message}`,
					"API_ERROR",
				);
		}
	}

	if (error instanceof OpenAIError) {
		throw error; // Re-throw OpenAIError instances as is
	}

	// Handle other errors
	throw new OpenAIError(
		error instanceof Error ? error.message : "Unknown error occurred",
		"UNKNOWN_ERROR",
	);
}
