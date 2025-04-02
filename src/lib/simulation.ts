import type { SimulationInput, SimulationResult } from "@/lib/types";
import OpenAI from "openai";

/**
 * Generates 10 high-impact solutions based on company info and market challenge
 */
async function generateBusinessScenarios(
	client: OpenAI,
	input: SimulationInput,
): Promise<string> {
	const prompt = `Based on the following company information and market challenge, generate 10 high-impact solutions for market entry. Each solution should represent a distinct approach to entering the market.

Company Information:
${input.companyInfo}

Market Challenge:
${input.marketChallenge}

Generate 10 different solutions that include:
1. A unique title and description
2. Key advantages of this approach
3. Potential challenges or risks
4. Estimated timeline for implementation
5. Required resources or investments

Format each solution clearly with:
- A numbered heading (e.g., "Solution 1: [Title]")
- Clear sections for description, advantages, challenges, timeline, and resources
- Bullet points for lists

IMPORTANT: Focus on providing clear, detailed solutions without any JSON formatting.`;

	try {
		const response = await client.chat.completions.create({
			model: "gpt-4",
			messages: [
				{
					role: "system",
					content:
						"You are a strategic business consultant specializing in market entry strategies. Provide detailed, practical solutions that consider both opportunities and risks.",
				},
				{ role: "user", content: prompt },
			],
			temperature: 0.7,
		});

		return response.choices[0].message.content || "No solutions generated";
	} catch (error) {
		console.error("Error generating business scenarios:", error);
		throw new Error("Failed to generate business scenarios");
	}
}

/**
 * Generates 6 market personas (3 current + 3 new) based on company info and market challenge
 */
async function generateMarketPersonas(
	client: OpenAI,
	input: SimulationInput,
): Promise<string> {
	const prompt = `Based on the following company information and market challenge, generate 6 detailed market personas. Include 3 personas from the current target audience and 3 from potential new audiences.

Company Information:
${input.companyInfo}

Market Challenge:
${input.marketChallenge}

Generate 6 personas that include:
1. Basic information (name, age, occupation)
2. Background and context
3. Key characteristics
4. Goals and objectives
5. Pain points and challenges
6. Tech savviness level
7. Market segment (Early Adopter or Mainstream)
8. Adoption likelihood (0-1)

Format each persona clearly with:
- A numbered heading (e.g., "Persona 1: [Name]")
- Clear sections for each piece of information
- Bullet points for lists
- Include their market segment and adoption likelihood at the top
- Clearly label which personas are from current audience vs. new audiences

IMPORTANT: Focus on providing clear, detailed personas without any JSON formatting.`;

	try {
		const response = await client.chat.completions.create({
			model: "gpt-4",
			messages: [
				{
					role: "system",
					content:
						"You are a market research expert specializing in user personas. Create detailed, realistic personas that represent different market segments.",
				},
				{ role: "user", content: prompt },
			],
			temperature: 0.7,
		});

		return response.choices[0].message.content || "No personas generated";
	} catch (error) {
		console.error("Error generating market personas:", error);
		throw new Error("Failed to generate market personas");
	}
}

/**
 * Main simulation function that orchestrates the multi-step process
 */
export async function runSimulation(
	input: SimulationInput,
): Promise<SimulationResult> {
	const client = new OpenAI({
		apiKey: input.apiKey,
	});

	try {
		// Step 1: Generate 10 high-impact solutions
		const scenarios = await generateBusinessScenarios(client, input);

		// Step 2: Generate 6 market personas (3 current + 3 new)
		const personas = await generateMarketPersonas(client, input);

		// For now, return a placeholder for feedback
		const feedback =
			"Feedback and analysis will be generated in the next phase.";

		return {
			scenarios,
			personas,
			feedback,
		};
	} catch (error) {
		console.error("Simulation error:", error);
		throw new Error("Failed to run simulation");
	}
}
