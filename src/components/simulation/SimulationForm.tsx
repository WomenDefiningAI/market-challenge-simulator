"use client";

import type { SimulationInput, SimulationResult } from "@/lib/types";
import { useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

interface SimulationFormProps {
	onSubmit?: (result: SimulationResult | null) => void;
}

export function SimulationForm({ onSubmit }: SimulationFormProps) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [result, setResult] = useState<SimulationResult | null>(null);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setResult(null);

		const formData = new FormData(e.currentTarget);
		const input: SimulationInput = {
			apiKey: formData.get("apiKey") as string,
			companyInfo: formData.get("companyInfo") as string,
			marketChallenge: formData.get("marketChallenge") as string,
		};

		try {
			const response = await fetch("/api/simulate", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(input),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.details || "Failed to run simulation");
			}

			const result: SimulationResult = await response.json();
			setResult(result);
			if (onSubmit) {
				onSubmit(result);
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	};

	if (result) {
		return (
			<Card className="bg-white p-6">
				<h2 className="text-xl font-bold mb-4 text-primary">Simulation Results</h2>
				<div className="space-y-6">
					<div>
						<h3 className="text-lg font-semibold mb-2">Business Scenarios</h3>
						<pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg text-sm border">
							{result.scenarios}
						</pre>
					</div>
					<div>
						<h3 className="text-lg font-semibold mb-2">Market Personas</h3>
						<pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg text-sm border">
							{result.personas}
						</pre>
					</div>
					<div>
						<h3 className="text-lg font-semibold mb-2">Persona Feedback</h3>
						<pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg text-sm border">
							{result.feedback}
						</pre>
					</div>
				</div>
				<div className="mt-4 flex justify-end">
					<Button
						onClick={() => {
							setResult(null);
							if (onSubmit) {
								onSubmit(null);
							}
						}}
						variant="outline"
					>
						Back to Form
					</Button>
				</div>
			</Card>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<Card className="bg-white p-6">
				<h2 className="text-xl font-bold mb-4 text-primary">Market Entry Strategy Simulator</h2>
				<p className="text-gray-600 mb-6">
					Enter your company details and market challenge to generate strategic insights.
				</p>

				<div className="space-y-4">
					<div>
						<label htmlFor="companyInfo" className="block font-medium text-gray-700 mb-2">
							Company Information
						</label>
						<textarea
							id="companyInfo"
							name="companyInfo"
							rows={4}
							className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-primary"
							placeholder="Describe your company's size, current products, and additional details..."
							required
						/>
					</div>

					<div>
						<label htmlFor="marketChallenge" className="block font-medium text-gray-700 mb-2">
							Market Challenge
						</label>
						<textarea
							id="marketChallenge"
							name="marketChallenge"
							rows={4}
							className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-primary"
							placeholder="Describe your current market situation and the challenge you're facing..."
							required
						/>
					</div>

					<div>
						<label htmlFor="apiKey" className="block font-medium text-gray-700 mb-2">
							OpenAI API Key
						</label>
						<input
							type="password"
							id="apiKey"
							name="apiKey"
							className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-primary"
							placeholder="Enter your OpenAI API key..."
							required
						/>
					</div>
				</div>

				{error && (
					<div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
						<p className="text-red-600">{error}</p>
					</div>
				)}

				<Button
					type="submit"
					className="w-full mt-6"
					disabled={loading}
				>
					{loading ? "Running Simulation..." : "Run Simulation"}
				</Button>
			</Card>
		</form>
	);
}
