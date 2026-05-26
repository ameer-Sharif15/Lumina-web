import type { Metadata } from 'next';
import PricingClient from './PricingClient';

export const metadata: Metadata = {
  title: 'Pricing - Lumina AI',
  description:
    'Simple, transparent pricing plans for Lumina AI. Choose the plan that fits your classroom, school, or district.',
};

export default function PricingPage() {
  return <PricingClient />;
}
