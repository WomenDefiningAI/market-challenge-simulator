import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ParsedQuote, ParsedSolution } from "@/lib/types";
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
	solutions: ParsedSolution[];
	rawScenarios?: string;
	rawPersonas?: string;
	rawFeedback?: string;
	onBack?: () => void;
}

function getSolutionType(
	solution: ParsedSolution,
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

export function SimulationReport({
	companyInfo,
	marketChallenge,
	solutions,
	rawScenarios,
	rawPersonas,
	rawFeedback,
	onBack,
}: SimulationReportProps) {
	const [showRawData, setShowRawData] = useState(false);

	const hasRawData = !!(rawScenarios || rawPersonas || rawFeedback);

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
									Persona Feedback & Insights
								</h4>
								<div className="space-y-4">
									{solution.feedbackQuotes.map((item, i) => {
										const isPositiveGuess =
											item.quote.toLowerCase().includes("like") ||
											item.quote.toLowerCase().includes("great") ||
											item.quote.toLowerCase().includes("benefit") ||
											item.quote.toLowerCase().includes("hope") ||
											item.quote.toLowerCase().includes("potential") ||
											(!item.quote.toLowerCase().includes("concerned") &&
												!item.quote.toLowerCase().includes("worried") &&
												!item.quote.toLowerCase().includes("risk") &&
												!item.quote.toLowerCase().includes("problem"));

										const bgColor = item.isPersona
											? isPositiveGuess
												? solutionType.bgColor
												: 'bg-gray-50'
											: 'bg-blue-50';

										const textColor = item.isPersona
											? isPositiveGuess
												? solutionType.color
												: 'text-gray-700'
											: 'text-blue-700';

										return (
											<div
												key={`feedback-${solution.title}-${item.name}-${i}`}
												className={`p-4 rounded-lg ${bgColor}`}
											>
												<p className={`italic ${textColor}`}>
													{item.quote}
												</p>
												<div className="flex items-center gap-2 mt-2 text-gray-700">
													{item.isPersona ? (
														<User size={14} className="text-indigo-500" />
													) : (
														isPositiveGuess ? <Check size={14} className="text-green-500"/> : <MessageCircle size={14} className="text-yellow-600"/>
													)}
													<span className="text-sm font-medium">
														{item.isPersona && item.fullPersonaDetails
															? item.fullPersonaDetails
															: item.name}
													</span>
												</div>
											</div>
										);
									})}
								</div>
							</div>
						</Card>
					);
				})}

				{/* Raw Data Section - Toggleable */}
				{hasRawData && (
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
									{rawScenarios && (
										<div>
											<h4 className="text-base font-medium mb-3 text-gray-900">
												Generated Solutions (Raw):
											</h4>
											<pre className="whitespace-pre-wrap bg-gray-50 p-6 rounded-lg text-sm text-gray-700 max-h-[300px] overflow-y-auto">
												{rawScenarios}
											</pre>
										</div>
									)}
									{rawPersonas && (
										<div>
											<h4 className="text-base font-medium mb-3 text-gray-900">
												Market Personas (Raw):
											</h4>
											<pre className="whitespace-pre-wrap bg-gray-50 p-6 rounded-lg text-sm text-gray-700 max-h-[300px] overflow-y-auto">
												{rawPersonas}
											</pre>
										</div>
									)}
									{rawFeedback && (
										<div>
											<h4 className="text-base font-medium mb-3 text-gray-900">
												Analysis & Feedback (Raw):
											</h4>
											<pre className="whitespace-pre-wrap bg-gray-50 p-6 rounded-lg text-sm text-gray-700 max-h-[300px] overflow-y-auto">
												{rawFeedback}
											</pre>
										</div>
									)}
								</div>
							)}
						</div>
					</Card>
				)}
			</div>
		</div>
	);
}
