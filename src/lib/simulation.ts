import type { SimulationInput, SimulationResult } from "@/lib/types";
import { OpenAI } from "openai";

/**
 * Generates business scenarios based on company info and market challenge
 */
async function generateBusinessScenarios(
	client: OpenAI,
	input: SimulationInput,
): Promise<string> {
	const prompt = `Based on the following company information and market challenge, generate 5 high-impact solutions.

Company Information:
${input.companyInfo}

Market Challenge:
${input.marketChallenge}

Generate 5 different solutions with varying approaches, risk levels, and perspectives. Format each solution as follows:

Solution 1: [Title]
- Description: [One paragraph summary]
- Advantages: [List major benefits]
- Challenges: [List potential obstacles]
- Target market: [Primary audience]
- Innovation level: [Incremental/Moderate/Disruptive]

Continue for Solution 2, 3, 4, and 5.

Ensure the solutions vary in risk profile, market approach, and innovation level.`;

	try {
		const response = await client.chat.completions.create({
			model: "gpt-4",
			messages: [
				{
					role: "system",
					content:
						"You are a strategic business consultant generating creative but practical solutions for market challenges.",
				},
				{ role: "user", content: prompt },
			],
			temperature: 0.7,
		});

		return response.choices[0].message.content || "No scenarios generated";
	} catch (error: unknown) {
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

Generate 6 personas following this EXACT format:

[PERSONA_START]
**Persona 1: [Full Name] (Current Audience)**
- Basic Information: [Full Name], [Age], [Specific Job Title/Role]
- Background and Context: [2-3 sentences describing their situation]
- Key Characteristics: [3-5 bullet points of personality traits]
- Goals and Objectives: [What they want to achieve]
- Pain Points and Challenges: [What problems they face]
- Tech Savviness Level: [High/Medium/Low]
- Market Segment: [Early Adopter/Mainstream]
- Adoption Likelihood: [0-1, to one decimal place]
[PERSONA_END]

Repeat the [PERSONA_START]...[PERSONA_END] format for all 6 personas.

IMPORTANT:
1. Make the first 3 personas from current audience and the next 3 from new potential audiences
2. Include FULL NAME, AGE, and SPECIFIC ROLE for each persona
3. Make personas diverse and realistic with specific details
4. Give detailed background context that explains their relationship to the product/market
5. Format EXACTLY as shown with the delimiter tags`;

	try {
		const response = await client.chat.completions.create({
			model: "gpt-4",
			messages: [
				{
					role: "system",
					content:
						"You are a market research expert specializing in user personas. Create detailed, realistic personas that represent different market segments. Follow the specified format exactly.",
				},
				{ role: "user", content: prompt },
			],
			temperature: 0.7,
		});

		return response.choices[0].message.content || "No personas generated";
	} catch (error: unknown) {
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

For EACH of the 5 solutions, provide a complete analysis following this EXACT format:

[SOLUTION_ANALYSIS_START]
Analysis for Solution [N]: [Title]

Risk Score: [0-100]%
- Market readiness: [0-100]% ([brief explanation])
- Resource requirements: [0-100]% ([brief explanation])
- Competitive landscape: [0-100]% ([brief explanation])
- Technical complexity: [0-100]% ([brief explanation])
- Regulatory considerations: [0-100]% ([brief explanation])

[PERSONA_FEEDBACK_START]
**[Persona Name]:**
- Initial reaction: [Positive/Neutral/Negative]. 
- Key concerns: [Write a clear concern that this persona would have, written from an analytical perspective]
- Potential benefits: [Write a clear benefit that this persona would see in this solution, written from an analytical perspective]
- Likelihood of adoption: [0-1]
- Suggested improvements: [What this persona would suggest to improve the solution]

**[First Person Quote]:** "[Write a DIRECT FIRST-PERSON QUOTE as if the persona is speaking directly - this should sound like something a real person would say, not an analysis. Example: 'I really like how this solution addresses my need for better scheduling tools, but I'm concerned about the learning curve.']"
[PERSONA_FEEDBACK_END]

Repeat the [PERSONA_FEEDBACK_START]...[PERSONA_FEEDBACK_END] section for EACH persona.

Overall Analysis:
- Primary risks: [list key risks]
- Mitigation strategies: [list strategies]
- Key success factors: [list factors]
- Recommended implementation approach: [approach]
- Timeline considerations: [timeframe]
- Resource requirements: [resources needed]
[SOLUTION_ANALYSIS_END]

Repeat the entire [SOLUTION_ANALYSIS_START]...[SOLUTION_ANALYSIS_END] block for each solution.

After analyzing all solutions, provide:

[COMPARISON_START]
Solution Comparison:
- Ranking of solutions by risk score (lowest to highest): [ordered list]
- Ranking of solutions by overall potential (highest to lowest): [ordered list]
- Key differentiators between solutions: [list differences]
- Recommendations for implementation priority: [ordered list]
[COMPARISON_END]

IMPORTANT REQUIREMENTS: 
1. You MUST analyze ALL solutions completely
2. Format EXACTLY as shown with the delimiter tags
3. EVERY persona MUST have a direct first-person quote that sounds authentic
4. Quotes should be specific to the solution and the persona's background
5. Use REALISTIC first-person language for quotes, not analytical summaries
6. Include the persona's NAME, AGE, and ROLE in the analysis
7. Make the quotes varied and diverse - some positive, some with concerns
8. Do NOT use generic quotes - be specific to solution features and persona needs`;

	try {
		const response = await client.chat.completions.create({
			model: "gpt-4",
			messages: [
				{
					role: "system",
					content:
						"You are a market research expert analyzing solution viability and persona reactions. Your task is to provide detailed, realistic feedback including authentic-sounding first-person quotes from each persona. Make each quote specific to the solution features and the persona's background. Format your response exactly as specified with the delimiter tags.",
				},
				{ role: "user", content: prompt },
			],
			temperature: 0.7,
			max_tokens: 4000, // Increased token limit to ensure complete analysis
		});

		return response.choices[0].message.content || "No feedback generated";
	} catch (error: unknown) {
		console.error("Error generating persona feedback:", error);
		throw new Error("Failed to generate persona feedback");
	}
}

/**
 * Main function to run the simulation process
 */
export async function runSimulation(
	input: SimulationInput,
): Promise<SimulationResult> {
	try {
		// Create OpenAI client with the provided API key
		const client = new OpenAI({
			apiKey: input.apiKey,
		});

		// Generate business scenarios
		const scenarios = await generateBusinessScenarios(client, input);

		// Generate market personas
		const personas = await generateMarketPersonas(client, input);

		// Generate persona feedback for the scenarios
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
	} catch (error: unknown) {
		console.error("Error running simulation:", error);
		throw error;
	}
}
