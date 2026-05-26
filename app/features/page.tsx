import type { Metadata } from 'next';
import FeaturesClient from './FeaturesClient';

export const metadata: Metadata = {
  title: 'Features - Lumina AI',
  description:
    'Discover the powerful tools and features of Lumina AI, the ultimate AI-powered co-pilot for modern educators.',
};

export default function FeaturesPage() {
  return <FeaturesClient />;
}
