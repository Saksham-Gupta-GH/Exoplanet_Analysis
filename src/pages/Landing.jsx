import { HeroSection } from '../components/HeroSection';

export function Landing({ onStart }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      
      {/* Strong green quarter circle */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-72 -left-72 h-[42rem] w-[42rem] rounded-full bg-[#0A8F1F]"
      />

      {/* Subtle outline ring */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-64 -left-64 h-[36rem] w-[36rem] rounded-full border border-[#0A8F1F]/60"
      />

      <HeroSection onStart={onStart} />
    </div>
  );
}