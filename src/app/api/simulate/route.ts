import { runSimulation } from "@/lib/simulation";
import type { SimulationInput, SimulationResult } from "@/lib/types";
import { NextResponse } from "next/server";

/**
 * Type for the request body
 */
interface RequestBody {
	companyInfo?: string;
	marketChallenge?: string;
	apiKey?: string;
}

/**
 * Type guard to check if all required fields are present
 */
function hasRequiredFields(body: RequestBody): body is Required<RequestBody> {
	return Boolean(
		body.companyInfo?.trim() &&
			body.marketChallenge?.trim() &&
			body.apiKey?.trim(),
	);
}

/**
 * Validates the simulation input data
 */
function validateInput(body: RequestBody): {
	isValid: boolean;
	error?: string;
	details?: string;
} {
	// Check for required fields
	if (!body.companyInfo?.trim()) {
		return {
			isValid: false,
			error: "Missing required field",
			details: "Company information is required",
		};
	}

	if (!body.marketChallenge?.trim()) {
		return {
			isValid: false,
			error: "Missing required field",
			details: "Market challenge is required",
		};
	}

	if (!body.apiKey?.trim()) {
		return {
			isValid: false,
			error: "Missing API key",
			details: "OpenAI API key is required",
		};
	}

	// Validate field lengths
	if (body.companyInfo.trim().length < 50) {
		return {
			isValid: false,
			error: "Invalid input",
			details: "Company information must be at least 50 characters long",
		};
	}

	if (body.marketChallenge.trim().length < 50) {
		return {
			isValid: false,
			error: "Invalid input",
			details: "Market challenge must be at least 50 characters long",
		};
	}

	return { isValid: true };
}

/**
 * POST handler for the simulation endpoint
 */
export async function POST(request: Request) {
	try {
		// Parse the request body
		const body = await request.json();

		// Validate the request body
		if (!hasRequiredFields(body)) {
			return NextResponse.json(
				{
					error: "Missing required fields",
					details:
						"Please provide all required fields: companyInfo, marketChallenge, and apiKey",
				},
				{ status: 400 },
			);
		}

		// Validate the input data
		const validation = validateInput(body);
		if (!validation.isValid) {
			return NextResponse.json(
				{
					error: validation.error,
					details: validation.details,
				},
				{ status: 400 },
			);
		}

		// Run the simulation
		const result = await runSimulation({
			companyInfo: body.companyInfo.trim(),
			marketChallenge: body.marketChallenge.trim(),
			apiKey: body.apiKey.trim(),
		});

		// Return the result
		return NextResponse.json(result);
	} catch (error) {
		console.error("Simulation error:", error);
		return NextResponse.json(
			{
				error: "Failed to run simulation",
				details:
					error instanceof Error ? error.message : "Unknown error occurred",
			},
			{ status: 500 },
		);
	}
}
