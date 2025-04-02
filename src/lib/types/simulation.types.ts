/**
 * Input parameters for running a market entry simulation
 */
export interface SimulationInput {
	/** OpenAI API key for running the simulation */
	apiKey: string;
	/** Description of the company and its product/service */
	companyInfo: string;
	/** Specific market challenge or question to analyze */
	marketChallenge: string;
}

/**
 * Comprehensive results from a market entry simulation
 */
export interface SimulationResult {
	/** Overall market analysis text */
	marketAnalysis: string;
	/** Array of identified consumer segments */
	personas: ConsumerSegment[];
	/** Detailed feedback from each persona */
	feedback: Record<string, unknown>[];
	/** List of strategic recommendations */
	recommendations: string[];
	/** Distribution of adoption across different consumer groups */
	adoptionCurve: {
		earlyAdopters: number;
		mainstream: number;
		lateAdopters: number;
	};
}

/**
 * Represents a distinct consumer segment in the market
 */
export interface ConsumerSegment {
	/** Identifier name for the segment */
	name: string;
	/** Detailed description of the segment */
	description: string;
	/** Estimated size of the segment (e.g., "15% of market") */
	size: string;
	/** Key characteristics that define this segment */
	keyCharacteristics: string[];
	/** Probability score (0-1) of adoption */
	adoptionLikelihood: number;
}

/**
 * Data point for tracking adoption over time
 */
export interface AdoptionCurveData {
	/** Month number in the timeline */
	month: number;
	/** Percentage of adoption (0-100) */
	adoptionRate: number;
	/** Consumer segment identifier */
	segment: string;
}
