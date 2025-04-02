export interface SimulationInput {
	companyInfo: string;
	marketChallenge: string;
}

export interface SimulationResult {
	segments: ConsumerSegment[];
	recommendations: string[];
	adoptionCurve: AdoptionCurveData[];
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
