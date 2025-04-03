import type {
	CompletionEvent,
	ErrorEvent,
	FeedbackScoresEvent,
	ParsedPersona,
	ParsedQuote,
	ParsedSimulationResult,
	ParsedSolution,
	PersonaSummaryEvent,
	ScenarioTitlesEvent,
	SimulationInput,
	SimulationResult,
	SimulationStreamEvent,
	StageUpdateEvent,
} from "@/lib/types";
import { OpenAI } from "openai";

// --- Prompts (Extracted for clarity) ---

const GENERATE_SCENARIOS_PROMPT = (input: SimulationInput) =>
	`Based on the following company information and market challenge, generate 5 high-impact solutions.

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

const GENERATE_PERSONAS_PROMPT = (input: SimulationInput) =>
	`Based on the following company information and market challenge, generate 6 detailed market personas. Include 3 personas from the current target audience and 3 from potential new audiences.

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

const GENERATE_FEEDBACK_PROMPT = (
	solutions: string,
	personas: string,
	input: SimulationInput, // Keep input for potential future use in prompt
) =>
	`Based on the following solutions and personas, generate detailed feedback and confidence analysis for each solution. You MUST analyze ALL solutions completely.

SOLUTIONS:
${solutions}

PERSONAS:
${personas}

For EACH of the 5 solutions, provide a complete analysis following this EXACT format:

[SOLUTION_ANALYSIS_START]
Analysis for Solution [N]: [Title]

Confidence Scores:
- Feasibility Score: [0-100]% ([brief explanation of feasibility])
- Return Score: [0-100]% ([brief explanation of potential return])
- Market readiness: [0-100]% ([brief explanation])
- Resource requirements: [0-100]% ([brief explanation])
- Competitive advantage: [0-100]% ([brief explanation])
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
- Primary strengths: [list key strengths]
- Primary challenges: [list key challenges]
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
- Ranking of solutions by feasibility (highest to lowest): [ordered list]
- Ranking of solutions by return potential (highest to lowest): [ordered list]
- Key differentiators between solutions: [list differences]
- Recommendations for implementation priority: [ordered list]
[COMPARISON_END]

IMPORTANT REQUIREMENTS:
1. You MUST analyze ALL solutions completely
2. Format EXACTLY as shown with the delimiter tags
3. The Feasibility Score should reflect how feasible/practical the solution is to implement (higher is better)
4. The Return Score should reflect the potential return on investment (higher is better)
5. EVERY persona MUST have a direct first-person quote that sounds authentic
6. Quotes should be specific to the solution and the persona's background
7. Use REALISTIC first-person language for quotes, not analytical summaries
8. Include the persona's NAME, AGE, and ROLE in the analysis
9. Make the quotes varied and diverse - some positive, some with concerns
10. Do NOT use generic quotes - be specific to solution features and persona needs`;

// --- Configuration ---
const OPENAI_MODEL = "gpt-4o"; // Changed from gpt-4
const OPENAI_TEMPERATURE = 0.7;
const MAX_TOKENS_FEEDBACK = 4000; // Keep definition even if not used by callOpenAI for now

/**
 * Generates business scenarios based on company info and market challenge
 */
async function generateBusinessScenarios(
	client: OpenAI,
	input: SimulationInput,
): Promise<string> {
	const prompt = GENERATE_SCENARIOS_PROMPT(input);

	try {
		const response = await client.chat.completions.create({
			model: OPENAI_MODEL,
			messages: [
				{
					role: "system",
					content:
						"You are a strategic business consultant generating creative but practical solutions for market challenges.",
				},
				{ role: "user", content: prompt },
			],
			temperature: OPENAI_TEMPERATURE,
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
	const prompt = GENERATE_PERSONAS_PROMPT(input);

	try {
		const response = await client.chat.completions.create({
			model: OPENAI_MODEL,
			messages: [
				{
					role: "system",
					content:
						"You are a market research expert specializing in user personas. Create detailed, realistic personas that represent different market segments. Follow the specified format exactly.",
				},
				{ role: "user", content: prompt },
			],
			temperature: OPENAI_TEMPERATURE,
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
	const prompt = GENERATE_FEEDBACK_PROMPT(solutions, personas, input);

	try {
		const response = await client.chat.completions.create({
			model: OPENAI_MODEL,
			messages: [
				{
					role: "system",
					content:
						"You are a market research expert analyzing solution viability and persona reactions. Your task is to provide detailed, realistic feedback including authentic-sounding first-person quotes from each persona. Make each quote specific to the solution features and the persona's background. Format your response exactly as specified with the delimiter tags.",
				},
				{ role: "user", content: prompt },
			],
			temperature: OPENAI_TEMPERATURE,
			max_tokens: MAX_TOKENS_FEEDBACK,
		});

		return response.choices[0].message.content || "No feedback generated";
	} catch (error: unknown) {
		console.error("Error generating persona feedback:", error);
		throw new Error("Failed to generate persona feedback");
	}
}

/**
 * Main function to run the simulation process and parse the results.
 */
export async function runSimulation(
	input: SimulationInput,
): Promise<ParsedSimulationResult> {
	try {
		// Create OpenAI client with the provided API key
		const client = new OpenAI({
			apiKey: input.apiKey,
		});

		// Generate raw data concurrently
		const [rawScenarios, rawPersonas] = await Promise.all([
			generateBusinessScenarios(client, input),
			generateMarketPersonas(client, input),
		]);

		// Generate feedback based on scenarios and personas
		const rawFeedback = await generatePersonaFeedback(
			client,
			rawScenarios,
			rawPersonas,
			input,
		);

		// --- Parse the Results ---
		const personaMap = extractPersonas(rawPersonas);
		const solutions = extractSolutions(rawScenarios, rawFeedback, personaMap);

		return {
			solutions,
			// Optionally include raw data for debugging
			rawScenarios,
			rawPersonas,
			rawFeedback,
		};
	} catch (error: unknown) {
		console.error("Error running simulation:", error);
		// Re-throw the error to be handled by the caller (e.g., API route)
		// Consider adding more specific error types here if needed
		throw error;
	}
}

// --- Parsing Logic (Moved from SimulationReport.tsx) ---

// [ADD THE MISSING FUNCTIONS HERE]
function extractPersonas(personasText: string): Map<string, ParsedPersona> {
	const personaMap = new Map<string, ParsedPersona>();

	// Look for delimited persona blocks
	const personaBlocks = personasText
		.split("[PERSONA_START]")
		.slice(1)
		.map((block) => block.split("[PERSONA_END]")[0].trim());

	// If we don't find delimited blocks, fall back to the older pattern matching
	if (personaBlocks.length === 0) {
		const personaSections = personasText
			.split(/\*\*Persona \d+:|Persona \d+:/i)
			.filter((section) => section.trim());

		// Process with the old method
		for (const section of personaSections) {
			let name = "";
			let description = "";
			let age = "";
			let role = "";
			let fullDetails = "";

			// Extract basic information line
			const basicInfoMatch = section.match(/Basic Information:\s*([^\n]+)/i);
			if (basicInfoMatch?.[1]) {
				const basicInfo = basicInfoMatch[1].trim();
				fullDetails = basicInfo;

				// Parse name, age, role
				const nameAgeRoleMatch = basicInfo.match(/([^,]+),\s*(\d+),\s*(.+)/);
				if (nameAgeRoleMatch) {
					name = nameAgeRoleMatch[1].trim();
					age = nameAgeRoleMatch[2].trim();
					role = nameAgeRoleMatch[3].trim();
				} else {
					// Fallback to just extract name
					const nameMatch = basicInfo.match(/([^,]+)/);
					if (nameMatch) {
						name = nameMatch[1].trim();
					}
				}
			}

			// If no name found, try other patterns
			if (!name) {
				const nameMatch = section.match(/\*\*([^*:]+)(?:\*\*|\()/);
				if (nameMatch?.[1]) {
					name = nameMatch[1].trim();
				}
			}

			// Extract background/description
			if (name) {
				const bgMatch = section.match(
					/(?:Background|Context)[^:]*:\s*([^\n]+)/i,
				);
				if (bgMatch?.[1]) {
					description = bgMatch[1].trim();
				}

				personaMap.set(name.toLowerCase(), {
					name,
					description,
					age,
					role,
					fullDetails:
						fullDetails ||
						`${name}${age ? `, ${age}` : ""}${role ? `, ${role}` : ""}`,
				});
			}
		}

		return personaMap;
	}

	// Process the new delimited format
	for (const block of personaBlocks) {
		// Extract name and audience type from the header
		const headerMatch = block.match(
			/\*\*Persona \d+:\s*([^(]+)\s*\(([^)]+)\)\*\*/,
		);
		const nameMatch = block.match(/\*\*([^*(]+)(?:\s*\(|\*\*)/);
		const name = headerMatch?.[1]?.trim() || nameMatch?.[1]?.trim() || "";

		if (!name) continue;

		// Extract age and role from basic information
		const basicInfoMatch = block.match(
			/Basic Information:\s*([^,]+),\s*(\d+),\s*(.+?)(?:\n|$)/,
		);
		const age = basicInfoMatch?.[2]?.trim();
		const role = basicInfoMatch?.[3]?.trim();

		// Extract background for description
		const bgMatch = block.match(/Background and Context:\s*(.+?)(?:\n|$)/);
		const description = bgMatch?.[1]?.trim() || "";

		// Create the full details string
		const fullDetails = `${name}${age ? `, ${age}` : ""}${role ? `, ${role}` : ""}`;

		personaMap.set(name.toLowerCase(), {
			name,
			description,
			age,
			role,
			fullDetails,
		});
	}

	return personaMap;
}

function extractPersonaFeedback(
	analysisText: string,
	solutionTitle: string,
	personaMap: Map<string, ParsedPersona>,
): ParsedQuote[] {
	const feedbackQuotes: ParsedQuote[] = [];

	// Find the solution analysis section
	const solutionAnalysisBlocks = analysisText
		.split("[SOLUTION_ANALYSIS_START]")
		.slice(1)
		.map((block) => block.split("[SOLUTION_ANALYSIS_END]")[0].trim());

	// Look for the specific solution
	const solutionAnalysis = solutionAnalysisBlocks.find((block) =>
		block.toLowerCase().includes(solutionTitle.toLowerCase()),
	);

	if (!solutionAnalysis) {
		// Fall back to old method if we can't find the solution with delimiters
		const oldSolutionAnalysis = analysisText
			.split(/Analysis for Solution|---/)
			.find((section) =>
				section.toLowerCase().includes(solutionTitle.toLowerCase()),
			);

		if (!oldSolutionAnalysis) return feedbackQuotes;

		// Try to extract persona feedback without delimiters
		const personaFeedbackSection = oldSolutionAnalysis
			.split("Persona Feedback")[1]
			?.split("Overall Analysis")[0];

		if (!personaFeedbackSection) return feedbackQuotes;

		// Extract feedback for each persona
		for (const [personaKey, personaInfo] of personaMap.entries()) {
			const personaSection = personaFeedbackSection
				.split(/\*\*[^*]+:\*\*|\*\*[^*]+\*\*/)
				.find((section) => section.toLowerCase().includes(personaKey));

			if (!personaSection) continue;

			// Extract benefits
			const benefitsMatch = personaSection.match(
				/Potential benefits:\s*([^.]+)\./,
			);
			if (benefitsMatch?.[1]) {
				const benefit = benefitsMatch[1].trim();
				// Convert to first-person quote
				let quote = "";

				if (benefit.includes("hopes for")) {
					quote = `"I'm really hoping for ${benefit.replace("He hopes for", "").replace("She hopes for", "").replace("sees potential in", "").replace("They hope for", "")}."`;
				} else if (benefit.includes("sees potential")) {
					quote = `"I see great potential in ${benefit.replace("He sees potential in", "").replace("She sees potential in", "").replace("They see potential in", "")}."`;
				} else {
					quote = `"This would be great because it could provide ${benefit.replace("He may see benefits if", "").replace("She may see benefits if", "").replace("They may see benefits from", "")}."`;
				}

				feedbackQuotes.push({
					name: personaInfo.name,
					quote: quote.replace(/\."\.$/, '."'), // Clean trailing quote+period
					isPersona: true,
					description: personaInfo.description,
					age: personaInfo.age,
					role: personaInfo.role,
					fullPersonaDetails: personaInfo.fullDetails,
				});
			}

			// Extract concerns
			const concernsMatch =
				personaSection.match(/Key concerns:\s*([^.]+)\./) ||
				personaSection.match(/Key concerns or reservations:\s*([^.]+)\./);

			if (concernsMatch?.[1]) {
				const concern = concernsMatch[1].trim();
				// Convert to first-person quote
				let quote = "";

				if (concern.includes("worries about")) {
					quote = `"I'm concerned about ${concern.replace("He worries about", "").replace("She worries about", "").replace("They worry about", "")}."`;
				} else if (concern.includes("concerned about")) {
					quote = `"I'm worried that ${concern.replace("He is concerned about", "").replace("She is concerned about", "").replace("They are concerned about", "")}."`;
				} else if (concern.includes("fears")) {
					quote = `"My biggest worry is that ${concern.replace("He fears", "").replace("She fears", "").replace("They fear", "")}."`;
				} else {
					quote = `"I'm hesitant because ${concern}."`;
				}

				feedbackQuotes.push({
					name: personaInfo.name,
					quote: quote.replace(/\."\.$/, '."'), // Clean trailing quote+period
					isPersona: true,
					description: personaInfo.description,
					age: personaInfo.age,
					role: personaInfo.role,
					fullPersonaDetails: personaInfo.fullDetails,
				});
			}
		}

		return feedbackQuotes; // Return combined quotes from old method
	}

	// Extract persona feedback blocks with the new delimited format
	const personaBlocks = solutionAnalysis
		.split("[PERSONA_FEEDBACK_START]")
		.slice(1)
		.map((block) => block.split("[PERSONA_FEEDBACK_END]")[0].trim());

	// Process each persona's feedback
	for (const block of personaBlocks) {
		// Extract persona name
		const nameMatch = block.match(/\*\*([^*:]+):\*\*/);
		if (!nameMatch?.[1]) continue;

		const personaName = nameMatch[1].trim();
		const personaKey = personaName.toLowerCase();

		// Find the persona in our map
		const personaInfo =
			personaMap.get(personaKey) ||
			// Try to find by partial match if exact match fails
			Array.from(personaMap.entries()).find(
				([key, _]) => key.includes(personaKey) || personaKey.includes(key),
			)?.[1];

		if (!personaInfo) continue;

		// Look for the direct first-person quote
		const quoteMatch = block.match(
			/\*\*\[First Person Quote\]:\*\*\s*"([^"]+)"/,
		);
		const directQuoteMatch = block.match(/\*\*[^*]+:\*\*\s*"([^"]+)"/); // Fallback if tag missing
		const quote = quoteMatch?.[1] || directQuoteMatch?.[1];

		if (quote) {
			feedbackQuotes.push({
				name: personaInfo.name,
				quote: `"${quote}"`,
				isPersona: true,
				description: personaInfo.description,
				age: personaInfo.age,
				role: personaInfo.role,
				fullPersonaDetails: personaInfo.fullDetails,
			});
		} else {
			// Fall back to constructing a quote from benefits/concerns if no direct quote
			const benefitsMatch = block.match(/Potential benefits:\s*([^.]+)\./);
			const concernsMatch = block.match(/Key concerns:\s*([^.]+)\./);

			if (benefitsMatch?.[1]) {
				feedbackQuotes.push({
					name: personaInfo.name,
					quote: `"I see potential in ${benefitsMatch[1].trim()}."`,
					isPersona: true,
					description: personaInfo.description,
					age: personaInfo.age,
					role: personaInfo.role,
					fullPersonaDetails: personaInfo.fullDetails,
				});
			}

			if (concernsMatch?.[1]) {
				feedbackQuotes.push({
					name: personaInfo.name,
					quote: `"I'm concerned about ${concernsMatch[1].trim()}."`,
					isPersona: true,
					description: personaInfo.description,
					age: personaInfo.age,
					role: personaInfo.role,
					fullPersonaDetails: personaInfo.fullDetails,
				});
			}
		}
	}

	return feedbackQuotes;
}

function extractSolutions(
	scenariosText: string,
	feedbackText: string,
	personaMap: Map<string, ParsedPersona>,
): ParsedSolution[] {
	const solutions: ParsedSolution[] = [];

	// Check if the feedback uses the new delimited format
	const solutionAnalysisBlocks = feedbackText
		.split("[SOLUTION_ANALYSIS_START]")
		.slice(1)
		.map((block) => block.split("[SOLUTION_ANALYSIS_END]")[0].trim());

	// If we have structured blocks, process them
	if (solutionAnalysisBlocks.length > 0) {
		for (const block of solutionAnalysisBlocks) {
			// Extract solution title
			const titleMatch = block.match(
				/Analysis for Solution \d+:\s*(.+?)(?:\n|$)/,
			);
			if (!titleMatch?.[1]) continue;

			const title = titleMatch[1].trim();

			// Try to extract direct confidence scores first (new format)
			const feasibilityScoreMatch = block.match(/Feasibility Score:\s*(\d+)%/);
			const returnScoreMatch = block.match(/Return Score:\s*(\d+)%/);

			// Fallback to risk score and market readiness (old format)
			const riskMatch = block.match(/Risk Score:\s*(\d+)%/);
			const marketReadinessMatch = block.match(/Market readiness:\s*(\d+)%/);
			const resourceRequirementsMatch = block.match(
				/Resource requirements:\s*(\d+)%/,
			);

			// Initialize with default values
			let feasibility = 75;
			let returnScore = 65;

			// Try to use direct scores if available
			if (feasibilityScoreMatch?.[1]) {
				const directFeasibility = Number.parseInt(feasibilityScoreMatch[1]);
				if (!Number.isNaN(directFeasibility)) {
					feasibility = directFeasibility;
				}
			} else if (riskMatch?.[1]) {
				// Fallback to inverted risk score
				const riskScore = Number.parseInt(riskMatch[1]);
				if (!Number.isNaN(riskScore)) {
					feasibility = 100 - riskScore; // Invert risk score for feasibility
				}
			}

			// Try to use direct return score if available
			if (returnScoreMatch?.[1]) {
				const directReturn = Number.parseInt(returnScoreMatch[1]);
				if (!Number.isNaN(directReturn)) {
					returnScore = directReturn;
				}
			} else if (resourceRequirementsMatch?.[1]) {
				// Fallback to inverted resource requirements
				const resourceRequirements = Number.parseInt(
					resourceRequirementsMatch[1],
				);
				if (!Number.isNaN(resourceRequirements)) {
					returnScore = Math.round(100 - resourceRequirements);
				}
			}

			// Blend market readiness into feasibility if it's available and direct score not provided
			if (!feasibilityScoreMatch?.[1] && marketReadinessMatch?.[1]) {
				const marketReadiness = Number.parseInt(marketReadinessMatch[1]);
				if (!Number.isNaN(marketReadiness)) {
					feasibility = Math.round(feasibility * 0.6 + marketReadiness * 0.4);
				}
			}

			// Find description in the scenarios - improved pattern matching
			let description = "No description available";

			// Try to find by exact title match
			const exactScenarioMatch = scenariosText.match(
				new RegExp(
					`Solution \\d+:\\s*${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s\\S]*?- Description:\\s*([^\\n]+)`,
					"i",
				),
			);

			if (exactScenarioMatch?.[1]) {
				description = exactScenarioMatch[1].trim();
			} else {
				// Try to find by approximate title match
				const scenarioSections = scenariosText.split(
					/(Solution \d+:|Strategy \d+:)/,
				);

				for (let i = 1; i < scenarioSections.length; i += 2) {
					if (i + 1 >= scenarioSections.length) break;

					const titleLine = scenarioSections[i].trim();
					const contentSection = scenarioSections[i + 1].trim();

					// Check if this section contains a similar title
					const sectionTitleMatch = titleLine.match(
						/(Solution|Strategy) \d+:\s*(.*?)$/,
					);

					if (
						sectionTitleMatch &&
						(sectionTitleMatch[2].toLowerCase().includes(title.toLowerCase()) ||
							title.toLowerCase().includes(sectionTitleMatch[2].toLowerCase()))
					) {
						// Extract description
						const descMatch = contentSection.match(
							/- Description:\s*(.*?)(?=\n- [A-Z]|$)/s,
						);

						if (descMatch?.[1]) {
							description = descMatch[1].trim();
							break;
						}
					}
				}
			}

			// Get persona feedback and combine into a single array
			const feedbackQuotes = extractPersonaFeedback(
				feedbackText,
				title,
				personaMap,
			);

			// Ensure we have at least some quotes
			if (feedbackQuotes.length === 0) {
				feedbackQuotes.push({
					name: "Analysis",
					quote: `"${title} offers significant market potential but requires careful implementation."`,
					isPersona: false,
				});
			}

			solutions.push({
				title,
				description,
				feasibility,
				return: returnScore,
				feedbackQuotes,
			});
		}
	} else {
		// Fall back to the old extraction method (without SOLUTION_ANALYSIS delimiters)
		const scenarioSections = scenariosText.split(
			/(Solution \d+:|Strategy \d+:)/,
		);

		for (let i = 1; i < scenarioSections.length; i += 2) {
			if (i + 1 >= scenarioSections.length) break;

			const titleLine = scenarioSections[i].trim();
			const contentSection = scenarioSections[i + 1].trim();

			// Extract the solution name and description
			const titleMatch = titleLine.match(/(Solution|Strategy) \d+:\s*(.*?)$/);
			if (!titleMatch) continue;

			const title = titleMatch[2].trim();

			// Find the description in the content
			const descriptionMatch = contentSection.match(
				/- Description:\s*(.*?)(?=\n- [A-Z]|$)/s,
			);
			const description = descriptionMatch
				? descriptionMatch[1].trim()
				: "No description available";

			// Extract confidence scores from feedback by finding the analysis section for this solution
			const solutionNumber = titleLine.match(/\d+/)?.[0] || "";

			// Find the specific analysis section for this solution
			const analysisPattern = new RegExp(
				`Analysis for Solution ${solutionNumber}[^-]*${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\n\\nRisk Score: (\\d+)%`,
				"i",
			);
			const analysisSectionMatch = feedbackText.match(analysisPattern);

			// Default values if we can't find specific scores
			let feasibility = 75;
			let returnScore = 65;

			if (analysisSectionMatch) {
				// Extract the overall risk score - lower risk means higher feasibility
				const riskScore = Number.parseInt(analysisSectionMatch[1]);
				if (!Number.isNaN(riskScore)) {
					feasibility = 100 - riskScore; // Invert risk score for feasibility
				}

				// Find the specific section for this solution by exact title
				const solutionAnalysis = feedbackText
					.split(/Analysis for Solution \d+:|---/)
					.find((section) =>
						section.toLowerCase().includes(title.toLowerCase()),
					);

				if (solutionAnalysis) {
					// Extract market readiness for this specific solution
					const marketReadinessMatch = solutionAnalysis.match(
						/Market readiness:\s*(\d+)%/,
					);
					const resourceRequirementsMatch = solutionAnalysis.match(
						/Resource requirements:\s*(\d+)%/,
					);

					if (marketReadinessMatch?.[1]) {
						// Use market readiness as a component of feasibility
						const marketReadiness = Number.parseInt(marketReadinessMatch[1]);
						if (!Number.isNaN(marketReadiness)) {
							// Blend the market readiness with inverted risk score
							feasibility = Math.round(
								feasibility * 0.6 + marketReadiness * 0.4,
							);
						}
					}

					if (resourceRequirementsMatch?.[1]) {
						// Calculate return based on resource requirements (inverse)
						const resourceRequirements = Number.parseInt(
							resourceRequirementsMatch[1],
						);
						if (!Number.isNaN(resourceRequirements)) {
							// Use inverted resource requirements but add some variability
							returnScore = Math.round(100 - resourceRequirements);

							// Add some variability based on risk score too
							const riskComponent =
								(100 - (Number.isNaN(riskScore) ? 25 : riskScore)) * 0.3; // Handle riskScore NaN case
							returnScore = Math.min(
								95,
								Math.max(35, Math.round(returnScore * 0.7 + riskComponent)),
							);
						}
					}
				}
			}

			// Get persona feedback for this solution
			const feedbackQuotes = extractPersonaFeedback(
				feedbackText,
				title,
				personaMap,
			);

			// Add some analysis insights if we don't have enough persona feedback
			if (feedbackQuotes.filter((q) => q.isPersona).length < 3) {
				// Check for persona quotes
				// Extract advantages from the solution description
				const advantagesMatch = contentSection.match(
					/- Advantages:\s*([\s\S]*?)(?=\n- [A-Z]|$)/,
				);
				if (advantagesMatch?.[1]) {
					const advantages = advantagesMatch[1]
						.split(/\n\s*-\s*/)
						.filter((adv) => adv.trim().length > 0)
						.map((adv) => adv.trim());

					for (const advantage of advantages) {
						if (
							advantage &&
							advantage.length > 5 &&
							feedbackQuotes.length < 8
						) {
							feedbackQuotes.push({
								name: "Key Insight",
								quote: `"${advantage}"`,
								isPersona: false,
							});
						}
					}
				}

				// Extract challenges from the solution description
				const challengesMatch = contentSection.match(
					/- Challenges:\s*([\s\S]*?)(?=\n- [A-Z]|$)/,
				);
				if (challengesMatch?.[1]) {
					const challenges = challengesMatch[1]
						.split(/\n\s*-\s*/)
						.filter((chal) => chal.trim().length > 0)
						.map((chal) => chal.trim());

					for (const challenge of challenges) {
						if (
							challenge &&
							challenge.length > 5 &&
							feedbackQuotes.length < 8
						) {
							feedbackQuotes.push({
								name: "Consideration",
								quote: `"${challenge}"`,
								isPersona: false,
							});
						}
					}
				}
			}

			// Ensure we have at least some insights
			if (feedbackQuotes.length === 0) {
				feedbackQuotes.push({
					name: "Analysis",
					quote: `"${title} offers significant market potential."`,
					isPersona: false,
				});
				feedbackQuotes.push({
					name: "Consideration",
					quote: `"Implementation details need careful consideration."`,
					isPersona: false,
				});
			}

			solutions.push({
				title,
				description,
				feasibility,
				return: returnScore,
				feedbackQuotes,
			});
		}
	}

	// Sort solutions by multiple criteria
	const sortedSolutions = solutions.sort((a, b) => {
		// First sort by combined score
		const totalScoreA = a.feasibility * 0.5 + a.return * 0.5;
		const totalScoreB = b.feasibility * 0.5 + b.return * 0.5;

		return totalScoreB - totalScoreA;
	});

	// Limit to a maximum of 3 solutions to prevent duplicates/low quality
	return sortedSolutions.slice(0, Math.min(3, sortedSolutions.length));
}

// --- NEW STREAMING IMPLEMENTATION ---

// TODO: Implement this function
function extractScenarioTitles(scenariosText: string): string[] {
	console.warn("extractScenarioTitles not implemented");
	const titles: string[] = [];
	// Example basic regex (adapt based on actual format)
	const matches = scenariosText.matchAll(
		/^(Solution|Strategy)\s*\d+:\s*(.*?)$/gim,
	);
	for (const match of matches) {
		if (match[2]) {
			titles.push(match[2].trim());
		}
	}
	return titles.slice(0, 5); // Assuming max 5
}

// TODO: Implement this function
function extractFeedbackScores(
	feedbackText: string,
): Array<{ title: string; feasibility: number; return: number }> {
	console.warn("extractFeedbackScores not implemented");
	const scores: Array<{ title: string; feasibility: number; return: number }> =
		[];
	const solutionAnalysisBlocks = feedbackText
		.split("[SOLUTION_ANALYSIS_START]")
		.slice(1)
		.map((block) => block.split("[SOLUTION_ANALYSIS_END]")[0].trim());

	for (const block of solutionAnalysisBlocks) {
		const titleMatch = block.match(
			/Analysis for Solution \d+:\s*(.+?)(?:\n|$)/,
		);
		const title = titleMatch?.[1]?.trim() || "Unknown Solution";

		const feasibilityScoreMatch = block.match(/Feasibility Score:\s*(\d+)%/);
		const returnScoreMatch = block.match(/Return Score:\s*(\d+)%/);

		// Fallback logic (simplified from extractSolutions)
		const riskMatch = block.match(/Risk Score:\s*(\d+)%/);

		let feasibility = 75; // Default
		let returnScore = 65; // Default

		if (feasibilityScoreMatch?.[1]) {
			feasibility = Number.parseInt(feasibilityScoreMatch[1], 10);
		} else if (riskMatch?.[1]) {
			feasibility = 100 - Number.parseInt(riskMatch[1], 10);
		}

		if (returnScoreMatch?.[1]) {
			returnScore = Number.parseInt(returnScoreMatch[1], 10);
		}

		// Ensure values are numbers
		feasibility = Number.isNaN(feasibility) ? 75 : feasibility;
		returnScore = Number.isNaN(returnScore) ? 65 : returnScore;

		scores.push({ title, feasibility, return: returnScore });
	}

	return scores.slice(0, 5); // Limit similarly
}

// --- Helper Function for OpenAI Calls ---
async function callOpenAI(
	client: OpenAI,
	prompt: string,
	systemMessage: string,
	// maxTokens?: number // Temporarily remove to fix linter issue
): Promise<string> {
	// Remove the try-catch block as it just re-throws
	const response = await client.chat.completions.create({
		model: OPENAI_MODEL,
		messages: [
			{ role: "system", content: systemMessage },
			{ role: "user", content: prompt },
		],
		temperature: OPENAI_TEMPERATURE,
		// max_tokens: maxTokens,
	});

	return response.choices[0]?.message?.content || "";
}

export async function* streamSimulation(
	input: SimulationInput,
): AsyncGenerator<SimulationStreamEvent> {
	let client: OpenAI;
	let rawScenarios = "";
	let rawPersonas = "";
	let rawFeedback = "";
	let personaMap: Map<string, ParsedPersona> | null = null;

	try {
		client = new OpenAI({ apiKey: input.apiKey });

		// --- 1. Generate Scenarios ---
		yield {
			type: "scenario_generation",
			message: "Generating potential market entry strategies...",
		} as StageUpdateEvent;
		// Use the helper, remove maxTokens for now
		rawScenarios = await callOpenAI(
			client,
			GENERATE_SCENARIOS_PROMPT(input),
			"You are a strategic business consultant generating creative but practical solutions for market challenges.",
		);
		if (!rawScenarios) throw new Error("Failed to generate scenarios.");
		const scenarioTitles = extractScenarioTitles(rawScenarios);
		yield {
			type: "scenario_generation",
			data: { titles: scenarioTitles },
		} as ScenarioTitlesEvent;

		// --- 2. Generate Personas ---
		yield {
			type: "persona_generation",
			message: "Creating market personas and stakeholders...",
		} as StageUpdateEvent;
		// Use the helper, remove maxTokens for now
		rawPersonas = await callOpenAI(
			client,
			GENERATE_PERSONAS_PROMPT(input),
			"You are a market research expert specializing in user personas. Create detailed, realistic personas that represent different market segments. Follow the specified format exactly.",
		);
		if (!rawPersonas) throw new Error("Failed to generate personas.");
		personaMap = extractPersonas(rawPersonas);
		const personaSummaries = Array.from(personaMap.values()).map((p) => ({
			name: p.name,
			description: p.description,
			age: p.age,
			role: p.role,
		}));
		yield {
			type: "persona_generation",
			data: { personas: personaSummaries },
		} as PersonaSummaryEvent;

		// --- 3. Generate Feedback ---
		yield {
			type: "feedback_generation",
			message: "Simulating market reactions and feedback...",
		} as StageUpdateEvent;
		// Use the helper, remove maxTokens for now
		rawFeedback = await callOpenAI(
			client,
			GENERATE_FEEDBACK_PROMPT(rawScenarios, rawPersonas, input),
			"You are a market research expert analyzing solution viability and persona reactions. Your task is to provide detailed, realistic feedback including authentic-sounding first-person quotes from each persona. Make each quote specific to the solution features and the persona's background. Format your response exactly as specified with the delimiter tags.",
		);
		if (!rawFeedback) throw new Error("Failed to generate feedback.");
		const feedbackScores = extractFeedbackScores(rawFeedback);
		yield {
			type: "feedback_generation",
			data: { scores: feedbackScores },
		} as FeedbackScoresEvent;

		// --- 4. Final Parsing ---
		yield {
			type: "parsing",
			message: "Compiling final analysis and recommendations...",
		} as StageUpdateEvent;
		if (!personaMap)
			throw new Error("Persona map not available for final parsing.");
		const finalSolutions = extractSolutions(
			rawScenarios,
			rawFeedback,
			personaMap,
		);

		// --- 5. Complete ---
		yield {
			type: "complete",
			data: {
				solutions: finalSolutions,
				rawScenarios,
				rawPersonas,
				rawFeedback,
			},
		} as CompletionEvent;
	} catch (error: unknown) {
		console.error("Error during simulation stream:", error);

		let errPayload: ErrorEvent["error"];
		if (error instanceof OpenAI.APIError) {
			errPayload = {
				message: error.message,
				code: error.code || String(error.status) || undefined,
				details: `(Type: ${error.type})`,
			};
		} else {
			errPayload = {
				message:
					error instanceof Error ? error.message : "Unknown simulation error",
			};
		}

		yield { type: "error", error: errPayload } as ErrorEvent;
	}
}
