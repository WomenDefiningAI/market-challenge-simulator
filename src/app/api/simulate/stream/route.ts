import { streamSimulation } from "@/lib/simulation";
import type { SimulationInput, SimulationStreamEvent } from "@/lib/types";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // Ensure dynamic execution for streaming

/**
 * POST handler for the simulation streaming endpoint
 */
export async function POST(request: Request) {
	try {
		const body = await request.json();

		if (!body.companyInfo || !body.marketChallenge || !body.apiKey) {
			// Cannot return JSON in a streaming response easily, handle client-side?
			// Or maybe throw an error that gets caught and streamed as an error event.
			// For now, let's throw, assuming the generator handles it.
			throw new Error(
				"Missing required fields (companyInfo, marketChallenge, apiKey)",
			);
		}

		const input: SimulationInput = {
			companyInfo: body.companyInfo,
			marketChallenge: body.marketChallenge,
			apiKey: body.apiKey,
		};

		const encoder = new TextEncoder();
		const stream = new ReadableStream({
			async start(controller) {
				try {
					for await (const event of streamSimulation(input)) {
						// Format as SSE: event: message\ndata: {JSON}\n\n
						const sseFormattedEvent = `event: message\ndata: ${JSON.stringify(event)}\n\n`;
						controller.enqueue(encoder.encode(sseFormattedEvent));

						// If it's a final event (complete or error), close the stream
						if (event.type === "complete" || event.type === "error") {
							break; // Exit the loop after sending final event
						}
					}
				} catch (error) {
					console.error("Stream generation failed:", error);
					// Send an error event if the generator itself throws unexpectedly
					const errorPayload: SimulationStreamEvent = {
						type: "error",
						error: {
							message:
								error instanceof Error ? error.message : "Unknown stream error",
						},
					};
					const sseFormattedError = `event: message\ndata: ${JSON.stringify(errorPayload)}\n\n`;
					controller.enqueue(encoder.encode(sseFormattedError));
				} finally {
					// Ensure the stream is closed
					controller.close();
				}
			},
		});

		return new Response(stream, {
			headers: {
				"Content-Type": "text/event-stream",
				"Cache-Control": "no-cache",
				Connection: "keep-alive",
			},
		});
	} catch (error: unknown) {
		// Catch errors from request parsing *before* the stream starts
		console.error("Pre-stream API error:", error);
		return NextResponse.json(
			{
				error: "Failed to initialize simulation stream",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
