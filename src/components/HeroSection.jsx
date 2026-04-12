import { ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

export function HeroSection({ onStart }) {
  return (
    <section className="relative mx-auto flex min-h-[85svh] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center sm:min-h-[85vh]">
      {/* Google-style centered landing */}
      <h1 className="text-4xl font-medium tracking-tight text-google-text sm:text-6xl lg:text-7xl">
        ExoPlanet Explorer
      </h1>

      <p className="mt-5 max-w-xl text-base leading-7 text-google-text-secondary sm:mt-6 sm:text-lg sm:leading-8">
        Similarity search and habitability scoring for confirmed exoplanets from the NASA Exoplanet Archive.
      </p>

      <div className="mt-8 flex w-full items-center justify-center gap-3 sm:mt-10 sm:w-auto">
        <Button onClick={onStart} size="lg" className="w-full max-w-xs sm:w-auto">
          Get Started
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <p className="mt-12 max-w-xs text-sm text-google-text-tertiary sm:mt-16 sm:max-w-none">
        4,529 confirmed exoplanets · 17 features · 20/20 benchmark recovery
      </p>
    </section>
  );
}
