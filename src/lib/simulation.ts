import { analyzeMarket } from "./openai";
import type {
	AdoptionCurveData,
	ConsumerSegment,
	SimulationInput,
	SimulationResult,
} from "./types";

export class SimulationError extends Error {
	constructor(
		message: string,
		public readonly code?: string,
	) {
		super(message);
		this.name = "SimulationError";
	}
}

function parsePersonas(analysis: string): ConsumerSegment[] {
	const segments: ConsumerSegment[] = [];
	const personasSection = analysis.match(
		/MARKET PERSONAS\n(.*?)(?=STRATEGIC RECOMMENDATIONS)/s,
	)?.[1];

	if (!personasSection) return segments;

	// Split into individual personas
	const personaBlocks = personasSection.split(/\d+\.\s+/).filter(Boolean);

	for (const block of personaBlocks) {
		const nameMatch = block.match(/(?:Early Adopter|Mainstream)\s*-\s*([^(]+)/);
		const name = nameMatch?.[1]?.trim() || "";

		const segmentType = block.includes("15% early adopter")
			? "Early Adopters"
			: "Mainstream Market";
		const segmentSize = segmentType === "Early Adopters" ? "15%" : "60%";

		const background = block.match(/Background:\s*([^\n]+)/)?.[1]?.trim() || "";

		const characteristics = block
			.match(/Key Characteristics:[\s\S]*?(?=Goals:|-\s*Goals:)/)?.[0]
			?.split("*")
			.map((c) => c.trim())
			.filter((c) => c && !c.includes("Key Characteristics"));

		const goals =
			block
				.match(/Goals:\s*([^\n]+)/)?.[1]
				?.split(",")
				.map((g) => g.trim())
				.filter(Boolean) || [];

		const painPoints =
			block
				.match(/Pain Points:\s*([^\n]+)/)?.[1]
				?.split(",")
				.map((p) => p.trim())
				.filter(Boolean) || [];

		const likelihood =
			Number.parseFloat(
				block.match(/Adoption Likelihood:\s*(\d+)/)?.[1] || "0",
			) / 100;

		segments.push({
			name: name || segmentType,
			description: background,
			size: segmentSize,
			keyCharacteristics: [...(characteristics || []), ...goals, ...painPoints],
			adoptionLikelihood: likelihood,
		});
	}

	return segments;
}

function parseRecommendations(analysis: string): string[] {
	const recommendationsMatch = analysis.match(
		/STRATEGIC RECOMMENDATIONS\n(.*?)(?=ADOPTION TIMELINE|\n\n)/s,
	);
	if (recommendationsMatch) {
		return recommendationsMatch[1]
			.split("\n")
			.map((r) => r.replace(/^\d+\.\s*/, "").trim())
			.filter(Boolean);
	}
	return [];
}

function parseAdoptionTimeline(analysis: string): AdoptionCurveData[] {
	const timelineMatch = analysis.match(/ADOPTION TIMELINE\n(.*?)(?=\n\n|$)/s);
	if (timelineMatch) {
		return timelineMatch[1]
			.split("\n")
			.map((line) => {
				const match = line.match(/Month (\d+): (\d+(?:\.\d+)?)% - (.+)/);
				if (match) {
					return {
						month: Number.parseInt(match[1]),
						adoptionRate: Number.parseFloat(match[2]) / 100,
						segment: match[3].trim(),
					};
				}
				return null;
			})
			.filter((entry): entry is AdoptionCurveData => entry !== null);
	}
	return [];
}

export async function runSimulation(
	input: SimulationInput,
): Promise<SimulationResult> {
	try {
		const analysis = await analyzeMarket(input);
		const personas = parsePersonas(analysis);
		const recommendations = parseRecommendations(analysis);
		const adoptionTimeline = parseAdoptionTimeline(analysis);

		// Calculate adoption curve from timeline
		const adoptionCurve = {
			earlyAdopters:
				adoptionTimeline.find((t) => t.month === 3)?.adoptionRate || 0,
			mainstream:
				adoptionTimeline.find((t) => t.month === 6)?.adoptionRate || 0,
			lateAdopters:
				adoptionTimeline.find((t) => t.month === 12)?.adoptionRate || 0,
		};

		return {
			marketAnalysis: analysis,
			personas: personas,
			feedback: [],
			recommendations,
			adoptionCurve,
		};
	} catch (error) {
		if (error instanceof Error) {
			throw new SimulationError(
				`OpenAI API Error: ${error.message}`,
				error instanceof SimulationError ? error.code : "API_ERROR",
			);
		}
		throw new SimulationError("Unknown error occurred");
	}
}
