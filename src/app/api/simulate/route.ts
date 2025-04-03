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
		const body = await request.json();
		const { companyInfo, marketChallenge, apiKey } = body;

		// Validate required fields
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
			companyInfo,
			marketChallenge,
			apiKey,
		});

		// Return the result
		return NextResponse.json(result);
	} catch (error: any) {
		console.error("API Error:", error);

		// Handle SimulationError with specific error codes
		if (error?.name === "SimulationError") {
			return NextResponse.json(
				{
					error: error.message,
					code: error.code,
					details: error.details,
				},
				{ status: error.code === "INVALID_API_KEY" ? 401 : 500 },
			);
		}

		// Handle other errors
		return NextResponse.json(
			{
				error: "Internal server error",
				code: "UNKNOWN_ERROR",
				details: error?.message || "An unexpected error occurred",
			},
			{ status: 500 },
		);
	}
}
