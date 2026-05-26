"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export type FaqItem = {
  id: string;
  question: string;
  answer: ReactNode;
};

type FaqAccordionProps = {
  items: FaqItem[];
  defaultOpenId?: string | null;
};

export default function FaqAccordion({
  items,
  defaultOpenId = items[0]?.id ?? null,
}: FaqAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId);

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div
            key={item.id}
            className={`rounded-2xl border transition-all duration-200 bg-white overflow-hidden ${
              isOpen
                ? "border-[#006c51]/30 bg-emerald-50/20"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <button
              type="button"
              id={`faq-trigger-${item.id}`}
              aria-expanded={isOpen}
              aria-controls={`faq-panel-${item.id}`}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              onClick={() => setOpenId(isOpen ? null : item.id)}
            >
              <span className="text-sm sm:text-base font-semibold text-slate-900 flex-1">
                {item.question}
              </span>
              <span
                className={`shrink-0 size-7 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isOpen
                    ? "bg-[#006c51] text-white rotate-180"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                <ChevronDown className="size-4" aria-hidden />
              </span>
            </button>

            <div
              id={`faq-panel-${item.id}`}
              role="region"
              aria-labelledby={`faq-trigger-${item.id}`}
              className={`transition-all duration-200 ${
                isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
              }`}
            >
              <div className="px-5 pb-5 text-sm leading-relaxed text-slate-500 border-t border-slate-100 pt-3">
                {item.answer}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
