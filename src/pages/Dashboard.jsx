import { useMemo, useState } from 'react';
import { RotateCcw, Sparkles } from 'lucide-react';
import {
  DECIMAL_FORMATTER,
  FEATURE_KEYS,
  FEATURE_META,
  assessHabitability,
  buildFeatureStatsForKeys,
  calculateHabitabilityScore,
  classifyScore,
  rankSimilarPlanetsFlexible,
} from '../lib/analysis';
import {
  EXAMPLE_VALUES,
  HABITABILITY_FIELDS,
  SIMILARITY_FIELDS,
  getSimilarityLabel,
} from '../lib/appData';
import { FeatureCard } from '../components/FeatureCard';
import { InputField } from '../components/InputField';
import { ResultCard } from '../components/ResultCard';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { TooltipProvider } from '../components/ui/tooltip';

const defaultSimilarityInput = Object.fromEntries(FEATURE_KEYS.map((key) => [key, '']));
const defaultHabitabilityInput = Object.fromEntries(HABITABILITY_FIELDS.map((key) => [key, '']));

const earthBaseline = {
  pl_rade: '1',
  pl_eqt: '288',
  pl_insol: '1',
  pl_dens: '5.5',
  st_teff: '5778',
};

function SimilarityFinder({ planets, summary }) {
  const [input, setInput] = useState(defaultSimilarityInput);
  const stats = useMemo(() => buildFeatureStatsForKeys(planets, SIMILARITY_FIELDS), [planets]);
  const results = useMemo(
    () => rankSimilarPlanetsFlexible(input, planets, stats, SIMILARITY_FIELDS, 5),
    [input, planets, stats],
  );
  const activeCount = SIMILARITY_FIELDS.filter((key) => input[key] !== '').length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_0.4fr]">
        {/* Input panel */}
        <Card className="p-6">
          <div className="flex flex-col gap-3 border-b border-google-outline pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-google-blue">Similarity Finder</p>
              <h1 className="mt-1 text-xl font-medium text-google-text">Search by 17 exoplanet features</h1>
              <p className="mt-1 max-w-xl text-sm text-google-text-secondary">
                Fill any subset of fields. Empty values are ignored, so the ranking adapts to the evidence you provide.
              </p>
            </div>
            <Button variant="outlined" onClick={() => setInput(defaultSimilarityInput)}>
              <RotateCcw className="h-4 w-4" />
              Clear all
            </Button>
          </div>

          <TooltipProvider delayDuration={180}>
            <div className="mt-5 grid gap-x-5 gap-y-4 sm:grid-cols-2 xl:grid-cols-3">
              {SIMILARITY_FIELDS.map((key) => (
                <InputField
                  key={key}
                  fieldKey={key}
                  value={input[key]}
                  placeholder={EXAMPLE_VALUES[key] ? `e.g. ${EXAMPLE_VALUES[key]}` : 'Optional'}
                  tooltip={`${FEATURE_META[key]?.label ?? key}. Leave empty to exclude from distance.`}
                  onChange={(value) => setInput((prev) => ({ ...prev, [key]: value }))}
                />
              ))}
            </div>
          </TooltipProvider>
        </Card>

        {/* Results panel */}
        <div className="space-y-5">
          <FeatureCard eyebrow="Active evidence" title={`${activeCount} / ${SIMILARITY_FIELDS.length} features`}>
            <p>Z-score normalized distance over supplied features.</p>
            <p className="mt-2">
              Catalogue rows: <span className="number font-medium text-google-text">{summary?.dataset?.usableRows ?? planets.length}</span>
            </p>
          </FeatureCard>

          <ResultCard
            eyebrow="Top 5 matches"
            title={results.length ? 'Closest catalogue planets' : 'Awaiting input'}
            tone="focus"
          >
            {results.length ? (
              <div className="space-y-2">
                {results.map((planet) => (
                  <div
                    key={`${planet.pl_name}-${planet.rank}`}
                    className="flex items-start gap-3 rounded-g border border-google-outline bg-google-surface-dim p-3"
                  >
                    <span className="number flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-google-blue text-xs font-medium text-white">
                      {planet.rank}
                    </span>
                    <div>
                      <h3 className="text-sm font-medium text-google-text">{planet.pl_name}</h3>
                      <p className="mt-0.5 text-xs text-google-text-tertiary">{getSimilarityLabel(planet)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-google-text-secondary">
                Enter at least one parameter to find the five nearest matches.
              </p>
            )}
          </ResultCard>
        </div>
      </div>
    </div>
  );
}

function HabitabilityPredictor() {
  const [input, setInput] = useState(defaultHabitabilityInput);
  const assessment = useMemo(() => assessHabitability(input), [input]);
  const earthScore = useMemo(
    () => calculateHabitabilityScore({ pl_rade: 1, pl_eqt: 288, pl_insol: 1, pl_dens: 5.5, st_teff: 5778 }),
    [],
  );
  const progress = assessment.status === 'score' ? Math.min(assessment.score * 10, 100) : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_0.5fr]">
        {/* Input panel */}
        <Card className="p-6">
          <div className="flex flex-col gap-3 border-b border-google-outline pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-google-blue">Habitability Predictor</p>
              <h1 className="mt-1 text-xl font-medium text-google-text">Score plausible candidates</h1>
              <p className="mt-1 max-w-xl text-sm text-google-text-secondary">
                Five-feature model with broad physical gates. Values outside plausible ranges are flagged as uninhabitable.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outlined" onClick={() => setInput(defaultHabitabilityInput)}>Clear</Button>
              <Button variant="tonal" onClick={() => setInput(earthBaseline)}>Earth baseline</Button>
            </div>
          </div>

          <TooltipProvider delayDuration={180}>
            <div className="mt-5 grid gap-x-5 gap-y-4 sm:grid-cols-2">
              {HABITABILITY_FIELDS.map((key) => (
                <InputField
                  key={key}
                  fieldKey={key}
                  required
                  value={input[key]}
                  placeholder={`e.g. ${EXAMPLE_VALUES[key]}`}
                  tooltip={`${FEATURE_META[key]?.label ?? key} is required for the habitability score.`}
                  onChange={(value) => setInput((prev) => ({ ...prev, [key]: value }))}
                />
              ))}
            </div>
          </TooltipProvider>
        </Card>

        {/* Results panel */}
        <div className="space-y-5">
          <ResultCard
            eyebrow="Assessment"
            title={
              assessment.status === 'score'
                ? classifyScore(assessment.score)
                : assessment.status === 'uninhabitable'
                  ? 'Uninhabitable'
                  : 'Complete required fields'
            }
            tone={assessment.status === 'uninhabitable' ? 'alert' : 'focus'}
          >
            {assessment.status === 'score' ? (
              <>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <strong className="number block text-5xl font-medium text-google-text">
                      {DECIMAL_FORMATTER.format(assessment.score)}
                    </strong>
                    <p className="mt-1 text-sm text-google-text-secondary">Habitability score out of 10</p>
                  </div>
                  <Sparkles className="h-8 w-8 text-google-yellow" />
                </div>
                <Progress value={progress} className="mt-5 h-2" />
                <div className="mt-4 space-y-1.5">
                  {assessment.components.map((component) => (
                    <div
                      key={component.key}
                      className="flex items-center justify-between rounded-g bg-google-surface-dim px-3 py-2 text-sm"
                    >
                      <span className="text-google-text-secondary">{component.label}</span>
                      <strong className="number text-google-text">{DECIMAL_FORMATTER.format(component.contribution)}</strong>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-google-text-secondary">{assessment.reason}</p>
            )}
          </ResultCard>

          <FeatureCard eyebrow="Reference" title={`Earth score: ${DECIMAL_FORMATTER.format(earthScore.score)}`}>
            <p>
              Earth-like features produce a perfect score of 10.00, providing a scientific baseline.
            </p>
            <p className="mt-2 font-mono text-xs text-google-text-tertiary">
              R 1.0 · T 288 K · I 1.0 · ρ 5.5 · T★ 5778 K
            </p>
          </FeatureCard>
        </div>
      </div>
    </div>
  );
}

export function Dashboard({ activePage, planets, summary }) {
  return (
    <>
      {activePage === 'similarity' ? (
        <SimilarityFinder key="similarity" planets={planets} summary={summary} />
      ) : null}
      {activePage === 'habitability' ? <HabitabilityPredictor key="habitability" /> : null}
    </>
  );
}
