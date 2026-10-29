import { useState } from 'react';
import { CaretDown } from '@phosphor-icons/react';

export function Faq() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: 'How does Carbotrace calculate carbon from source code?',
      a: 'Carbotrace uses tree-sitter C-bindings to build an Abstract Syntax Tree (AST) of your codebase. It inspects computational intensity such as nested O(N²) loops, recursive call chains, memory allocations, and database query batching patterns. It then multiplies these estimated CPU cycles by hardware processor wattage ratings and regional grid carbon intensity factors (gCO2e/kWh) following the Software Carbon Intensity (SCI) specification.',
    },
    {
      q: 'Does my proprietary code ever leave my servers?',
      a: 'No. When auditing private repositories, you can run Carbotrace locally via Docker or self-host the backend. Even the AI remediation engine is powered by local Ollama models (qwen2.5-coder:1.5b), ensuring zero code snippets or token embeddings are sent to third-party commercial LLM providers.',
    },
    {
      q: 'Which programming languages are currently supported?',
      a: 'AST syntax tree parsing is fully supported for Python, JavaScript, and TypeScript. In addition, Carbotrace parses GitHub Actions workflow YAML files for CI/CD runner wattage and Terraform/CloudFormation templates for cloud infrastructure topology. Go and Rust AST engines are currently on the active roadmap.',
    },
    {
      q: 'How does the GitHub Action merge gate work?',
      a: 'The Carbotrace Action runs during your pull request workflow. It compares the carbon score of the head branch against the base branch. If a pull request introduces an algorithmic regression or runner duration spike exceeding your configured threshold (e.g. max +0.05 score delta), the action fails the CI check and posts a markdown diff comment detailing the exact offending lines.',
    },
    {
      q: 'Is Carbotrace completely open source?',
      a: 'Yes. Carbotrace is free and open-source software released under the MIT License. You can inspect the entire codebase, self-host the FastAPI backend with TimescaleDB, and deploy custom CI/CD integrations with no licensing restrictions or commercial paywalls.',
    },
  ];

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    <section id="faq" className="py-20 md:py-28 bg-white dark:bg-[#09090b] border-t border-zinc-200/70 dark:border-zinc-800/80 transition-colors" aria-label="Frequently asked questions">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950 dark:text-white leading-[1.15] mb-4">
            Frequently asked questions
          </h2>
          <p className="text-base text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
            Everything you need to know about static carbon analysis, security guarantees, and CI/CD merge enforcement.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl transition-all border ${
                  isOpen
                    ? 'bg-zinc-50 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 shadow-sm'
                    : 'bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full py-4.5 px-5 sm:px-6 text-left flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-2xl"
                  aria-expanded={isOpen}
                >
                  <span className="text-base font-semibold text-zinc-900 dark:text-white leading-snug">
                    {faq.q}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen ? 'bg-zinc-900 dark:bg-zinc-800 text-white rotate-180' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                    }`}
                  >
                    <CaretDown size={14} weight="bold" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 pt-1 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-200/60 dark:border-zinc-800/60 mt-1">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
