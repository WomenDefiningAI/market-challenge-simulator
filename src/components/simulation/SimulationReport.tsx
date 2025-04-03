import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	Check,
	ChevronDown,
	ChevronUp,
	MessageCircle,
	User,
} from "lucide-react";
import { useState } from "react";
import { SimulatorHeader } from "./SimulatorHeader";

interface SimulationReportProps {
	companyInfo: string;
	marketChallenge: string;
	scenarios: string;
	personas: string;
	feedback: string;
	onBack?: () => void;
}

interface PersonaFeedback {
	name: string;
	quote: string;
	isPersona: boolean;
	description?: string;
	age?: string;
	role?: string;
	fullPersonaDetails?: string;
}

interface Solution {
	title: string;
	description: string;
	feasibility: number;
	return: number;
	positiveQuotes: PersonaFeedback[];
	concernQuotes: PersonaFeedback[];
	riskLevel?: "low" | "medium" | "high";
	probability?: "low" | "medium" | "high";
}

function getSolutionType(
	solution: Solution,
	index: number,
	totalSolutions: number,
): {
	title: string;
	color: string;
	bgColor: string;
	progressColor: string;
	description: string;
} {
	// New priority order: Recommended Solution first, then Least Risky, then Wildcard

	// First solution is always Recommended Solution
	if (index === 0) {
		return {
			title: "Recommended Solution",
			color: "text-pink-600",
			bgColor: "bg-pink-50",
			progressColor: "bg-pink-500",
			description:
				"This solution has the highest likelihood of market success.",
		};
	}

	// Second solution (or 2nd of 2) is Least Risky
	if (index === 1 || (index > 0 && totalSolutions === 2)) {
		return {
			title: "Least Risky Solution",
			color: "text-indigo-600",
			bgColor: "bg-indigo-50",
			progressColor: "bg-indigo-500",
			description:
				"This solution offers the most balanced approach with manageable risks.",
		};
	}

	// Third solution (of 3+) is Wildcard
	if (index === totalSolutions - 1 && index > 1) {
		return {
			title: "Wildcard Solution",
			color: "text-orange-600",
			bgColor: "bg-orange-50",
			progressColor: "bg-orange-500",
			description:
				"This solution has transformative potential with higher risk-reward.",
		};
	}

	// Fallback for any other solution (we shouldn't reach this)
	return {
		title: "Alternative Solution",
		color: "text-purple-600",
		bgColor: "bg-purple-50",
		progressColor: "bg-purple-500",
		description: "An additional solution for consideration.",
	};
}

function extractPersonas(
	personas: string,
): Map<
	string,
	{
		name: string;
		description: string;
		age?: string;
		role?: string;
		fullDetails?: string;
	}
> {
	const personaMap = new Map<
		string,
		{
			name: string;
			description: string;
			age?: string;
			role?: string;
			fullDetails?: string;
		}
	>();

	// Look for delimited persona blocks
	const personaBlocks = personas
		.split("[PERSONA_START]")
		.slice(1)
		.map((block) => block.split("[PERSONA_END]")[0].trim());

	// If we don't find delimited blocks, fall back to the older pattern matching
	if (personaBlocks.length === 0) {
		const personaSections = personas
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
		const age = basicInfoMatch?.[2]?.trim() || "";
		const role = basicInfoMatch?.[3]?.trim() || "";

		// Extract background for description
		const bgMatch = block.match(/Background and Context:\s*(.+?)(?:\n|$)/);
		const description = bgMatch?.[1]?.trim() || "";

		// Create the full details string
		const fullDetails = `${name}, ${age}, ${role}`;

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
	personaMap: Map<
		string,
		{
			name: string;
			description: string;
			age?: string;
			role?: string;
			fullDetails?: string;
		}
	>,
): { positiveQuotes: PersonaFeedback[]; concernQuotes: PersonaFeedback[] } {
	const positiveQuotes: PersonaFeedback[] = [];
	const concernQuotes: PersonaFeedback[] = [];

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

		if (!oldSolutionAnalysis) return { positiveQuotes, concernQuotes };

		// Try to extract persona feedback without delimiters
		const personaFeedbackSection = oldSolutionAnalysis
			.split("Persona Feedback")[1]
			?.split("Overall Analysis")[0];

		if (!personaFeedbackSection) return { positiveQuotes, concernQuotes };

		// Extract feedback for each persona
		for (const [personaKey, personaInfo] of personaMap.entries()) {
			const personaSection = personaFeedbackSection
				.split(/\*\*[^*]+:\*\*|\*\*[^*]+\*\*/)
				.find((section) => section.toLowerCase().includes(personaKey));

			if (!personaSection) continue;

			// Extract sentiment
			const sentimentMatch = personaSection.match(
				/Initial reaction:\s*([^.]+)\./,
			);
			const sentiment = sentimentMatch?.[1]?.trim() || "";
			const isPositive = sentiment.toLowerCase().includes("positive");

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

				positiveQuotes.push({
					name: personaInfo.name,
					quote: quote.replace(/\."\.$/, '."'),
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

				concernQuotes.push({
					name: personaInfo.name,
					quote: quote.replace(/\."\.$/, '."'),
					isPersona: true,
					description: personaInfo.description,
					age: personaInfo.age,
					role: personaInfo.role,
					fullPersonaDetails: personaInfo.fullDetails,
				});
			}
		}

		return { positiveQuotes, concernQuotes };
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
		const directQuoteMatch = block.match(/\*\*[^*]+:\*\*\s*"([^"]+)"/);
		const quote = quoteMatch?.[1] || directQuoteMatch?.[1];

		if (quote) {
			// Determine if it's a positive or concern quote
			const initialReactionMatch = block.match(/Initial reaction:\s*([^.]+)\./);
			const sentiment = initialReactionMatch?.[1]?.toLowerCase() || "";

			const isPositive =
				sentiment.includes("positive") ||
				(!sentiment.includes("negative") &&
					(quote.toLowerCase().includes("like") ||
						quote.toLowerCase().includes("great") ||
						quote.toLowerCase().includes("benefit") ||
						quote.toLowerCase().includes("improve")));

			if (isPositive) {
				positiveQuotes.push({
					name: personaInfo.name,
					quote: `"${quote}"`,
					isPersona: true,
					description: personaInfo.description,
					age: personaInfo.age,
					role: personaInfo.role,
					fullPersonaDetails: personaInfo.fullDetails,
				});
			} else {
				concernQuotes.push({
					name: personaInfo.name,
					quote: `"${quote}"`,
					isPersona: true,
					description: personaInfo.description,
					age: personaInfo.age,
					role: personaInfo.role,
					fullPersonaDetails: personaInfo.fullDetails,
				});
			}
		} else {
			// Fall back to constructing a quote from benefits/concerns if no direct quote
			const benefitsMatch = block.match(/Potential benefits:\s*([^.]+)\./);
			const concernsMatch = block.match(/Key concerns:\s*([^.]+)\./);

			if (benefitsMatch?.[1]) {
				positiveQuotes.push({
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
				concernQuotes.push({
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

	return { positiveQuotes, concernQuotes };
}

function extractSolutions(
	scenarios: string,
	personas: string,
	feedback: string,
): Solution[] {
	const solutions: Solution[] = [];

	// Extract persona details with descriptions
	const personaMap = extractPersonas(personas);

	// Check if the feedback uses the new delimited format
	const solutionAnalysisBlocks = feedback
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
				const resourceRequirements = Number.parseInt(resourceRequirementsMatch[1]);
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
			const exactScenarioMatch = scenarios.match(
				new RegExp(
					`Solution \\d+:\\s*${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s\\S]*?- Description:\\s*([^\\n]+)`,
					"i",
				),
			);

			if (exactScenarioMatch?.[1]) {
				description = exactScenarioMatch[1].trim();
			} else {
				// Try to find by approximate title match
				const scenarioSections = scenarios.split(/(Solution \d+:|Strategy \d+:)/);
				
				for (let i = 1; i < scenarioSections.length; i += 2) {
					if (i + 1 >= scenarioSections.length) break;
					
					const titleLine = scenarioSections[i].trim();
					const contentSection = scenarioSections[i + 1].trim();
					
					// Check if this section contains a similar title
					const sectionTitleMatch = titleLine.match(/(Solution|Strategy) \d+:\s*(.*?)$/);
					
					if (sectionTitleMatch && 
						(sectionTitleMatch[2].toLowerCase().includes(title.toLowerCase()) || 
						 title.toLowerCase().includes(sectionTitleMatch[2].toLowerCase()))) {
						
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
			const { positiveQuotes, concernQuotes } = extractPersonaFeedback(
				feedback,
				title,
				personaMap,
			);
			
			// Combine all quotes for single-column display
			const allQuotes = [...positiveQuotes, ...concernQuotes];

			// Ensure we have at least some quotes
			if (allQuotes.length === 0) {
				allQuotes.push({
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
				positiveQuotes: allQuotes,
				concernQuotes: [], // We'll not use this anymore
			});
		}
	} else {
		// Fall back to the old extraction method
		// Get numbered solutions from scenarios
		const scenarioSections = scenarios.split(/(Solution \d+:|Strategy \d+:)/);

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
			const analysisSection = feedback.match(analysisPattern);

			// Default values if we can't find specific scores
			let feasibility = 75;
			let returnScore = 65;

			if (analysisSection) {
				// Extract the overall risk score - lower risk means higher feasibility
				const riskScore = Number.parseInt(analysisSection[1]);
				if (!Number.isNaN(riskScore)) {
					feasibility = 100 - riskScore; // Invert risk score for feasibility
				}

				// Find the specific section for this solution by exact title
				const solutionAnalysis = feedback
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
							const riskComponent = (100 - riskScore) * 0.3;
							returnScore = Math.min(
								95,
								Math.max(35, Math.round(returnScore * 0.7 + riskComponent)),
							);
						}
					}
				}
			}

			// Get persona feedback for this solution
			const { positiveQuotes, concernQuotes } = extractPersonaFeedback(
				feedback,
				title,
				personaMap,
			);

			// Add some analysis insights if we don't have enough persona feedback
			if (positiveQuotes.length < 2 || concernQuotes.length < 1) {
				// Extract advantages from the solution description
				const advantagesMatch = contentSection.match(
					/- Advantages:\s*([\s\S]*?)(?=\n- [A-Z]|$)/,
				);
				if (advantagesMatch?.[1]) {
					const advantages = advantagesMatch[1]
						.split(/\n\s*-\s*/)
						.filter((adv) => adv.trim().length > 0)
						.map((adv) => adv.trim());

					for (
						let j = 0;
						j < advantages.length && positiveQuotes.length < 5;
						j++
					) {
						if (advantages[j] && advantages[j].length > 5) {
							positiveQuotes.push({
								name: "Key Insight",
								quote: `"${advantages[j]}"`,
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

					for (
						let j = 0;
						j < challenges.length && concernQuotes.length < 3;
						j++
					) {
						if (challenges[j] && challenges[j].length > 5) {
							concernQuotes.push({
								name: "Consideration",
								quote: `"${challenges[j]}"`,
								isPersona: false,
							});
						}
					}
				}
			}

			// Ensure we have at least some insights
			if (positiveQuotes.length === 0) {
				positiveQuotes.push({
					name: "Analysis",
					quote: `"${title} offers significant market potential."`,
					isPersona: false,
				});
			}

			if (concernQuotes.length === 0) {
				concernQuotes.push({
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
				positiveQuotes,
				concernQuotes,
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

	// Limit to a maximum of 3 solutions to prevent duplicates
	return sortedSolutions.slice(0, Math.min(3, sortedSolutions.length));
}

export function SimulationReport({
	companyInfo,
	marketChallenge,
	scenarios,
	personas,
	feedback,
	onBack,
}: SimulationReportProps) {
	const solutions = extractSolutions(scenarios, personas, feedback);
	const [showRawData, setShowRawData] = useState(false);

	return (
		<div className="min-h-screen bg-white">
			<div className="max-w-4xl mx-auto p-8 my-8 bg-white rounded-lg shadow-sm">
				<SimulatorHeader />

				{/* Back button if onBack is provided */}
				{onBack && (
					<Button
						onClick={onBack}
						variant="outline"
						className="mb-4 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
					>
						← Back to Form
					</Button>
				)}

				{/* Company Overview Section */}
				<Card className="border border-gray-100 shadow-lg mt-8">
					<div className="p-8">
						<div className="grid grid-cols-2 gap-8">
							<div>
								<h3 className="text-xl font-semibold mb-4 text-gray-900">
									Company Profile
								</h3>
								<p className="text-lg leading-relaxed bg-gray-50 p-6 rounded-lg text-gray-700">
									{companyInfo}
								</p>
							</div>
							<div>
								<h3 className="text-xl font-semibold mb-4 text-gray-900">
									Market Challenge
								</h3>
								<p className="text-lg leading-relaxed bg-gray-50 p-6 rounded-lg text-gray-700">
									{marketChallenge}
								</p>
							</div>
						</div>
					</div>
				</Card>

				{/* Solutions Sections */}
				{solutions.map((solution, index) => {
					const solutionType = getSolutionType(
						solution,
						index,
						solutions.length,
					);
					return (
						<Card
							key={`solution-${solution.title}-${index}`}
							className="border border-gray-100 shadow-lg mt-8"
						>
							<div className="p-8">
								<div className="mb-6">
									<h2 className={`text-2xl font-bold ${solutionType.color}`}>
										{solutionType.title}
									</h2>
									<p className="text-gray-600 mt-1">
										{solutionType.description}
									</p>
								</div>

								<h3 className="text-xl font-semibold text-gray-900 mb-2">
									{solution.title}
								</h3>
								<p className="text-lg text-gray-700 mb-6">
									{solution.description}
								</p>

								<div className="space-y-4 mb-8">
									<div>
										<div className="flex justify-between text-sm mb-2 text-gray-700">
											<span>Confidence on Feasibility</span>
											<span className="font-semibold">
												{solution.feasibility}%
											</span>
										</div>
										<div className="h-2 bg-gray-100 rounded-full overflow-hidden">
											<div
												className={`h-full ${solutionType.progressColor} transition-all duration-500`}
												style={{ width: `${solution.feasibility}%` }}
											/>
										</div>
									</div>
									<div>
										<div className="flex justify-between text-sm mb-2 text-gray-700">
											<span>Confidence on Return</span>
											<span className="font-semibold">{solution.return}%</span>
										</div>
										<div className="h-2 bg-gray-100 rounded-full overflow-hidden">
											<div
												className={`h-full ${solutionType.progressColor} transition-all duration-500`}
												style={{ width: `${solution.return}%` }}
											/>
										</div>
									</div>
								</div>

								<h4 className="text-lg font-semibold mb-4 text-gray-900">
									Persona Feedback
								</h4>
								<div className="space-y-4">
									{solution.positiveQuotes.map((item, i) => {
										// Determine if this is a concern or positive feedback
										const isPositive = 
											item.quote.toLowerCase().includes("like") || 
											item.quote.toLowerCase().includes("great") || 
											item.quote.toLowerCase().includes("benefit") || 
											item.quote.toLowerCase().includes("hope") ||
											item.quote.toLowerCase().includes("potential") ||
											!item.quote.toLowerCase().includes("concerned") &&
											!item.quote.toLowerCase().includes("worried") && 
											!item.quote.toLowerCase().includes("risk") &&
											!item.quote.toLowerCase().includes("problem");
										
										return (
											<div
												key={`feedback-${solution.title}-${i}`}
												className={`p-4 rounded-lg ${isPositive ? solutionType.bgColor : 'bg-gray-50'}`}
											>
												<p className={`italic ${isPositive ? solutionType.color : 'text-gray-700'}`}>
													{item.quote}
												</p>
												<div className="flex items-center gap-2 mt-2 text-gray-700">
													{item.isPersona ? (
														<User size={14} className="text-indigo-500" />
													) : (
														isPositive ? <Check size={14} /> : <MessageCircle size={14} />
													)}
													<span className="text-sm font-medium">
														{item.isPersona && item.fullPersonaDetails
															? item.fullPersonaDetails
															: item.isPersona
																? `${item.name}${item.age ? `, ${item.age}` : ""}${item.role ? `, ${item.role}` : ""}`
																: item.name}
													</span>
												</div>
											</div>
										)
									})}
								</div>
							</div>
						</Card>
					);
				})}

				{/* Raw Data Section - Toggleable */}
				<Card className="border border-gray-100 shadow-lg mt-8">
					<div className="p-8">
						<button
							type="button"
							onClick={() => setShowRawData(!showRawData)}
							className="w-full flex items-center justify-between text-lg font-semibold text-gray-900 focus:outline-none"
						>
							<span>Raw Simulation Data</span>
							{showRawData ? (
								<ChevronUp className="h-5 w-5 text-gray-600" />
							) : (
								<ChevronDown className="h-5 w-5 text-gray-600" />
							)}
						</button>

						{showRawData && (
							<div className="mt-6 space-y-6">
								<div>
									<h4 className="text-base font-medium mb-3 text-gray-900">
										Generated Solutions:
									</h4>
									<pre className="whitespace-pre-wrap bg-gray-50 p-6 rounded-lg text-sm text-gray-700 max-h-[300px] overflow-y-auto">
										{scenarios}
									</pre>
								</div>
								<div>
									<h4 className="text-base font-medium mb-3 text-gray-900">
										Market Personas:
									</h4>
									<pre className="whitespace-pre-wrap bg-gray-50 p-6 rounded-lg text-sm text-gray-700 max-h-[300px] overflow-y-auto">
										{personas}
									</pre>
								</div>
								<div>
									<h4 className="text-base font-medium mb-3 text-gray-900">
										Analysis & Feedback:
									</h4>
									<pre className="whitespace-pre-wrap bg-gray-50 p-6 rounded-lg text-sm text-gray-700 max-h-[300px] overflow-y-auto">
										{feedback}
									</pre>
								</div>
							</div>
						)}
					</div>
				</Card>
			</div>
		</div>
	);
}
