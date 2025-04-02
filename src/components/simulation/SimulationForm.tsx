"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { SimulationInput } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SimulationForm() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setLoading(true);
		setError(null);

		const formData = new FormData(event.currentTarget);
		const input: SimulationInput = {
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

			router.push("/simulation");
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-2xl mx-auto">
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold text-foreground mb-2">Market Entry Simulator</h1>
					<p className="text-muted-foreground">Analyze your market opportunities with AI-powered insights</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-6">
					{error && (
						<div className="rounded-lg bg-destructive/15 p-4 text-destructive">
							<p className="text-sm font-medium">{error}</p>
						</div>
					)}

					<Card className="bg-card border-border/50">
						<CardHeader>
							<div className="flex items-center gap-2">
								<div className="h-2 w-2 rounded-full bg-primary" />
								<CardTitle className="text-lg font-medium text-card-foreground">
									Challenge Statement
								</CardTitle>
							</div>
							<CardDescription className="text-muted-foreground">
								Describe your market entry challenge in detail to get AI-powered insights
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="company-info" className="text-foreground">Company Information</Label>
								<Textarea
									id="company-info"
									name="companyInfo"
									placeholder="Describe your company's core business, size, and current market position..."
									className="min-h-[120px] resize-none bg-background/50 border-border/50 focus:border-primary"
									required
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="market-challenge" className="text-foreground">Market Challenge</Label>
								<Textarea
									id="market-challenge"
									name="marketChallenge"
									placeholder="Describe the new market opportunity or challenge you're facing..."
									className="min-h-[120px] resize-none bg-background/50 border-border/50 focus:border-primary"
									required
								/>
							</div>
						</CardContent>
					</Card>

					<Button 
						type="submit" 
						className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
						disabled={loading}
					>
						{loading ? (
							<>
								<svg
									className="mr-2 h-4 w-4 animate-spin"
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
								Analyzing Challenge...
							</>
						) : (
							'Analyze Challenge'
						)}
					</Button>
				</form>
			</div>
		</div>
	);
}
