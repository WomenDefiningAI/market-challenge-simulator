export interface SimulationInput {
	apiKey: string;
	companyInfo: string;
	marketChallenge: string;
}

export interface SimulationResult {
	scenarios: string;
	personas: string;
	feedback: string;
}

// --- New Structured Types ---

export interface ParsedQuote {
	name: string; // Persona name or "Key Insight"/"Consideration"
	quote: string; // The actual quote text
	isPersona: boolean; // True if from a persona, false if analysis insight
	// Optional persona details if isPersona is true
	age?: string;
	role?: string;
	description?: string; // Persona background/context
	fullPersonaDetails?: string; // Combined string like "Name, Age, Role"
}

export interface ParsedPersona {
	name: string;
	description: string;
	age?: string;
	role?: string;
	fullDetails?: string; // Combined string like "Name, Age, Role"
	// Add other fields extracted by extractPersonas if needed (e.g., audience type)
}

export interface ParsedSolution {
	title: string;
	description: string;
	feasibility: number; // Percentage
	return: number; // Percentage
	// Combined list of positive/concern quotes and analysis insights
	feedbackQuotes: ParsedQuote[];
}

export interface ParsedSimulationResult {
	solutions: ParsedSolution[];
	// Optionally include the raw persona map if needed elsewhere, though solutions embed feedback
	// personaMap?: Map<string, ParsedPersona>;
	// Optionally include raw strings for debugging/display
	rawScenarios?: string;
	rawPersonas?: string;
	rawFeedback?: string;
}
