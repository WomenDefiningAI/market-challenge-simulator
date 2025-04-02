import OpenAI from "openai";
import type { SimulationInput } from "./types";

/**
 * Generates business scenarios based on company info and market challenge
 */
async function generateBusinessScenarios(
	client: OpenAI,
	input: SimulationInput,
): Promise<string> {
	const prompt = `Based on the following company information and market challenge, generate 3 different business scenarios for market entry. Each scenario should represent a distinct approach to entering the market.

Company Information:
${input.companyInfo}

Market Challenge:
${input.marketChallenge}

Generate 3 different scenarios that include:
1. A unique title and description
2. Key advantages of this approach
3. Potential challenges or risks
4. Estimated timeline for implementation
5. Required resources or investments

Format each scenario clearly with:
- A numbered heading (e.g., "Scenario 1: [Title]")
- Clear sections for description, advantages, challenges, timeline, and resources
- Bullet points for lists

IMPORTANT: Focus on providing clear, detailed scenarios without any JSON formatting.`;

	try {
		const response = await client.chat.completions.create({
			model: "gpt-4",
			messages: [
				{
					role: "system",
					content:
						"You are a strategic business consultant specializing in market entry strategies. Provide detailed, practical scenarios that consider both opportunities and risks.",
				},
				{ role: "user", content: prompt },
			],
			temperature: 0.7,
		});

		return response.choices[0].message.content || "No scenarios generated";
	} catch (error) {
		console.error("Error generating business scenarios:", error);
		throw new Error("Failed to generate business scenarios");
	}
}

/**
 * Generates market personas based on company info and market challenge
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
 * Generates feedback from personas for each business scenario
 */
async function generateScenarioFeedback(
	client: OpenAI,
	scenarios: string,
	personas: string,
	input: SimulationInput,
): Promise<string> {
	const prompt = `Based on the following scenarios and personas, generate detailed feedback about how each persona would react to each proposed market entry strategy.

SCENARIOS:
${scenarios}

PERSONAS:
${personas}

For each persona, analyze their reaction to each scenario, including:
1. Initial reaction to the scenario
2. Specific concerns or worries
3. Likely use cases
4. Suggested improvements
5. Expected adoption timeframe
6. Price expectations
7. Overall sentiment (positive, neutral, or negative)

Format the feedback clearly with:
- A heading for each persona (e.g., "Feedback from [Persona Name]")
- Subheadings for each scenario (e.g., "Reaction to [Scenario Title]")
- Clear sections for each type of feedback
- Bullet points for lists

IMPORTANT: Focus on providing clear, detailed feedback without any JSON formatting.`;

	try {
		const response = await client.chat.completions.create({
			model: "gpt-4",
			messages: [
				{
					role: "system",
					content:
						"You are a market research expert analyzing how different personas would react to business scenarios. Provide detailed, realistic feedback.",
				},
				{ role: "user", content: prompt },
			],
			temperature: 0.7,
		});

		return response.choices[0].message.content || "No feedback generated";
	} catch (error) {
		console.error("Error generating scenario feedback:", error);
		throw new Error("Failed to generate scenario feedback");
	}
}

/**
 * Main simulation function that orchestrates the multi-step process
 */
export async function runSimulation(input: SimulationInput): Promise<{
	scenarios: string;
	personas: string;
	feedback: string;
}> {
	const client = new OpenAI({
		apiKey: input.apiKey,
	});

	try {
		// Step 1: Generate business scenarios
		const scenarios = await generateBusinessScenarios(client, input);

		// Step 2: Generate market personas
		const personas = await generateMarketPersonas(client, input);

		// Step 3: Generate feedback for each scenario-persona combination
		const feedback = await generateScenarioFeedback(
			client,
			scenarios,
			personas,
			input,
		);

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
