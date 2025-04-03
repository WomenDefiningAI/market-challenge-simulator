import { SimulationForm } from "@/components/simulation/SimulationForm";

export default function Home() {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-indigo-900">
			<div className="w-full max-w-5xl">
				<SimulationForm />
			</div>
		</div>
	);
} 