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
	/** Array of different business scenarios */
	scenarios: BusinessScenario[];
	/** Array of market personas */
	personas: MarketPersona[];
	/** Array of persona feedback for each scenario */
	scenarioFeedback: ScenarioFeedback[];
}

/**
 * Represents a specific business scenario or market entry approach
 */
export interface BusinessScenario {
	/** Unique identifier for the scenario */
	id: string;
	/** Title of the scenario */
	title: string;
	/** Detailed description of the approach */
	description: string;
	/** Key advantages of this approach */
	advantages: string[];
	/** Potential challenges or risks */
	challenges: string[];
	/** Estimated timeline for implementation */
	timeline: string;
	/** Required resources or investments */
	resources: string[];
}

/**
 * Represents a market persona with detailed characteristics
 */
export interface MarketPersona {
	/** Full name of the persona */
	name: string;
	/** Age or age range */
	age: string;
	/** Current job or professional role */
	occupation: string;
	/** Relevant background information and context */
	background: string;
	/** Key characteristics that define this persona */
	keyCharacteristics: string[];
	/** Key objectives and desired outcomes */
	goals: string[];
	/** Current challenges and frustrations */
	painPoints: string[];
	/** Level of comfort and familiarity with technology */
	techSavviness: string;
	/** Market segment classification (e.g., "Early Adopter", "Mainstream") */
	segment: string;
	/** Probability score (0-1) of adoption */
	adoptionLikelihood: number;
}

/**
 * Represents feedback from a persona for a specific scenario
 */
export interface ScenarioFeedback {
	/** ID of the scenario this feedback is for */
	scenarioId: string;
	/** Name of the persona providing feedback */
	personaName: string;
	/** First impressions and overall response */
	initialReaction: string;
	/** List of potential issues or worries */
	concerns: string[];
	/** Anticipated applications and use cases */
	likelyUseCases: string[];
	/** Recommended product/service enhancements */
	suggestedImprovements: string[];
	/** Expected timeline for adoption */
	adoptionTimeframe: string;
	/** Price point expectations or willingness to pay */
	priceExpectation: string;
	/** Overall sentiment score (-1 to 1) */
	sentimentScore: number;
}
