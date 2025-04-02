import type { SimulationInput, SimulationResult } from "@/lib/types";
import OpenAI from "openai";

/**
 * Generates 5 high-impact solutions based on company info and market challenge
 */
async function generateBusinessScenarios(
	client: OpenAI,
	input: SimulationInput,
): Promise<string> {
	const prompt = `Based on the following company information and market challenge, generate 5 high-impact solutions for market entry. Each solution should represent a distinct approach to entering the market.

Company Information:
${input.companyInfo}

Market Challenge:
${input.marketChallenge}

Generate 5 different solutions that include:
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
 * Generates feedback and risk analysis from personas for each solution
 */
async function generatePersonaFeedback(
	client: OpenAI,
	solutions: string,
	personas: string,
	input: SimulationInput,
): Promise<string> {
	const prompt = `Based on the following solutions and personas, generate detailed feedback and risk analysis for each solution. You MUST analyze ALL solutions completely.

SOLUTIONS:
${solutions}

PERSONAS:
${personas}

For EACH of the 5 solutions, provide a complete analysis following this structure:

1. Solution Analysis Header:
   "Analysis for Solution [N]: [Title]"

2. Risk Score (0-100%) with breakdown:
   - Market readiness
   - Resource requirements
   - Competitive landscape
   - Technical complexity
   - Regulatory considerations

3. Persona Feedback for ALL 6 personas:
   For each persona (both current and new):
   - Initial reaction and sentiment
   - Key concerns or reservations
   - Potential benefits they see
   - Likelihood of adoption (0-1)
   - Suggested improvements from their perspective

4. Overall Analysis:
   - Primary risks and mitigation strategies
   - Key success factors
   - Recommended implementation approach
   - Timeline considerations
   - Resource requirements

5. Solution Comparison:
   After analyzing all 5 solutions, provide:
   - Ranking of solutions by risk score (lowest to highest)
   - Ranking of solutions by overall potential (highest to lowest)
   - Key differentiators between solutions
   - Recommendations for implementation priority

Format Requirements:
- Use clear headings and subheadings
- Use bullet points for lists
- Separate each solution's analysis with "---"
- Include ALL 5 solutions in the analysis
- End with a comprehensive comparison of all solutions

IMPORTANT: 
- You MUST analyze ALL 5 solutions completely
- Do not skip any solutions
- Provide the full analysis for each solution before moving to the next
- Include the final comparison section after all individual analyses`;

	try {
		const response = await client.chat.completions.create({
			model: "gpt-4",
			messages: [
				{
					role: "system",
					content:
						"You are a market research expert analyzing solution viability and persona reactions. Provide detailed, realistic feedback and risk analysis for ALL solutions. Do not skip any solutions.",
				},
				{ role: "user", content: prompt },
			],
			temperature: 0.7,
			max_tokens: 4000, // Increased token limit to ensure complete analysis
		});

		return response.choices[0].message.content || "No feedback generated";
	} catch (error) {
		console.error("Error generating persona feedback:", error);
		throw new Error("Failed to generate persona feedback");
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
		// Step 1: Generate 5 high-impact solutions
		const scenarios = await generateBusinessScenarios(client, input);

		// Step 2: Generate 6 market personas (3 current + 3 new)
		const personas = await generateMarketPersonas(client, input);

		// Step 3: Generate feedback and risk analysis for each solution
		const feedback = await generatePersonaFeedback(
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
