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

function extractPersonas(personas: string): Map<string, { name: string; description: string }> {
	const personaMap = new Map<string, { name: string; description: string }>();
	const personaSections = personas.split(/\*\*Persona \d+:|Persona \d+:/i).filter(section => section.trim());
	
	for (const section of personaSections) {
		// Extract name
		let name = "";
		let description = "";
		
		const nameMatch = section.match(/(?:- )?(?:Name|Basic Information)[^:]*:[^\n]*\n[^-]*- Name:\s*([^\n]+)/i) || 
		                  section.match(/^(?:\s*)[^-\n]*(?:Name|Basic Information)[^:]*:[^\n]*\n[^-]*(?:\s*)([^\n]+)/i);
		
		if (nameMatch?.[1]) {
			name = nameMatch[1].trim();
		}
		
		// If no name found, try different patterns
		if (!name) {
			const altNameMatch = section.match(/^\s*([A-Z][a-z]+)\s*(?:_|$|\n)/);
			if (altNameMatch?.[1]) {
				name = altNameMatch[1].trim();
			}
		}
		
		// Extract background/description
		if (name) {
			// Try to find either Background, Context, or Occupation
			const bgMatch = section.match(/(?:Background|Context)[^:]*:\s*([^\n]+)/i);
			const occMatch = section.match(/(?:Occupation)[^:]*:\s*([^\n]+)/i);
			
			// If background found, use it
			if (bgMatch?.[1]) {
				description = bgMatch[1].trim();
			} 
			// Otherwise if occupation found, use it
			else if (occMatch?.[1]) {
				description = `${name} is a ${occMatch[1].trim()}.`;
			}
			
			if (name && description) {
				personaMap.set(name.toLowerCase(), { name, description });
			} else if (name) {
				personaMap.set(name.toLowerCase(), { name, description: "" });
			}
		}
	}
	
	return personaMap;
}

function extractPersonaFeedback(
	analysisText: string,
	solutionTitle: string,
	personaMap: Map<string, { name: string; description: string }>
): { positiveQuotes: PersonaFeedback[]; concernQuotes: PersonaFeedback[] } {
	const positiveQuotes: PersonaFeedback[] = [];
	const concernQuotes: PersonaFeedback[] = [];
	const personaNames = Array.from(personaMap.keys());

	// Find relevant section for this solution
	const solutionAnalysis = analysisText
		.split(/Analysis for Solution|---/)
		.find((section) =>
			section.toLowerCase().includes(solutionTitle.toLowerCase()),
		);

	if (!solutionAnalysis) return { positiveQuotes, concernQuotes };

	// Find the persona feedback section
	const personaFeedbackSection = solutionAnalysis
		.split("Persona Feedback")[1]
		?.split("Overall Analysis")[0];

	if (!personaFeedbackSection) return { positiveQuotes, concernQuotes };

	// Extract individual persona feedback
	for (const [personaKey, personaInfo] of personaMap.entries()) {
		const personaSection = personaFeedbackSection
			.split(/\*\*[^*]+:\*\*|\*\*[^*]+\*\*/)
			.find((section) =>
				section.toLowerCase().includes(personaKey),
			);

		if (!personaSection) continue;

		// Extract sentiment
		const sentimentMatch = personaSection.match(
			/Initial reaction and sentiment:\s*([^\\n]+)/,
		);
		const sentiment = sentimentMatch?.[1]?.trim() || "";
		const isPositive = sentiment.toLowerCase().includes("positive");

		// Extract benefits
		const benefitsMatch = personaSection.match(
			/Potential benefits:\s*([^\\n]+)/,
		);
		if (benefitsMatch?.[1]) {
			positiveQuotes.push({
				name: personaInfo.name,
				quote: benefitsMatch[1].trim(),
				isPersona: true,
				description: personaInfo.description
			});
		}

		// Extract concerns
		const concernsMatch = personaSection.match(
			/Key concerns or reservations:\s*([^\\n]+)/,
		);
		if (concernsMatch?.[1]) {
			concernQuotes.push({
				name: personaInfo.name,
				quote: concernsMatch[1].trim(),
				isPersona: true,
				description: personaInfo.description
			});
		}

		// Extract improvements (as positive feedback)
		const improvementsMatch = personaSection.match(
			/Suggested improvements:\s*([^\\n]+)/,
		);
		if (improvementsMatch?.[1]) {
			positiveQuotes.push({
				name: personaInfo.name,
				quote: `Suggests: ${improvementsMatch[1].trim()}`,
				isPersona: true,
				description: personaInfo.description
			});
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

	// Add persona names from the analysis feedback that might not be in the personas section
	const additionalPersonas = feedback.match(/\*\*([A-Z][a-z]+):\*\*/g);
	if (additionalPersonas) {
		for (const persona of additionalPersonas) {
			const name = persona.replace(/\*\*/g, "").replace(":", "").trim();
			if (name && name.length > 1 && !personaMap.has(name.toLowerCase())) {
				personaMap.set(name.toLowerCase(), { name, description: "" });
			}
		}
	}

	// Get numbered solutions from scenarios
	const scenarioSections = scenarios.split(/(Solution \d+:|Strategy \d+:)/);
	const currentSolution = "";
	const solutionDescription = "";

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

		// Extract confidence scores from feedback
		let feasibility = 75;
		let returnScore = 65;

		// Look for risk scores in the analysis
		const riskMatch = feedback.match(
			new RegExp(
				`Analysis for Solution[^-]*${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s\\S]*?Market readiness:\\s*(\\d+)%`,
				"i",
			),
		);

		const returnMatch = feedback.match(
			new RegExp(
				`Analysis for Solution[^-]*${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s\\S]*?Resource requirements:\\s*(\\d+)%`,
				"i",
			),
		);

		if (riskMatch?.[1]) {
			feasibility = Number.parseInt(riskMatch[1]);
		}

		if (returnMatch?.[1]) {
			// Resource requirements is inverse to return score (lower requirements = higher return)
			const resourceRequirements = Number.parseInt(returnMatch[1]);
			returnScore = 100 - resourceRequirements; // Invert the score
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
							quote: advantages[j],
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
							quote: challenges[j],
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
				quote: `${title} offers significant market potential.`,
				isPersona: false,
			});
		}

		if (concernQuotes.length === 0) {
			concernQuotes.push({
				name: "Consideration",
				quote: "Implementation details need careful consideration.",
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
									Analysis & Feedback
								</h4>
								<div className="grid grid-cols-2 gap-8">
									<div>
										<div className="flex items-center gap-2 text-gray-900 mb-4">
											<Check size={20} className={solutionType.color} />
											<h5 className="font-semibold">Positive Feedback</h5>
										</div>
										<div className="space-y-4">
											{solution.positiveQuotes.map((item, i) => (
												<div
													key={`positive-${solution.title}-${i}`}
													className={`p-4 rounded-lg ${solutionType.bgColor}`}
												>
													<p className={`italic ${solutionType.color}`}>
														"{item.quote}"
													</p>
													<div className="flex items-center gap-2 mt-2 text-gray-700">
														{item.isPersona ? (
															<User size={14} className="text-indigo-500" />
														) : (
															<Check size={14} />
														)}
														<span className="text-sm font-medium">
															{item.isPersona
																? `${item.name} (Persona)`
																: item.name}
														</span>
													</div>
													{item.isPersona && item.description && (
														<p className="text-xs text-gray-600 mt-1 ml-6">
															{item.description}
														</p>
													)}
												</div>
											))}
										</div>
									</div>
									<div>
										<div className="flex items-center gap-2 text-gray-900 mb-4">
											<MessageCircle size={20} className={solutionType.color} />
											<h5 className="font-semibold">
												Concerns & Considerations
											</h5>
										</div>
										<div className="space-y-4">
											{solution.concernQuotes.map((item, i) => (
												<div
													key={`concern-${solution.title}-${i}`}
													className="bg-gray-50 p-4 rounded-lg"
												>
													<p className="text-gray-700 italic">"{item.quote}"</p>
													<div className="flex items-center gap-2 mt-2 text-gray-700">
														{item.isPersona ? (
															<User size={14} className="text-indigo-500" />
														) : (
															<MessageCircle size={14} />
														)}
														<span className="text-sm font-medium">
															{item.isPersona
																? `${item.name} (Persona)`
																: item.name}
														</span>
													</div>
													{item.isPersona && item.description && (
														<p className="text-xs text-gray-600 mt-1 ml-6">
															{item.description}
														</p>
													)}
												</div>
											))}
										</div>
									</div>
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
									<h4 className="text-base font-medium mb-3 text-gray-900">Generated Solutions:</h4>
									<pre className="whitespace-pre-wrap bg-gray-50 p-6 rounded-lg text-sm text-gray-700 max-h-[300px] overflow-y-auto">
										{scenarios}
									</pre>
								</div>
								<div>
									<h4 className="text-base font-medium mb-3 text-gray-900">Market Personas:</h4>
									<pre className="whitespace-pre-wrap bg-gray-50 p-6 rounded-lg text-sm text-gray-700 max-h-[300px] overflow-y-auto">
										{personas}
									</pre>
								</div>
								<div>
									<h4 className="text-base font-medium mb-3 text-gray-900">Analysis & Feedback:</h4>
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
