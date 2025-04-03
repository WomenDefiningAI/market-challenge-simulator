interface ParsedSolution {
	title: string;
	solutionName: string;
	feasibilityScore: number;
	returnScore: number;
	positivePersonas: Array<{ role: string; feedback: string }>;
	negativePersonas: Array<{ role: string; feedback: string }>;
}

interface ParsedReport {
	leastRisky: ParsedSolution;
	mostLikely: ParsedSolution;
	wildcard: ParsedSolution;
}

export function parseSimulationOutput(
	scenarios: string,
	personas: string,
	feedback: string,
): ParsedReport {
	// Parse the risk scores and rankings from the feedback
	const riskScores = new Map<string, number>();
	const solutionTitles = new Map<string, string>();

	// Extract solution titles and risk scores
	feedback.split("---").forEach((section) => {
		const titleMatch = section.match(/Analysis for Solution \d+: (.+?)\n/);
		const riskMatch = section.match(/Risk Score: (\d+)%/);

		if (titleMatch && riskMatch) {
			const title = titleMatch[1].trim();
			const risk = Number.parseInt(riskMatch[1]);
			riskScores.set(title, risk);
			solutionTitles.set(title, section);
		}
	});

	// Sort solutions by risk score
	const sortedSolutions = Array.from(riskScores.entries()).sort(
		([, a], [, b]) => a - b,
	);

	function parsePersonaFeedback(solutionSection: string) {
		const positivePersonas: Array<{ role: string; feedback: string }> = [];
		const negativePersonas: Array<{ role: string; feedback: string }> = [];

		// Extract persona feedback sections
		const personaSection =
			solutionSection
				.split("Persona Feedback:")[1]
				?.split("Overall analysis:")[0] || "";
		const personas = personaSection.split("\n\n").filter(Boolean);

		personas.forEach((persona) => {
			const roleMatch = persona.match(/- (.+?) \(/);
			if (!roleMatch) return;

			const role = roleMatch[1].trim();
			const sentiment = persona.includes("Initial reaction: Positive")
				? "positive"
				: "negative";
			const benefitsMatch = persona.match(/Potential benefits: (.+?)(?:\n|$)/);
			const concernsMatch = persona.match(/Key concerns: (.+?)(?:\n|$)/);

			const feedback =
				sentiment === "positive"
					? benefitsMatch?.[1] || "Sees potential benefits"
					: concernsMatch?.[1] || "Has some concerns";

			if (sentiment === "positive") {
				positivePersonas.push({ role, feedback });
			} else {
				negativePersonas.push({ role, feedback });
			}
		});

		return { positivePersonas, negativePersonas };
	}

	function calculateConfidenceScores(solutionSection: string) {
		const feasibilityMatch = solutionSection.match(/Market readiness: (\d+)%/);
		const returnMatch = solutionSection.match(/Resource requirements: (\d+)%/);

		return {
			feasibilityScore: feasibilityMatch
				? Number.parseInt(feasibilityMatch[1])
				: 50,
			returnScore: returnMatch ? 100 - Number.parseInt(returnMatch[1]) : 50, // Invert resource requirements
		};
	}

	// Get the three solutions we need
	const leastRisky = sortedSolutions[0];
	const mostLikely = sortedSolutions[Math.floor(sortedSolutions.length / 2)];
	const wildcard = sortedSolutions[sortedSolutions.length - 1];

	function createSolutionAnalysis(
		title: string,
		solutionName: string,
		solutionSection: string,
	): ParsedSolution {
		const { positivePersonas, negativePersonas } =
			parsePersonaFeedback(solutionSection);
		const { feasibilityScore, returnScore } =
			calculateConfidenceScores(solutionSection);

		return {
			title,
			solutionName,
			feasibilityScore,
			returnScore,
			positivePersonas,
			negativePersonas,
		};
	}

	return {
		leastRisky: createSolutionAnalysis(
			"Least Risky Solution",
			leastRisky[0],
			solutionTitles.get(leastRisky[0]) || "",
		),
		mostLikely: createSolutionAnalysis(
			"Most Likely to Succeed",
			mostLikely[0],
			solutionTitles.get(mostLikely[0]) || "",
		),
		wildcard: createSolutionAnalysis(
			"Wildcard Solution",
			wildcard[0],
			solutionTitles.get(wildcard[0]) || "",
		),
	};
}
