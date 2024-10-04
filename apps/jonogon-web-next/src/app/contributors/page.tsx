'use client';

import { fixedContributors } from '@/lib/contributors';
import { trpc } from '@/trpc/client';
import { ChevronDown, ChevronUp, ThumbsUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Collapsible } from '@radix-ui/react-collapsible';
import {
	CollapsibleContent,
	CollapsibleTrigger,
} from '../components/ui/collapsible';
import { Button } from '@/components/ui/button';

export default function Contributors() {
	const [isOpen, setIsOpen] = useState(false);
	const [isDesktop, setIsDesktop] = useState(false);

	// Handle window resize to determine desktop view
	useEffect(() => {
		const handleResize = () => {
			setIsDesktop(window.innerWidth >= 768);
		};

		handleResize();
		window.addEventListener('resize', handleResize);

		return () => window.removeEventListener('resize', handleResize);
	}, []);

	// Adjust the collapsible based on desktop view
	useEffect(() => {
		setIsOpen(isDesktop);
	}, [isDesktop]);

	const { data: dynamicContributors = [], isLoading } =
		trpc.users.getAllUserNames.useQuery();

	// Check if a dynamic contributor is from the fixed list
	const isFixedContributor = (name: string) =>
		fixedContributors.includes(name);

	return (
		<div className="max-w-screen-sm mx-auto mt-28 px-4 flex flex-col justify-center">
			<div className="flex flex-col justify-between mb-4">
				<div className="w-full pr-4">
					<div className="flex flex-row gap-8">
						<div className="flex flex-col items-center justify-center gap-2">
							<Image
								src="/images/submit.svg"
								alt="submit"
								width={32}
								height={32}
								className="w-8 h-8"
							/>
							<span className="font-light">Submit</span>
						</div>

						<div className="flex flex-col items-center justify-center gap-2">
							<ThumbsUp size={32} className="text-[#585755]" />
							<span className="font-light">Vote</span>
						</div>

						<div className="flex flex-col items-center justify-center gap-2">
							<Image
								src="/images/icon-flower-reversed.svg"
								alt="reform"
								width={32}
								height={32}
								className="w-8 h-8"
							/>
							<span className="font-light">Reform</span>
						</div>
					</div>

					<div className="mt-6 font-light gap-4">
						<Collapsible
							open={isOpen}
							onOpenChange={setIsOpen}
							className="flex flex-col gap-4"
						>
							<CollapsibleTrigger className="flex justify-between items-center">
								<p className="font-medium text-left text-xl">
									Jonogon is built for the people, by the
									people.
								</p>
								{isOpen ? (
									<ChevronUp className="w-5 h-5" />
								) : (
									<ChevronDown className="w-5 h-5" />
								)}
							</CollapsibleTrigger>

							<CollapsibleContent className="flex flex-col gap-4">
								<p>
									We consist of{' '}
									<span className="font-medium">
										2500+ citizens (and growing)
									</span>{' '}
									who believe in a secular and effective
									Bangladesh, which stands for truth against
									violence, hatred, crime, and discrimination.
								</p>
								<p>
									A Bangladesh where everyone is free to speak
									without fear.
								</p>
								<p>
									A Bangladesh where reform takes place in
									days, not decades.
								</p>
								<p>
									A Bangladesh that works together to open
									doors of opportunity for every citizen.
								</p>
								<p>
									Contribute to this new Bangladesh by
									submitting your দাবি today <br />{' '}
									<span className="font-medium">
										— we’ll ensure your voice matters and
										leads to action.
									</span>
								</p>
							</CollapsibleContent>
						</Collapsible>
						<div className="flex flex-row gap-4 md:border-t border-white border-opacity-20 py-4">
							<a
								href="/faq"
								className="w-full"
							>
								<Button className="w-full bg-[#F7F2EE] bg-opacity-10 text-black hover:text-white font-medium py-4 rounded-md border-2 border-black border-opacity-10">
									FAQS
								</Button>
							</a>
							<a
								href="https://discord.gg/U9EcJesGXA"
								target="_blank"
								rel="noopener noreferrer"
								className="w-full"
							>
								<Button className="w-full bg-[#F7F2EE] bg-opacity-10 text-black hover:text-white font-medium py-4 rounded-md border-2 border-black border-opacity-10">
									Join our community
								</Button>
							</a>
						</div>
					</div>
				</div>

				<div className="flex flex-col w-full md:border-l border-white border-opacity-20 pt-4 gap-4">
					<p className="font-medium text-xl">
						{dynamicContributors.length} Contributors:
					</p>
					<ul className="list-disc list-inside space-y-1 font-light">
						{isLoading ? (
							<li>Loading...</li>
						) : dynamicContributors.length > 0 ? (
							dynamicContributors.map((contributor, index) => (
								<li
									key={index}
									className="flex items-center gap-2"
								>
									{contributor.name || 'Anonymous'}
									{isFixedContributor(
										contributor.name || 'Anonymous',
									) && <span>☆</span>}
								</li>
							))
						) : (
							<li>No contributors found</li>
						)}

						<p>and growing... ✊🏽</p>
					</ul>
				</div>
			</div>
		</div>
	);
}
