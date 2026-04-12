import { HeroSection } from '../components/HeroSection';

export function Landing({ onStart }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      {/* Strong green quarter circle */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-52 -left-52 h-[30rem] w-[30rem] rounded-full bg-[#0A8F1F] sm:-bottom-72 sm:-left-72 sm:h-[42rem] sm:w-[42rem]"
      />

      {/* Subtle outline ring */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-48 -left-48 h-[26rem] w-[26rem] rounded-full border border-[#0A8F1F]/60 sm:-bottom-64 sm:-left-64 sm:h-[36rem] sm:w-[36rem]"
      />

      <HeroSection onStart={onStart} />
    </div>
  );
}
