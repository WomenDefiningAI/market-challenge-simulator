import { runSimulation } from "@/lib/simulation";
import type { SimulationInput, SimulationResult } from "@/lib/types";
import { NextResponse } from "next/server";

interface ErrorWithCode {
	message?: string;
	code: string;
	details?: string;
}

/**
 * POST handler for the simulation endpoint
 */
export async function POST(request: Request) {
	try {
		// Parse the request body
		const body = await request.json();

		// Validate required fields
		if (!body.companyInfo || !body.marketChallenge || !body.apiKey) {
			return NextResponse.json(
				{
					error: "Missing required fields",
					details:
						"companyInfo, marketChallenge, and apiKey are required fields",
				},
				{ status: 400 },
			);
		}

		// Create simulation input from request body
		const input: SimulationInput = {
			companyInfo: body.companyInfo,
			marketChallenge: body.marketChallenge,
			apiKey: body.apiKey,
		};

		// Run the simulation
		const result: SimulationResult = await runSimulation(input);

		// Return the simulation result
		return NextResponse.json(result);
	} catch (error: unknown) {
		console.error("Simulation API error:", error);

		// Handle specific error types with code property
		if (typeof error === "object" && error !== null && "code" in error) {
			const typedError = error as ErrorWithCode;

			return NextResponse.json(
				{
					error: typedError.message || "Simulation failed",
					code: typedError.code,
					details: typedError.details,
				},
				{ status: 400 },
			);
		}

		// Generic error handling
		return NextResponse.json(
			{
				error: "Simulation failed",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
