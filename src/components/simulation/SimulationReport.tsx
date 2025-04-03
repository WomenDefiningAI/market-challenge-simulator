import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, ChevronDown, ChevronUp, MessageCircle } from "lucide-react";
import { useState } from "react";
import { SimulatorHeader } from "./SimulatorHeader";

interface SimulationReportProps {
	companyInfo: string;
	marketChallenge: string;
	scenarios: string;
	personas: string;
	feedback: string;
}

interface Solution {
	title: string;
	description: string;
	feasibility: number;
	return: number;
	positiveQuotes: string[];
	concernQuotes: string[];
	riskLevel?: 'low' | 'medium' | 'high';
	probability?: 'low' | 'medium' | 'high';
}

function getSolutionType(solution: Solution, index: number, solutions: Solution[]): {
	title: string;
	color: string;
	bgColor: string;
	progressColor: string;
	description: string;
} {
	// First solution is always least risky
	if (index === 0) {
		return {
			title: "Least Risky Solution",
			color: "text-indigo-600",
			bgColor: "bg-indigo-50",
			progressColor: "bg-indigo-500",
			description: "This solution offers the most balanced approach with manageable risks."
		};
	}
	// Second solution is most probable
	if (index === 1) {
		return {
			title: "Most Probable Solution",
			color: "text-pink-600",
			bgColor: "bg-pink-50",
			progressColor: "bg-pink-500",
			description: "This solution has the highest likelihood of market success."
		};
	}
	// Third solution is wildcard
	return {
		title: "Wildcard Solution",
		color: "text-orange-600",
		bgColor: "bg-orange-50",
		progressColor: "bg-orange-500",
		description: "This solution has transformative potential with higher risk-reward."
	};
}

function extractSolutions(
	scenarios: string,
	personas: string,
	feedback: string,
): Solution[] {
	const solutions: Solution[] = [];

	// Split scenarios into individual solutions
	const scenarioLines = scenarios.split("\n\n").filter((line) => line.trim());

	for (const scenario of scenarioLines) {
		// Extract solution name and description
		const titleMatch = scenario.match(/Solution \d+: ([^-]+)/);
		const descriptionMatch = scenario.match(/Description: ([^-]+)/);

		if (!titleMatch || !descriptionMatch) continue;

		const title = titleMatch[1].trim();
		const description = descriptionMatch[1].trim();

		// Extract confidence scores from feedback
		const confidenceMatch = feedback.match(
			new RegExp(
				`${title}[\\s\\S]*?Confidence[^:]*: (\\d+)%[\\s\\S]*?Return[^:]*: (\\d+)%`,
			),
		);

		const feasibility = confidenceMatch
			? Number.parseInt(confidenceMatch[1])
			: 75;
		const returnScore = confidenceMatch
			? Number.parseInt(confidenceMatch[2])
			: 65;

		// Extract persona feedback
		const personaLines = personas.split("\n\n").filter((line) => line.trim());
		const positiveQuotes: string[] = [];
		const concernQuotes: string[] = [];

		for (const persona of personaLines) {
			// Look for feedback specifically about this solution
			if (persona.toLowerCase().includes(title.toLowerCase())) {
				const lines = persona.split("\n");
				for (const line of lines) {
					const cleanLine = line.replace(/^[^:]*:\s*/, "").trim();
					if (
						line.toLowerCase().includes("positive") ||
						line.toLowerCase().includes("advantage") ||
						line.toLowerCase().includes("benefit")
					) {
						positiveQuotes.push(cleanLine);
					} else if (
						line.toLowerCase().includes("concern") ||
						line.toLowerCase().includes("challenge") ||
						line.toLowerCase().includes("risk")
					) {
						concernQuotes.push(cleanLine);
					}
				}
			}
		}

		// If no specific quotes found, look for general feedback
		if (positiveQuotes.length === 0 || concernQuotes.length === 0) {
			const feedbackLines = feedback.split("\n").filter((line) => line.trim());
			for (const line of feedbackLines) {
				if (line.toLowerCase().includes(title.toLowerCase())) {
					const cleanLine = line.replace(/^[^:]*:\s*/, "").trim();
					if (
						line.toLowerCase().includes("positive") ||
						line.toLowerCase().includes("advantage")
					) {
						positiveQuotes.push(cleanLine);
					} else if (
						line.toLowerCase().includes("concern") ||
						line.toLowerCase().includes("challenge")
					) {
						concernQuotes.push(cleanLine);
					}
				}
			}
		}

		// Ensure we have at least some quotes
		if (positiveQuotes.length === 0) {
			positiveQuotes.push("Solution shows potential for market success");
		}
		if (concernQuotes.length === 0) {
			concernQuotes.push("Implementation details need careful consideration");
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
		// First sort by feasibility for least risky
		const feasibilityDiff = b.feasibility - a.feasibility;
		if (Math.abs(feasibilityDiff) > 10) return feasibilityDiff;
		
		// Then by return for most probable
		const returnDiff = b.return - a.return;
		if (Math.abs(returnDiff) > 10) return returnDiff;
		
		// Finally by combined score for wildcard
		return (b.return * 0.7 + b.feasibility * 0.3) - (a.return * 0.7 + a.feasibility * 0.3);
	});

	return sortedSolutions;
}

export function SimulationReport({
	companyInfo,
	marketChallenge,
	scenarios,
	personas,
	feedback,
}: SimulationReportProps) {
	const solutions = extractSolutions(scenarios, personas, feedback);

	return (
		<div className="min-h-screen bg-white">
			<div className="max-w-4xl mx-auto p-8 my-8 bg-white rounded-lg shadow-sm">
				<SimulatorHeader />

				{/* Company Overview Section */}
				<Card className="border border-gray-100 shadow-lg mt-8">
					<div className="p-8">
						<div className="grid grid-cols-2 gap-8">
							<div>
								<h3 className="text-xl font-semibold mb-4 text-gray-900">Company Profile</h3>
								<p className="text-lg leading-relaxed bg-gray-50 p-6 rounded-lg text-gray-700">
									{companyInfo}
								</p>
							</div>
							<div>
								<h3 className="text-xl font-semibold mb-4 text-gray-900">Market Challenge</h3>
								<p className="text-lg leading-relaxed bg-gray-50 p-6 rounded-lg text-gray-700">
									{marketChallenge}
								</p>
							</div>
						</div>
					</div>
				</Card>

				{/* Solutions Sections */}
				{solutions.map((solution, index) => {
					const solutionType = getSolutionType(solution, index, solutions);
					return (
						<Card 
							key={`solution-${solution.title}`} 
							className="border border-gray-100 shadow-lg mb-8"
						>
							<div className="p-8">
								<div className="mb-6">
									<h2 className={`text-2xl font-bold ${solutionType.color}`}>
										{solutionType.title}
									</h2>
									<p className="text-gray-600 mt-1">{solutionType.description}</p>
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
											<span className="font-semibold">{solution.feasibility}%</span>
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

								<h4 className="text-lg font-semibold mb-4 text-gray-900">Simulated Personas</h4>
								<div className="grid grid-cols-2 gap-8">
									<div>
										<div className="flex items-center gap-2 text-gray-900 mb-4">
											<Check size={20} className={solutionType.color} />
											<h5 className="font-semibold">Positive Feedback</h5>
										</div>
										<div className="space-y-4">
											{solution.positiveQuotes.map((quote) => (
												<div 
													key={`positive-${solution.title}-${quote.substring(0, 32)}`} 
													className={`p-4 rounded-lg ${solutionType.bgColor}`}
												>
													<p className={`italic ${solutionType.color}`}>
														"{quote}"
													</p>
												</div>
											))}
										</div>
									</div>
									<div>
										<div className="flex items-center gap-2 text-gray-900 mb-4">
											<MessageCircle size={20} className={solutionType.color} />
											<h5 className="font-semibold">Concerns & Considerations</h5>
										</div>
										<div className="space-y-4">
											{solution.concernQuotes.map((quote) => (
												<div 
													key={`concern-${solution.title}-${quote.substring(0, 32)}`} 
													className="bg-gray-50 p-4 rounded-lg"
												>
													<p className="text-gray-700 italic">"{quote}"</p>
												</div>
											))}
										</div>
									</div>
								</div>
							</div>
						</Card>
					);
				})}
			</div>
		</div>
	);
}
