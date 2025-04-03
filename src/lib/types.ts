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

// --- Stream Event Types ---

export type SimulationStage =
	| "scenario_generation"
	| "persona_generation"
	| "feedback_generation"
	| "parsing"
	| "complete"
	| "error";

// Base interface for all stream events
interface SimulationStreamEventBase {
	type: SimulationStage;
}

// Event for indicating current stage
export interface StageUpdateEvent extends SimulationStreamEventBase {
	type:
		| "scenario_generation"
		| "persona_generation"
		| "feedback_generation"
		| "parsing";
	message: string; // e.g., "Generating potential market entry strategies..."
}

// Event for scenario titles
export interface ScenarioTitlesEvent extends SimulationStreamEventBase {
	type: "scenario_generation";
	data: {
		titles: string[];
	};
}

// Event for persona summaries
export interface PersonaSummaryEvent extends SimulationStreamEventBase {
	type: "persona_generation";
	data: {
		personas: Array<{
			name: string;
			description: string;
			age?: string;
			role?: string;
		}>; // Simple summary
	};
}

// Event for feedback scores (adjust based on what's parseable early)
export interface FeedbackScoresEvent extends SimulationStreamEventBase {
	type: "feedback_generation";
	data: {
		scores: Array<{ title: string; feasibility: number; return: number }>; // Example structure
	};
}

// Event for completion
export interface CompletionEvent extends SimulationStreamEventBase {
	type: "complete";
	data: ParsedSimulationResult; // The final full result
}

// Event for errors
export interface ErrorEvent extends SimulationStreamEventBase {
	type: "error";
	error: {
		message: string;
		code?: string;
		details?: string;
	};
}

// Union type for all possible stream events
export type SimulationStreamEvent =
	| StageUpdateEvent
	| ScenarioTitlesEvent
	| PersonaSummaryEvent
	| FeedbackScoresEvent
	| CompletionEvent
	| ErrorEvent;
