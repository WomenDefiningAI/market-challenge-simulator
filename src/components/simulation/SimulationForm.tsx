"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type {
	CompletionEvent,
	ErrorEvent,
	FeedbackScoresEvent,
	ParsedSimulationResult,
	PersonaSummaryEvent,
	ScenarioTitlesEvent,
	SimulationStreamEvent,
	StageUpdateEvent
} from "@/lib/types";
import { Activity, CheckCircle2, Eye, EyeOff, ListChecks, Loader2, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SimulationReport } from "./SimulationReport";
import { SimulatorHeader } from "./SimulatorHeader";

interface ErrorDisplay {
	message: string;
	details?: string;
	code?: string;
}

const SIMULATION_STAGES_INFO = [
	{ id: "scenario_generation", text: "Generating potential market entry strategies...", Icon: ListChecks },
	{ id: "persona_generation", text: "Creating market personas and stakeholders...", Icon: Users },
	{ id: "feedback_generation", text: "Simulating market reactions and feedback...", Icon: Activity },
	{ id: "parsing", text: "Generating final report...", Icon: ListChecks },
	{ id: "complete", text: "Simulation Complete", Icon: CheckCircle2 },
	{ id: "error", text: "Simulation Error", Icon: CheckCircle2 }
];

export function SimulationForm() {
	const [companyInfo, setCompanyInfo] = useState("");
	const [marketChallenge, setMarketChallenge] = useState("");
	const [apiKey, setApiKey] = useState("");
	const [showApiKey, setShowApiKey] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [currentStageId, setCurrentStageId] = useState<string | null>(null);
	const [error, setError] = useState<ErrorDisplay | null>(null);
	const [result, setResult] = useState<ParsedSimulationResult | null>(null);
	const [showReport, setShowReport] = useState(false);

	const [interimTitles, setInterimTitles] = useState<string[]>([]);
	const [interimPersonas, setInterimPersonas] = useState<Array<{ name: string; description: string; age?: string; role?: string }>>([]);
	const [interimScores, setInterimScores] = useState<Array<{ title: string; feasibility: number; return: number }>>([]);
	const [currentStageMessage, setCurrentStageMessage] = useState<string>("");

	const eventSourceRef = useRef<EventSource | null>(null);

	useEffect(() => {
		return () => {
			if (eventSourceRef.current) {
				eventSourceRef.current.close();
				eventSourceRef.current = null;
				console.log("EventSource closed on unmount/cleanup");
			}
		};
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);
		setResult(null);
		setShowReport(false);
		setInterimTitles([]);
		setInterimPersonas([]);
		setInterimScores([]);
		setCurrentStageId(null);
		setCurrentStageMessage("Initiating simulation...");

		if (eventSourceRef.current) {
			eventSourceRef.current.close();
			eventSourceRef.current = null;
		}

		try {
			fetch("/api/simulate/stream", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ companyInfo, marketChallenge, apiKey }),
			})
			.then(response => {
				if (!response.ok) {
					return response.json().then(errData => {
						throw {
							message: errData.error || `HTTP error! status: ${response.status}`,
							code: errData.code,
							details: errData.details
						};
					});
				}
				if (!response.body) {
					throw { message: "Response body is null" };
				}

				const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
				let buffer = "";

				function processStream() {
					reader.read().then(({ done, value }) => {
						if (done) {
							console.log("Stream finished.");
							if (isLoading) {
								setError({ message: "Simulation stream ended unexpectedly." });
								setIsLoading(false);
							}
							return;
						}

						buffer += value;
						const parts = buffer.split("\n\n");
						
						for (let i = 0; i < parts.length - 1; i++) {
							const message = parts[i];
							if (message.startsWith("event: message\n") && message.includes("\ndata: ")) {
								const dataLine = message.split("\ndata: ")[1];
								if (dataLine) {
									try {
										const jsonData = JSON.parse(dataLine);
										const event = jsonData as SimulationStreamEvent;

										console.log("Received SSE:", event.type, event);

										switch (event.type) {
											case "scenario_generation":
												setCurrentStageId(event.type);
												if ('message' in event) setCurrentStageMessage(event.message);
												if ('data' in event) setInterimTitles(event.data.titles);
												break;
											case "persona_generation":
												setCurrentStageId(event.type);
												if ('message' in event) setCurrentStageMessage(event.message);
												if ('data' in event) setInterimPersonas(event.data.personas);
												break;
											case "feedback_generation":
												setCurrentStageId(event.type);
												if ('message' in event) setCurrentStageMessage(event.message);
												if ('data' in event) setInterimScores(event.data.scores);
												break;
											case "parsing":
												setCurrentStageId(event.type);
												if ('message' in event) setCurrentStageMessage(event.message);
												break;
											case "complete":
												setCurrentStageId(event.type);
												setCurrentStageMessage("Simulation Complete");
												setResult((event as CompletionEvent).data);
												setShowReport(true);
												setIsLoading(false);
												reader.cancel();
												break;
											case "error":
												setCurrentStageId(event.type);
												setError((event as ErrorEvent).error);
												setIsLoading(false);
												reader.cancel();
												break;
										}
									} catch (parseError) {
										console.error("Failed to parse SSE data:", dataLine, parseError);
									}
								}
							}
						}
						buffer = parts[parts.length - 1];
						processStream();
						
					}).catch(streamError => {
						console.error("Stream reading error:", streamError);
						setError({ message: "Error reading simulation stream." });
						setIsLoading(false);
					});
				}

				processStream();

			})
			.catch(err => {
				console.error("Simulation fetch/setup error:", err);
				const error = err as { message?: string; code?: string; details?: string };
				setError({
					message: error.message || "Failed to start simulation",
					code: error.code,
					details: error.details,
				});
				setIsLoading(false);
			});

		} catch (err) {
			console.error("Unexpected error in handleSubmit:", err);
			setError({
				message: "An unexpected error occurred.",
			});
			setIsLoading(false);
		}
	};

	if (showReport && result && result.solutions) {
		return (
			<SimulationReport
				companyInfo={companyInfo}
				marketChallenge={marketChallenge}
				solutions={result.solutions}
				rawScenarios={result.rawScenarios}
				rawPersonas={result.rawPersonas}
				rawFeedback={result.rawFeedback}
				onBack={() => setShowReport(false)}
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
									className="w-full py-6 text-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-70 disabled:cursor-not-allowed"
									disabled={isLoading || !companyInfo || !marketChallenge || !apiKey}
								>
									{isLoading ? (
										<span className="flex items-center justify-center gap-2">
											<Loader2 className="animate-spin" size={24} />
											Running Simulation...
										</span>
									) : (
										"Run Simulation"
									)}
								</Button>

								{isLoading && (
									<div className="mt-6 space-y-4">
										{SIMULATION_STAGES_INFO.filter(s => s.id !== 'complete' && s.id !== 'error').map((stageInfo, idx) => {
											const currentStageIndex = SIMULATION_STAGES_INFO.findIndex(s => s.id === currentStageId);
											const isActive = currentStageId === stageInfo.id;
											const isDone = currentStageIndex > idx;
											
											return (
												<div key={stageInfo.id} className="transition-opacity duration-500 space-y-2">
													<div className={`flex items-center gap-3 ${!isActive && !isDone ? 'opacity-40' : 'opacity-100'}`}>
														<div className={`w-4 h-4 rounded-full flex-shrink-0 ${isDone ? "bg-pink-500" : isActive ? "bg-indigo-500 animate-pulse" : "bg-gray-200"}`} />
														<span className={`text-sm ${isDone ? "text-pink-700" : isActive ? "text-indigo-700 font-medium" : "text-gray-500"}`}>
															{isActive ? currentStageMessage : stageInfo.text}
														</span>
													</div>
													{(isActive || isDone) && (
														<div className="pl-7 text-xs text-gray-600">
															{stageInfo.id === 'scenario_generation' && interimTitles.length > 0 && (
																<ul className="list-disc list-inside">{interimTitles.map(t => <li key={t}>{t}</li>)}</ul>
															)}
															{stageInfo.id === 'persona_generation' && interimPersonas.length > 0 && (
																<ul className="list-disc list-inside space-y-1">
																	{interimPersonas.map(p => <li key={p.name}><b>{p.name}</b>: {p.description.substring(0, 70)}...</li>)}
																</ul>
															)}
															{stageInfo.id === 'feedback_generation' && interimScores.length > 0 && (
																<ul className="list-disc list-inside space-y-1">
																	{interimScores.map(s => <li key={s.title}><b>{s.title}</b>: Feasibility {s.feasibility}%, Return {s.return}%</li>)}
																</ul>
															)}
														</div>
													)}
												</div>
											);
										})}
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
			</div>
		</div>
	);
}
