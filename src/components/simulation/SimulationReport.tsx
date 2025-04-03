import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface SimulationReportProps {
  companyInfo: string;
  marketChallenge: string;
  scenarios: string;
  personas: string;
  feedback: string;
}

interface SolutionAnalysisProps {
  title: string;
  solutionName: string;
  feasibilityScore: number;
  returnScore: number;
  positivePersonas: Array<{ role: string; feedback: string }>;
  negativePersonas: Array<{ role: string; feedback: string }>;
}

function SolutionAnalysis({
  title,
  solutionName,
  feasibilityScore,
  returnScore,
  positivePersonas,
  negativePersonas,
}: SolutionAnalysisProps) {
  return (
    <Card className="p-6">
      <h3 className="text-2xl font-semibold mb-4">{title}</h3>
      <div className="space-y-4">
        <div>
          <h4 className="text-lg font-medium mb-2">{solutionName}</h4>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between mb-1">
                <span>Confidence on Feasibility</span>
                <span>{feasibilityScore}%</span>
              </div>
              <Progress value={feasibilityScore} />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span>Confidence on Return</span>
                <span>{returnScore}%</span>
              </div>
              <Progress value={returnScore} />
            </div>
          </div>
        </div>

        {/* Persona Feedback */}
        <div className="mt-6">
          <h4 className="text-lg font-medium mb-4">Simulated Personas</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Positive Feedback */}
            <div>
              <h5 className="font-medium mb-2">Positive Feedback</h5>
              <ul className="list-disc pl-4 space-y-2">
                {positivePersonas.map((persona, index) => (
                  <li key={index}>
                    {persona.role}: {persona.feedback}
                  </li>
                ))}
              </ul>
            </div>
            {/* Negative/Neutral Feedback */}
            <div>
              <h5 className="font-medium mb-2">Concerns & Considerations</h5>
              <ul className="list-disc pl-4 space-y-2">
                {negativePersonas.map((persona, index) => (
                  <li key={index}>
                    {persona.role}: {persona.feedback}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function SimulationReport({
  companyInfo,
  marketChallenge,
  scenarios,
  personas,
  feedback,
}: SimulationReportProps) {
  const [showAllSolutions, setShowAllSolutions] = useState(false);

  // Example data - in practice, this would be parsed from the feedback string
  const analysisData = {
    leastRisky: {
      title: "Least Risky Solution",
      solutionName: "Partnership Program",
      feasibilityScore: 85,
      returnScore: 55,
      positivePersonas: [
        { role: "Sales Manager", feedback: "Strong potential for market expansion" },
        { role: "Junior Software Engineer", feedback: "Clear technical implementation path" },
      ],
      negativePersonas: [
        { role: "Director of HR", feedback: "Training requirements may be substantial" },
        { role: "Sales Manager", feedback: "Initial setup costs could be high" },
      ],
    },
    mostLikely: {
      title: "Most Likely to Succeed",
      solutionName: "Digital Upscaling Program",
      feasibilityScore: 75,
      returnScore: 80,
      positivePersonas: [
        { role: "Sales Manager", feedback: "High demand for digital learning" },
        { role: "Junior Software Engineer", feedback: "Scalable technical solution" },
      ],
      negativePersonas: [
        { role: "Director of HR", feedback: "Need for continuous content updates" },
        { role: "Product Manager", feedback: "Complex feature requirements" },
      ],
    },
    wildcard: {
      title: "Wildcard Solution",
      solutionName: "Crowdfunding Campaign",
      feasibilityScore: 60,
      returnScore: 90,
      positivePersonas: [
        { role: "Marketing Director", feedback: "Strong community engagement potential" },
        { role: "Social Media Manager", feedback: "Viral marketing opportunities" },
      ],
      negativePersonas: [
        { role: "Financial Advisor", feedback: "Unpredictable funding outcomes" },
        { role: "Risk Manager", feedback: "High dependency on market sentiment" },
      ],
    },
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-4xl font-bold text-center mb-2">Market Entry Simulator</h1>
      <h2 className="text-xl text-center text-muted-foreground mb-12">
        Test new markets. Simulate outcomes.
      </h2>

      {/* Company Info & Challenge Section */}
      <Card className="p-6 mb-8">
        <h3 className="text-2xl font-semibold mb-4">Company Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-medium mb-2">Company Information</h4>
            <p className="text-muted-foreground whitespace-pre-wrap">{companyInfo}</p>
          </div>
          <div>
            <h4 className="text-lg font-medium mb-2">Market Challenge</h4>
            <p className="text-muted-foreground whitespace-pre-wrap">{marketChallenge}</p>
          </div>
        </div>
      </Card>

      {/* All Solutions Toggle Section */}
      <Card className="p-6 mb-8">
        <Button
          variant="ghost"
          className="w-full flex items-center justify-between"
          onClick={() => setShowAllSolutions(!showAllSolutions)}
        >
          <span className="text-lg font-medium">View All Generated Solutions</span>
          {showAllSolutions ? <ChevronUp /> : <ChevronDown />}
        </Button>
        {showAllSolutions && (
          <div className="mt-4 prose max-w-none whitespace-pre-wrap">
            {scenarios}
          </div>
        )}
      </Card>

      {/* Analysis Buckets */}
      <div className="space-y-8">
        <SolutionAnalysis {...analysisData.leastRisky} />
        <SolutionAnalysis {...analysisData.mostLikely} />
        <SolutionAnalysis {...analysisData.wildcard} />
      </div>
    </div>
  );
} 