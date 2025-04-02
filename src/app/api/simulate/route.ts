import { SimulationError, runSimulation } from "@/lib/simulation";
import type { SimulationInput } from "@/lib/types";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		const body = await request.json();

		// Validate required fields
		if (!body.companyInfo?.trim() || !body.marketChallenge?.trim()) {
			return NextResponse.json(
				{
					error: "Missing required fields",
					details: "Both company information and market challenge are required",
				},
				{ status: 400 },
			);
		}

		// Validate API key
		if (!body.apiKey?.trim()) {
			return NextResponse.json(
				{
					error: "Missing API key",
					details: "OpenAI API key is required",
				},
				{ status: 400 },
			);
		}

		const input: SimulationInput = {
			companyInfo: body.companyInfo.trim(),
			marketChallenge: body.marketChallenge.trim(),
			apiKey: body.apiKey.trim(),
		};

		const result = await runSimulation(input);
		return NextResponse.json(result);
	} catch (error) {
		console.error("Simulation error:", error);

		// Handle known error types
		if (error instanceof SimulationError) {
			const errorMessage = error.message;
			const errorCode = error.code;

			switch (errorCode) {
				case "INVALID_API_KEY":
					return NextResponse.json(
						{ error: errorMessage, code: errorCode },
						{ status: 401 },
					);
				case "RATE_LIMIT_EXCEEDED":
					return NextResponse.json(
						{ error: errorMessage, code: errorCode },
						{ status: 429 },
					);
				case "SERVICE_ERROR":
					return NextResponse.json(
						{ error: errorMessage, code: errorCode },
						{ status: 503 },
					);
				default:
					return NextResponse.json(
						{ error: errorMessage, code: errorCode },
						{ status: 500 },
					);
			}
		}

		// Generic error response
		return NextResponse.json(
			{ error: "An unexpected error occurred" },
			{ status: 500 },
		);
	}
}
