import type { Metadata } from 'next';
import HowItWorksClient from './HowItWorksClient';

export const metadata: Metadata = {
  title: 'How It Works - Lumina AI',
  description:
    'Set up in minutes. See the six simple steps from creating your class to exporting world-class AI-powered lessons.',
};

export default function HowItWorksPage() {
  return <HowItWorksClient />;
}
