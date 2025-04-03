"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { SimulationReport } from "./SimulationReport";

interface ErrorDisplay {
	message: string;
	details?: string;
	code?: string;
}

export function SimulationForm() {
	const [companyInfo, setCompanyInfo] = useState("");
	const [marketChallenge, setMarketChallenge] = useState("");
	const [apiKey, setApiKey] = useState("");
	const [showApiKey, setShowApiKey] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<ErrorDisplay | null>(null);
	const [result, setResult] = useState<{
		scenarios: string;
		personas: string;
		feedback: string;
	} | null>(null);
	const [showReport, setShowReport] = useState(false);

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
		<div className="container mx-auto px-4 py-8 max-w-2xl">
			<h1 className="text-4xl font-bold text-center mb-2">Market Entry Simulator</h1>
			<h2 className="text-xl text-center text-muted-foreground mb-12">
				Test new markets. Simulate outcomes.
			</h2>

			<form onSubmit={handleSubmit}>
				<Card className="p-6">
					<div className="space-y-4">
						<div>
							<Label htmlFor="companyInfo">Company Information</Label>
							<Textarea
								id="companyInfo"
								value={companyInfo}
								onChange={(e) => setCompanyInfo(e.target.value)}
								placeholder="Describe your company, product, or service..."
								className="mt-1"
								rows={4}
							/>
						</div>

						<div>
							<Label htmlFor="marketChallenge">Market Challenge</Label>
							<Textarea
								id="marketChallenge"
								value={marketChallenge}
								onChange={(e) => setMarketChallenge(e.target.value)}
								placeholder="Describe the market challenge or opportunity..."
								className="mt-1"
								rows={4}
							/>
						</div>

						<div>
							<Label htmlFor="apiKey">OpenAI API Key</Label>
							<div className="relative">
								<Input
									id="apiKey"
									type={showApiKey ? "text" : "password"}
									value={apiKey}
									onChange={(e) => setApiKey(e.target.value)}
									placeholder="sk-..."
									className="mt-1 pr-10"
								/>
								<button
									type="button"
									onClick={() => setShowApiKey(!showApiKey)}
									className="absolute right-2 top-[calc(50%+2px)] transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
								>
									{showApiKey ? <EyeOff size={20} /> : <Eye size={20} />}
								</button>
							</div>
							{error?.code === "INVALID_API_KEY" && (
								<p className="text-sm text-destructive mt-1">
									{error.details || "Please check your API key and try again"}
								</p>
							)}
						</div>

						<Button
							type="submit"
							className="w-full"
							disabled={isLoading || !companyInfo || !marketChallenge || !apiKey}
						>
							{isLoading ? "Running Simulation..." : "Run Simulation"}
						</Button>
					</div>
				</Card>
			</form>

			{error && (
				<Card className="p-6 mt-8 bg-destructive/10">
					<p className="text-destructive font-medium">{error.message}</p>
					{error.details && error.code !== "INVALID_API_KEY" && (
						<p className="text-destructive/80 text-sm mt-1">{error.details}</p>
					)}
				</Card>
			)}

			{result && !showReport && (
				<div className="mt-8 space-y-8">
					<Card className="p-6">
						<h3 className="text-xl font-semibold mb-4">Raw Simulation Results</h3>
						<div className="space-y-4">
							<div>
								<h4 className="font-medium mb-2">Generated Solutions:</h4>
								<pre className="whitespace-pre-wrap bg-muted p-4 rounded-lg">
									{result.scenarios}
								</pre>
							</div>
							<div>
								<h4 className="font-medium mb-2">Market Personas:</h4>
								<pre className="whitespace-pre-wrap bg-muted p-4 rounded-lg">
									{result.personas}
								</pre>
							</div>
							<div>
								<h4 className="font-medium mb-2">Analysis & Feedback:</h4>
								<pre className="whitespace-pre-wrap bg-muted p-4 rounded-lg">
									{result.feedback}
								</pre>
							</div>
							<Button
								onClick={() => setShowReport(true)}
								className="w-full"
							>
								Generate Report
							</Button>
						</div>
					</Card>
				</div>
			)}
		</div>
	);
}
