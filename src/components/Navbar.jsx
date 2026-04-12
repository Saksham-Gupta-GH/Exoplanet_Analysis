import { ExternalLink, FileText, Search, Sparkles } from 'lucide-react';
import { RESEARCH_PAPER_LINK } from '../lib/appData';
import { cn } from '../lib/utils';

const items = [
  { id: 'similarity', label: 'Similarity', icon: Search },
  { id: 'habitability', label: 'Habitability', icon: Sparkles },
];

export function Navbar({ activePage, onNavigate, onHome }) {
  return (
    <header className="sticky top-0 z-40 border-b border-google-outline bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <button
          type="button"
          onClick={onHome}
          className="flex items-center gap-2 py-3 text-left"
          title="Back to landing page"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-google-blue">
            <circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.2" />
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
            <circle cx="12" cy="12" r="2" fill="currentColor" />
          </svg>
          <span className="text-lg font-medium text-google-text">
            ExoPlanet Explorer
          </span>
        </button>

        {/* Tabs — Google-style underline tabs */}
        <nav className="flex items-center">
          {items.map((item) => {
            const Icon = item.icon;
            const active = activePage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={cn(
                  'relative flex h-12 items-center gap-2 px-4 text-sm font-medium transition-colors',
                  active
                    ? 'text-google-blue'
                    : 'text-google-text-secondary hover:text-google-text',
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
                {active ? (
                  <span className="absolute bottom-0 left-2 right-2 h-[3px] rounded-full bg-google-blue" />
                ) : null}
              </button>
            );
          })}

          <span className="mx-2 h-5 w-px bg-google-outline" />

          <button
            type="button"
            onClick={() => onNavigate('about')}
            className={cn(
              'relative flex h-12 items-center gap-2 px-4 text-sm font-medium transition-colors',
              activePage === 'about'
                ? 'text-google-blue'
                : 'text-google-text-secondary hover:text-google-text',
            )}
          >
            <FileText className="h-4 w-4" />
            About
            {activePage === 'about' ? (
              <span className="absolute bottom-0 left-2 right-2 h-[3px] rounded-full bg-google-blue" />
            ) : null}
          </button>

          <a
            href={RESEARCH_PAPER_LINK}
            target="_blank"
            rel="noreferrer"
            className="ml-2 flex h-9 items-center gap-2 rounded-full border border-google-outline px-3 text-sm font-medium text-google-blue transition hover:bg-google-blue/10"
          >
            Paper
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </nav>
      </div>
    </header>
  );
}
