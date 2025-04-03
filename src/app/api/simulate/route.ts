import { runSimulation } from "@/lib/simulation";
import { NextResponse } from "next/server";

interface SimulationError extends Error {
	code?: string;
	details?: string;
}

/**
 * POST handler for the simulation endpoint
 */
export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { companyInfo, marketChallenge, apiKey } = body;

		// Basic validation for required fields
		if (!companyInfo || !marketChallenge || !apiKey) {
			return NextResponse.json(
				{
					error: "Missing required fields",
					code: "VALIDATION_ERROR",
					details:
						"Please provide company information, market challenge, and API key",
				},
				{ status: 400 },
			);
		}

		const result = await runSimulation({
			companyInfo,
			marketChallenge,
			apiKey,
		});

		return NextResponse.json(result);
	} catch (error: unknown) {
		console.error("API Error:", error);

		// Handle SimulationError with specific error codes
		if (
			error &&
			typeof error === "object" &&
			"name" in error &&
			error.name === "SimulationError"
		) {
			const simError = error as SimulationError;
			return NextResponse.json(
				{
					error: simError.message,
					code: simError.code,
					details: simError.details,
				},
				{ status: simError.code === "INVALID_API_KEY" ? 401 : 500 },
			);
		}

		// Handle other errors
		return NextResponse.json(
			{
				error: "Internal server error",
				code: "UNKNOWN_ERROR",
				details:
					error instanceof Error
						? error.message
						: "An unexpected error occurred",
			},
			{ status: 500 },
		);
	}
}
