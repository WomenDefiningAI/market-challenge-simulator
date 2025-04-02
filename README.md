# Market Entry Strategy Simulator

A Next.js application that enables business strategists to evaluate new market opportunities by simulating consumer behavior responses using a multi-step, LLM-powered simulation process.

## Features

- AI-powered market analysis using GPT-4
- Detailed persona generation and feedback
- Strategic recommendations based on market segments
- Adoption timeline predictions
- Interactive results dashboard

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- OpenAI API

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/market-entry-simulator.git
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

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

This project is configured for deployment on Vercel. Simply connect your GitHub repository to Vercel and it will automatically deploy your changes.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 