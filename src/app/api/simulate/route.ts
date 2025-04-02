import { runSimulation } from "@/lib/simulation";
import type { SimulationInput } from "@/lib/types";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const input: SimulationInput = {
			companyInfo: body.companyInfo,
			marketChallenge: body.marketChallenge,
		};

		const result = await runSimulation(input);
		return NextResponse.json(result);
	} catch (error) {
		console.error("Simulation error:", error);
		return NextResponse.json(
			{ error: "Failed to run simulation" },
			{ status: 500 },
		);
	}
}
