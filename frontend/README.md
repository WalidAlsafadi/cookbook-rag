# Cookbook RAG Assistant - Frontend

A modern, production-ready frontend for the Cookbook RAG Assistant, built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- Clean, minimal single-page interface
- Real-time question answering with loading states
- Markdown rendering for formatted answers
- Client-side history tracking (last 5 Q&A pairs)
- Responsive design (mobile and desktop)
- Error handling with clear user feedback
- SEO-optimized with proper meta tags
- Ready for Vercel deployment

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with @tailwindcss/typography
- **UI Components**: shadcn/ui
- **Markdown**: react-markdown with remark-gfm
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- FastAPI backend running (see backend repository)

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Configure the API URL:

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Or use the default `http://localhost:8000` if the backend is running locally.

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

Build for production:

```bash
npm run build
npm start
```

## Deployment to Vercel

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)

2. Import the project in Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your repository

3. Configure environment variables:
   - Add `NEXT_PUBLIC_API_URL` with your production FastAPI backend URL
   - Example: `https://your-backend-api.com`

4. Deploy!

Vercel will automatically detect Next.js and configure the build settings.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Base URL for the FastAPI backend | `http://localhost:8000` |

## Project Structure

```
app/
├── page.tsx          # Main application page
├── layout.tsx        # Root layout with metadata
└── globals.css       # Global styles

components/ui/        # shadcn/ui components
```

## API Integration

The frontend communicates with the FastAPI backend via:

**Endpoint**: `POST /ask`

**Request**:
```json
{
  "question": "string",
  "k": 5
}
```

**Response**:
```json
{
  "answer": "string (Markdown)"
}
```

## Features in Detail

### Question & Answer
- Submit questions via textarea (Enter to submit, Shift+Enter for new line)
- Loading indicator while processing
- Error messages for backend issues
- Markdown-formatted answers with proper typography

### History Tracking
- Keeps last 5 Q&A pairs in client-side state
- Click any previous question to view its answer
- Helpful for comparing answers

### Responsive Design
- Mobile-first approach
- Stacks sections vertically on mobile
- Side-by-side layout on desktop (Q&A + History)

## Team

- Walid Alsafadi
- Fares Alnamla
- Ahmed Alyazuri

## License

This project is part of a backend engineering demonstration portfolio.
