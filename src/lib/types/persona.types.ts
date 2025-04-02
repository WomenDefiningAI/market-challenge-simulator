/**
 * Detailed representation of a market persona
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
	/** Key objectives and desired outcomes */
	goals: string[];
	/** Current challenges and frustrations */
	painPoints: string[];
	/** Description of purchasing behavior and decision-making process */
	buyingBehavior: string;
	/** Level of comfort and familiarity with technology */
	techSavviness: string;
	/** Market segment classification */
	segment: string;
}

/**
 * Structured feedback from a market persona
 */
export interface PersonaFeedback {
	/** The persona providing the feedback */
	persona: MarketPersona;
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
}
