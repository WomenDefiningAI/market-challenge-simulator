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
