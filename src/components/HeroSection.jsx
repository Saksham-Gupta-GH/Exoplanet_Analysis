import { ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

export function HeroSection({ onStart }) {
  return (
    <section className="relative mx-auto flex min-h-[85vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
      {/* Google-style centered landing */}
      <h1 className="text-5xl font-medium tracking-tight text-google-text sm:text-6xl lg:text-7xl">
        ExoPlanet Explorer
      </h1>

      <p className="mt-6 max-w-xl text-lg leading-8 text-google-text-secondary">
        Similarity search and habitability scoring for confirmed exoplanets from the NASA Exoplanet Archive.
      </p>

      <div className="mt-10 flex items-center gap-3">
        <Button onClick={onStart} size="lg">
          Get Started
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <p className="mt-16 text-sm text-google-text-tertiary">
        4,529 confirmed exoplanets · 17 features · 20/20 benchmark recovery
      </p>
    </section>
  );
}
