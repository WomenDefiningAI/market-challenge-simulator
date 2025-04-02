import { SimulationForm } from "@/components/simulation/SimulationForm";

export default function Home() {
	return (
		<div className="flex flex-col items-center justify-center min-h-[80vh]">
			<div className="text-center mb-8">
				<h1 className="text-4xl font-bold mb-4 text-white">Market Entry Strategy Simulator</h1>
				<p className="text-lg text-white">
					Evaluate new market opportunities with AI-powered analysis
				</p>
			</div>
			
			<div className="w-full max-w-2xl bg-base-200 p-6 rounded-lg shadow-lg">
				<SimulationForm />
			</div>
		</div>
	);
} 