# Market Challenge Simulator

A Next.js application that enables business strategists to evaluate new market opportunities by simulating potential solutions and collecting persona feedback using a structured, LLM-powered simulation process.

## Overview

The Market Entry Strategy Simulator helps businesses explore different approaches to market challenges by:
- Generating multiple potential solutions with varied risk profiles
- Creating detailed market personas (current audience and potential new audiences)
- Simulating realistic persona feedback and risk analysis for each solution
- Calculating feasibility and return scores based on market readiness and resource requirements
- Presenting solutions with authentic first-person quotes from simulated personas

## Features

- AI-powered market analysis using GPT-4
- Structured prompt templates with delimiter tags for consistent data extraction
- Detailed persona generation with demographic details and adoption likelihood
- Risk analysis with specific breakdowns (market readiness, resource requirements, etc.)
- Authentic first-person quotes from personas that reflect their background and priorities
- Interactive results dashboard with feasibility and return scoring

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- OpenAI API integration
- Structured extraction framework for LLM-generated data

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/WomenDefiningAI/market-entry-simulator.git
cd market-entry-simulator
```

2. Install dependencies:
```bash
npm install
```

3. Set up your OpenAI API key:
The application uses a client-side approach where users provide their own API keys. No environment variables are required for the OpenAI integration.

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

The simulator operates in three main stages:

1. **Solution Generation**: Creates 5 distinct business solutions for the market challenge with varying approaches and risk levels.

2. **Persona Creation**: Develops 6 detailed market personas (3 from current audience, 3 from potential new audiences) with specific demographic details and characteristics.

3. **Feedback Analysis**: For each solution, generates comprehensive risk analysis and authentic first-person feedback from each persona.

The structured output uses delimiter tags (e.g., `[PERSONA_START]`, `[SOLUTION_ANALYSIS_START]`) to ensure consistent parsing and display of the simulation results.

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

This project is configured for deployment on Vercel. Simply connect your GitHub repository to Vercel for automatic deployment.

## Contributing

This project was developed by the [Women Defining AI](https://www.womendefiningai.com/) community.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
