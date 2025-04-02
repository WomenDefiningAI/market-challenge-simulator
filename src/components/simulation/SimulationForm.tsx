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
				<div className="flex items-center gap-2 mb-4">
					<div className="h-2 w-2 rounded-full bg-pink-500" />
					<h2 className="text-xl font-bold text-pink-600">API Configuration</h2>
				</div>
				<p className="text-gray-600 mb-4">
					Enter your OpenAI API key to enable AI-powered analysis
				</p>
				<div className="space-y-2">
					<label htmlFor="apiKey" className="block font-medium text-gray-700">
						OpenAI API Key
					</label>
					<input
						type="password"
						id="apiKey"
						name="apiKey"
						className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:ring-pink-500"
						placeholder="Enter your OpenAI API key..."
						required
					/>
				</div>
			</Card>

			<Card className="bg-white p-6">
				<div className="flex items-center gap-2 mb-4">
					<div className="h-2 w-2 rounded-full bg-blue-500" />
					<h2 className="text-xl font-bold text-blue-600">Company Information</h2>
				</div>
				<p className="text-gray-600 mb-4">
					Provide details about your company and current market position
				</p>
				<div className="space-y-2">
					<label htmlFor="companyInfo" className="block font-medium text-gray-700">
						Company Information
					</label>
					<textarea
						id="companyInfo"
						name="companyInfo"
						rows={4}
						className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500"
						placeholder="Describe your company's core business, size, and funding status..."
						required
					/>
				</div>
			</Card>

			<Card className="bg-white p-6">
				<div className="flex items-center gap-2 mb-4">
					<div className="h-2 w-2 rounded-full bg-green-500" />
					<h2 className="text-xl font-bold text-green-600">Market Challenge</h2>
				</div>
				<p className="text-gray-600 mb-4">
					Describe the market entry opportunity or challenge you're facing
				</p>
				<div className="space-y-2">
					<label htmlFor="marketChallenge" className="block font-medium text-gray-700">
						Market Challenge
					</label>
					<textarea
						id="marketChallenge"
						name="marketChallenge"
						rows={4}
						className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-green-500"
						placeholder="Describe the new market entry opportunity or challenge..."
						required
					/>
				</div>
			</Card>

			{error && (
				<div className="p-4 bg-red-50 border border-red-200 rounded-lg">
					<p className="text-red-600">{error}</p>
				</div>
			)}

			<Button
				type="submit"
				className="w-full"
				disabled={loading}
			>
				{loading ? "Running Simulation..." : "Run Simulation"}
			</Button>
		</form>
	);
}
