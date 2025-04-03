"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { SimulationReport } from "./SimulationReport";
import { SimulatorHeader } from "./SimulatorHeader";

interface ErrorDisplay {
	message: string;
	details?: string;
	code?: string;
}

const SIMULATION_STAGES = [
	"Analyzing company profile and market challenge...",
	"Generating potential market entry strategies...",
	"Creating market personas and stakeholders...",
	"Simulating market reactions and feedback...",
	"Compiling final analysis and recommendations..."
];

export function SimulationForm() {
	const [companyInfo, setCompanyInfo] = useState("");
	const [marketChallenge, setMarketChallenge] = useState("");
	const [apiKey, setApiKey] = useState("");
	const [showApiKey, setShowApiKey] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [currentStage, setCurrentStage] = useState(0);
	const [error, setError] = useState<ErrorDisplay | null>(null);
	const [result, setResult] = useState<{
		scenarios: string;
		personas: string;
		feedback: string;
	} | null>(null);
	const [showReport, setShowReport] = useState(false);

	// Progress through simulation stages
	useEffect(() => {
		if (!isLoading) {
			setCurrentStage(0);
			return;
		}

		const interval = setInterval(() => {
			setCurrentStage((stage) => {
				if (stage >= SIMULATION_STAGES.length - 1) {
					return stage;
				}
				return stage + 1;
			});
		}, 3000);

		return () => clearInterval(interval);
	}, [isLoading]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);
		setResult(null);
		setShowReport(false);

		try {
			const response = await fetch("/api/simulate", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					companyInfo,
					marketChallenge,
					apiKey,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw {
					message: data.error || "Failed to run simulation",
					code: data.code,
					details: data.details,
				};
			}

			setResult(data);
		} catch (err: any) {
			setError({
				message: err.message || "An error occurred",
				code: err.code,
				details: err.details,
			});
		} finally {
			setIsLoading(false);
		}
	};

	if (showReport && result) {
		return (
			<SimulationReport
				companyInfo={companyInfo}
				marketChallenge={marketChallenge}
				scenarios={result.scenarios}
				personas={result.personas}
				feedback={result.feedback}
			/>
		);
	}

	return (
		<div className="min-h-screen bg-white">
			<div className="max-w-4xl mx-auto p-8 my-8 bg-white rounded-lg shadow-sm">
				<SimulatorHeader />

				<form onSubmit={handleSubmit}>
					<Card className="border border-gray-100 shadow-lg mt-8">
						<div className="grid grid-cols-2 gap-8 p-8">
							<div className="space-y-4">
								<Label htmlFor="companyInfo" className="text-lg text-gray-900">Company Profile</Label>
								<Textarea
									id="companyInfo"
									value={companyInfo}
									onChange={(e) => setCompanyInfo(e.target.value)}
									placeholder="Describe your company, product, or service..."
									className="min-h-[200px] text-lg bg-gray-50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 placeholder:text-gray-500"
								/>
							</div>

							<div className="space-y-4">
								<Label htmlFor="marketChallenge" className="text-lg text-gray-900">Market Challenge</Label>
								<Textarea
									id="marketChallenge"
									value={marketChallenge}
									onChange={(e) => setMarketChallenge(e.target.value)}
									placeholder="Describe the market challenge or opportunity..."
									className="min-h-[200px] text-lg bg-gray-50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 placeholder:text-gray-500"
								/>
							</div>

							<div className="col-span-2">
								<Label htmlFor="apiKey" className="text-lg text-gray-900">OpenAI API Key</Label>
								<div className="relative mt-2">
									<Input
										id="apiKey"
										type={showApiKey ? "text" : "password"}
										value={apiKey}
										onChange={(e) => setApiKey(e.target.value)}
										placeholder="sk-..."
										className="pr-10 text-lg py-6 bg-gray-50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 placeholder:text-gray-500"
									/>
									<button
										type="button"
										onClick={() => setShowApiKey(!showApiKey)}
										className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
									>
										{showApiKey ? <EyeOff size={24} /> : <Eye size={24} />}
									</button>
								</div>
								{error?.code === "INVALID_API_KEY" && (
									<p className="text-sm text-red-600 mt-1">
										{error.details || "Please check your API key and try again"}
									</p>
								)}
							</div>

							<div className="col-span-2 mt-4">
								<Button
									type="submit"
									className="w-full py-6 text-lg bg-indigo-600 hover:bg-indigo-700 text-white"
									disabled={isLoading || !companyInfo || !marketChallenge || !apiKey}
								>
									{isLoading ? (
										<span className="flex items-center gap-2">
											<Loader2 className="animate-spin" size={24} />
											Running Simulation...
										</span>
									) : (
										"Run Simulation"
									)}
								</Button>

								{isLoading && (
									<div className="mt-6 space-y-4">
										{SIMULATION_STAGES.map((stage, idx) => (
											<div
												key={stage}
												className={`flex items-center gap-3 transition-opacity duration-500 ${
													idx <= currentStage ? "opacity-100" : "opacity-40"
												}`}
											>
												<div className={`w-4 h-4 rounded-full ${
													idx < currentStage
														? "bg-pink-500"
														: idx === currentStage
														? "bg-indigo-500 animate-pulse"
														: "bg-gray-200"
												}`} />
												<span className={`text-sm ${
													idx < currentStage
														? "text-pink-700"
														: idx === currentStage
														? "text-indigo-700"
														: "text-gray-500"
												}`}>
													{stage}
												</span>
											</div>
										))}
									</div>
								)}
							</div>
						</div>
					</Card>
				</form>

				{error && (
					<Card className="p-6 mt-8 border border-red-200 bg-red-50">
						<p className="text-red-600 font-medium">{error.message}</p>
						{error.details && error.code !== "INVALID_API_KEY" && (
							<p className="text-red-500 text-sm mt-1">{error.details}</p>
						)}
					</Card>
				)}

				{result && !showReport && (
					<div className="mt-8 space-y-8">
						<Card className="border border-gray-100 shadow-lg">
							<div className="p-8">
								<h3 className="text-2xl font-semibold mb-6 text-gray-900">Raw Simulation Results</h3>
								<div className="space-y-6">
									<div>
										<h4 className="text-xl font-medium mb-3 text-gray-900">Generated Solutions:</h4>
										<pre className="whitespace-pre-wrap bg-gray-50 p-6 rounded-lg text-lg text-gray-700">
											{result.scenarios}
										</pre>
									</div>
									<div>
										<h4 className="text-xl font-medium mb-3 text-gray-900">Market Personas:</h4>
										<pre className="whitespace-pre-wrap bg-gray-50 p-6 rounded-lg text-lg text-gray-700">
											{result.personas}
										</pre>
									</div>
									<div>
										<h4 className="text-xl font-medium mb-3 text-gray-900">Analysis & Feedback:</h4>
										<pre className="whitespace-pre-wrap bg-gray-50 p-6 rounded-lg text-lg text-gray-700">
											{result.feedback}
										</pre>
									</div>
									<Button
										onClick={() => setShowReport(true)}
										className="w-full py-6 text-lg bg-indigo-600 hover:bg-indigo-700 text-white"
									>
										Generate Report
									</Button>
								</div>
							</div>
						</Card>
					</div>
				)}
			</div>
		</div>
	);
}
