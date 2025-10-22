"use client";

import { useEffect, useState } from 'react';
import { PricingSection } from '../../../components/homepage/pricing-section';

export default function PricingPage() {
	const [visible, setVisible] = useState(false);
	useEffect(() => {
		const timeout = setTimeout(() => setVisible(true), 10);
		return () => clearTimeout(timeout);
	}, []);
	return (
		<div
			style={{
				opacity: visible ? 1 : 0,
				transform: visible ? 'translateY(0)' : 'translateY(24px)',
				transition: 'opacity 0.7s cubic-bezier(0.4,0,0.2,1), transform 0.7s cubic-bezier(0.4,0,0.2,1)'
			}}
		>
			<PricingSection />
		</div>
	);
}
