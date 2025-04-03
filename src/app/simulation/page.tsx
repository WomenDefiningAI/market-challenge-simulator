"use client";

import { SimulatorHeader } from "@/components/simulation/SimulatorHeader";
import type { SimulationResult } from "@/lib/types";
import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dynamically import the simulation form to avoid SSR issues with browser-only APIs
const SimulationForm = dynamic(
	() => import("@/components/simulation/SimulationForm"),
	{ ssr: false },
);

export default function SimulationPage() {
	return (
		<main className="min-h-screen bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-900">
			<div className="mx-auto max-w-screen-xl px-4 py-8">
				<SimulatorHeader />
				
				<Suspense fallback={<LoadingState />}>
					<SimulationForm />
				</Suspense>
			</div>
		</main>
	);
}

function LoadingState() {
	return (
		<div className="mt-10 flex flex-col items-center justify-center space-y-4 text-white">
			<div className="h-8 w-8 animate-spin rounded-full border-b-2 border-white" />
			<p>Loading simulation tool...</p>
		</div>
	);
}
