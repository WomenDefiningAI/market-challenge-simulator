export interface SimulationInput {
	apiKey: string;
	companyInfo: string;
	marketChallenge: string;
}

export interface SimulationResult {
	marketAnalysis: string;
	personas: ConsumerSegment[];
	feedback: Record<string, unknown>[];
	recommendations: string[];
	adoptionCurve: {
		earlyAdopters: number;
		mainstream: number;
		lateAdopters: number;
	};
}

export interface ConsumerSegment {
	name: string;
	description: string;
	size: string;
	keyCharacteristics: string[];
	adoptionLikelihood: number;
}

export interface AdoptionCurveData {
	month: number;
	adoptionRate: number;
	segment: string;
}

export interface MarketPersona {
	name: string;
	age: string;
	occupation: string;
	background: string;
	goals: string[];
	painPoints: string[];
	buyingBehavior: string;
	techSavviness: string;
	segment: string;
}

export interface PersonaFeedback {
	persona: MarketPersona;
	initialReaction: string;
	concerns: string[];
	likelyUseCases: string[];
	suggestedImprovements: string[];
	adoptionTimeframe: string;
	priceExpectation: string;
}
