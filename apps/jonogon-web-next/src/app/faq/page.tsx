'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/app/components/ui/collapsible';
import ReactMarkdown from 'react-markdown';
import { faqItems, FAQItem } from './faqData';

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Record<number, boolean>>({});
  const toggleItem = (index: number) => {
    setOpenItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
    

  return (
    <div className="max-w-screen-sm mx-auto mt-28 px-4 flex flex-col justify-center mb-20">
      <h1 className="text-4xl font-bold mb-8 text-red-500 font-serif">Frequently Asked Questions</h1>
      <div className="space-y-4">
        {faqItems.map((item, index) => (
          <Collapsible
            key={index}
            open={openItems[index] || false}
            onOpenChange={() => toggleItem(index)}
            className="rounded-md border-2 border-black border-opacity-10 overflow-hidden"
          >
            <CollapsibleTrigger className="flex justify-between items-center w-full py-4 px-6 text-black hover:text-red-500 font-medium transition-colors duration-200">
              <span className="font-sans text-left prose">{item.question}</span>
              {openItems[index] ? (
                <ChevronUp className="w-5 h-5 flex-shrink-0 ml-2" />
              ) : (
                <ChevronDown className="w-5 h-5 flex-shrink-0 ml-2" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-6 pb-4">
                <ReactMarkdown 
                  className="font-sans text-gray-700 faq-content prose"
                >
                  {item.answer}
                </ReactMarkdown>
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  );
}