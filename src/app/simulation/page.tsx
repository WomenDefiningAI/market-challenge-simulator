"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { SimulationResult } from "@/lib/types";
import { useEffect, useState } from "react";

export default function SimulationResults() {
	const [result, setResult] = useState<SimulationResult | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		// TODO: Get simulation results from API
		// For now, using mock data
		const mockResult: SimulationResult = {
			segments: [
				{
					name: "Early Adopters",
					description: "Tech-savvy professionals who value innovation",
					size: "15% of target market",
					keyCharacteristics: ["High income", "Tech-savvy", "Influential"],
					adoptionLikelihood: 0.8,
				},
				{
					name: "Mainstream Market",
					description: "Average consumers who follow trends",
					size: "60% of target market",
					keyCharacteristics: [
						"Price sensitive",
						"Brand conscious",
						"Social proof seekers",
					],
					adoptionLikelihood: 0.5,
				},
			],
			recommendations: [
				"Focus on early adopter segment with premium features",
				"Develop strong social proof mechanisms",
				"Consider tiered pricing strategy",
			],
			adoptionCurve: [
				{ month: 1, adoptionRate: 0.05, segment: "Early Adopters" },
				{ month: 3, adoptionRate: 0.15, segment: "Early Adopters" },
				{ month: 6, adoptionRate: 0.25, segment: "Early Adopters" },
				{ month: 12, adoptionRate: 0.35, segment: "Early Adopters" },
			],
		};

		// Simulate API call
		setTimeout(() => {
			setResult(mockResult);
			setLoading(false);
		}, 1000);
	}, []);

	if (loading) {
		return (
			<div className="flex justify-center items-center min-h-[60vh]">
				<div className="flex flex-col items-center gap-4">
					<svg
						className="h-8 w-8 animate-spin text-primary"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						aria-label="Loading"
					>
						<title>Loading</title>
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
					<p className="text-sm text-muted-foreground">Analyzing market data...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="rounded-lg bg-destructive/15 p-4 text-destructive">
				<p className="text-sm font-medium">{error}</p>
			</div>
		);
	}

	if (!result) {
		return null;
	}

	return (
		<div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-4xl mx-auto space-y-8">
				<div className="flex items-center gap-2">
					<div className="h-2 w-2 rounded-full bg-primary" />
					<h1 className="text-2xl font-semibold text-foreground">Market Entry Analysis</h1>
				</div>

				{/* Consumer Segments */}
				<Card className="bg-card border-border/50">
					<CardHeader>
						<div className="flex items-center gap-2">
							<div className="h-1.5 w-1.5 rounded-full bg-primary" />
							<CardTitle className="text-lg font-semibold text-background">Consumer Segments</CardTitle>
						</div>
						<CardDescription className="text-background/70">
							Analysis of key market segments and their characteristics
						</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-6">
						{result.segments.map((segment) => (
							<div key={segment.name} className="space-y-4 p-4 rounded-lg bg-background/10">
								<div className="flex items-center justify-between">
									<h4 className="font-medium text-background">{segment.name}</h4>
									<span className="text-sm text-background/70">{segment.size}</span>
								</div>
								<p className="text-sm text-background/70">{segment.description}</p>
								<div className="space-y-2">
									<div className="text-sm font-medium text-background">Key Characteristics:</div>
									<ul className="grid grid-cols-2 gap-2">
										{segment.keyCharacteristics.map((char) => (
											<li key={char} className="text-sm text-background/70 flex items-center gap-2">
												<span className="text-primary">•</span>
												{char}
											</li>
										))}
									</ul>
								</div>
								<div className="space-y-2">
									<div className="flex items-center justify-between text-sm">
										<span className="font-medium text-background">Adoption Likelihood</span>
										<span className="text-background/70">{(segment.adoptionLikelihood * 100).toFixed(0)}%</span>
									</div>
									<div className="h-2 rounded-full bg-background/10">
										<div
											className="h-full rounded-full bg-primary transition-all"
											style={{ width: `${segment.adoptionLikelihood * 100}%` }}
										/>
									</div>
								</div>
							</div>
						))}
					</CardContent>
				</Card>

				{/* Recommendations */}
				<Card className="bg-card border-border/50">
					<CardHeader>
						<div className="flex items-center gap-2">
							<div className="h-1.5 w-1.5 rounded-full bg-secondary" />
							<CardTitle className="text-lg font-semibold text-background">Strategic Recommendations</CardTitle>
						</div>
						<CardDescription className="text-background/70">
							Key actions to consider for successful market entry
						</CardDescription>
					</CardHeader>
					<CardContent>
						<ul className="grid gap-3">
							{result.recommendations.map((rec) => (
								<li key={rec} className="flex gap-2 items-start">
									<span className="text-secondary mt-1">•</span>
									<span className="text-sm text-background">{rec}</span>
								</li>
							))}
						</ul>
					</CardContent>
				</Card>

				{/* Adoption Curve */}
				<Card className="bg-card border-border/50">
					<CardHeader>
						<div className="flex items-center gap-2">
							<div className="h-1.5 w-1.5 rounded-full bg-primary" />
							<CardTitle className="text-lg font-semibold text-background">Adoption Timeline</CardTitle>
						</div>
						<CardDescription className="text-background/70">
							Projected adoption rates over time
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr className="border-b border-border/50">
										<th className="pb-2 text-left text-sm font-medium text-background">Month</th>
										<th className="pb-2 text-left text-sm font-medium text-background">Adoption Rate</th>
										<th className="pb-2 text-left text-sm font-medium text-background">Segment</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-border/50">
									{result.adoptionCurve.map((data) => (
										<tr key={`${data.month}-${data.segment}`} className="text-sm">
											<td className="py-3 text-background">{data.month}</td>
											<td className="py-3 text-background">{(data.adoptionRate * 100).toFixed(1)}%</td>
											<td className="py-3 text-background/70">{data.segment}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
