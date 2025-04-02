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
	const [rawResponse, setRawResponse] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setRawResponse(null);

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
				throw new Error("Failed to run simulation");
			}

			const result: SimulationResult = await response.json();
			setRawResponse(result.marketAnalysis);
			if (onSubmit) {
				onSubmit(result);
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	};

	if (rawResponse) {
		return (
			<Card className="bg-white p-6">
				<h2 className="text-xl font-bold mb-4 text-primary">Raw LLM Response</h2>
				<pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg text-sm border">
					{rawResponse}
				</pre>
				<div className="mt-4 flex justify-end">
					<Button
						onClick={() => {
							setRawResponse(null);
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
					<p className="text-sm text-gray-500">
						Your API key is only used for this simulation and is not stored.
					</p>
				</div>
			</Card>

			<Card className="bg-white p-6">
				<div className="flex items-center gap-2 mb-4">
					<div className="h-2 w-2 rounded-full bg-pink-500" />
					<h2 className="text-xl font-bold text-pink-600">Challenge Statement</h2>
				</div>
				<p className="text-gray-600 mb-4">
					Describe your market entry challenge in detail to get AI-powered insights
				</p>
				<div className="space-y-4">
					<div>
						<label htmlFor="companyInfo" className="block font-medium text-gray-700">
							Company Information
						</label>
						<textarea
							id="companyInfo"
							name="companyInfo"
							className="w-full p-2 border-2 border-gray-200 rounded-lg h-32 focus:border-pink-500 focus:ring-pink-500"
							placeholder="Describe your company's core business, size, and current market position..."
							required
						/>
					</div>
					<div>
						<label htmlFor="marketChallenge" className="block font-medium text-gray-700">
							Market Challenge
						</label>
						<textarea
							id="marketChallenge"
							name="marketChallenge"
							className="w-full p-2 border-2 border-gray-200 rounded-lg h-32 focus:border-pink-500 focus:ring-pink-500"
							placeholder="Describe the new market opportunity or challenge you're facing..."
							required
						/>
					</div>
				</div>
			</Card>

			{error && (
				<div className="rounded-lg bg-red-50 p-4 text-red-600">
					<p className="text-sm font-medium">Error: {error}</p>
				</div>
			)}

			<Button
				type="submit"
				className="w-full bg-pink-600 hover:bg-pink-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
				disabled={loading}
			>
				{loading ? (
					<>
						<svg
							className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							aria-label="Loading indicator"
						>
							<title>Loading animation</title>
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="4"
							/>
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							/>
						</svg>
						Analyzing Challenge...
					</>
				) : (
					"Analyze Challenge"
				)}
			</Button>
		</form>
	);
}
