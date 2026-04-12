import React, { useEffect, useMemo, useState } from 'react';
import {
  assessHabitability,
  buildFeatureStatsForKeys,
  calculateHabitabilityScore,
  classifyScore,
  DECIMAL_FORMATTER,
  EARTH_DEFAULTS,
  FEATURE_KEYS,
  FEATURE_META,
  rankSimilarPlanetsFlexible,
} from './lib/analysis';

const FIGURES = [
  {
    id: 'plot03',
    src: '/plots/plot03_correlation_heatmap.png',
    title: 'Correlation structure',
    caption:
      'The top-40 correlation map surfaces the relationships that matter most for model selection and feature grouping.',
  },
  {
    id: 'plot01',
    src: '/plots/plot01_missing_values.png',
    title: 'Missingness profile',
    caption:
      'The NASA archive is sparsely populated for several stellar and planetary attributes, which justifies imputation before modelling.',
  },
  {
    id: 'plot02',
    src: '/plots/plot02_feature_distributions.png',
    title: 'Feature distributions',
    caption:
      'The cleaned 17-feature set still shows strong skew, especially in orbital and insolation variables, so scaling is essential.',
  },
  {
    id: 'plot09',
    src: '/plots/plot09_elbow_silhouette.png',
    title: 'Cluster selection',
    caption:
      'The elbow and silhouette curves converge on k=5, matching the paper’s chosen K-Means structure.',
  },
  {
    id: 'plot10C',
    src: '/plots/plot10C_comparison.png',
    title: 'K-Means vs. Agglomerative',
    caption:
      'Both clustering strategies separate the cleaned sample into balanced, interpretable groups once extreme outliers are removed.',
  },
  {
    id: 'plot11',
    src: '/plots/plot11_kmeans_cluster_sizes.png',
    title: 'K-Means cluster sizes',
    caption:
      'The K-Means cluster-size view shows that the five clusters remain populated rather than collapsing into tiny groups.',
  },
  {
    id: 'plot14',
    src: '/plots/plot14_agg_cluster_sizes.png',
    title: 'Agglomerative cluster sizes',
    caption:
      'The agglomerative cluster counts reinforce the balanced partitioning achieved with PCA-10D and Ward linkage.',
  },
  {
    id: 'plot13',
    src: '/plots/plot13_dendrogram.png',
    title: 'Ward dendrogram',
    caption:
      'The PCA-10D dendrogram supports a five-cluster cut and avoids the singleton-cluster problem of naïve hierarchical fitting.',
  },
  {
    id: 'plot18',
    src: '/plots/plot18_habitability_scores.png',
    title: 'Habitability scores',
    caption:
      'The score distribution and ranked candidates provide the most direct bridge from clustering to a reviewable scientific claim.',
  },
  {
    id: 'plot20',
    src: '/plots/plot20_radar_top5.png',
    title: 'Top-five radar view',
    caption:
      'The radar chart compresses the Earth-like narrative into a compact comparative view for the highest-ranked planets.',
  },
];

const PAPER_HIGHLIGHTS = [
  {
    label: 'Usable rows',
    value: '4,529',
    note: 'After default-flag filtering, radius filtering, and KNN imputation.',
  },
  {
    label: 'Target recovery',
    value: '20 / 20',
    note: 'Every manually selected benchmark planet survives preprocessing.',
  },
  {
    label: 'Habitable candidates',
    value: '39',
    note: 'The filtered candidate pool that feeds the score ranking.',
  },
  {
    label: 'Top score',
    value: '9.24',
    note: 'Kepler-452 b is the best-scoring candidate in the current run.',
  },
  {
    label: 'K-Means',
    value: 'k = 5',
    note: 'Earth-like cluster resolved as cluster 3 after the outlier fix.',
  },
  {
    label: 'Agglomerative',
    value: 'Ward + PCA-10D',
    note: 'Earth-like cluster resolved as cluster 1 with balanced partitions.',
  },
];

const MODEL_SUMMARY = [
  {
    title: 'Decision tree',
    body: '0.95 accuracy, 0.90 recall on the habitable class, after SMOTE balancing.',
  },
  {
    title: 'Naive Bayes',
    body: '0.35 accuracy overall, which makes it a useful contrast model rather than the main classifier.',
  },
  {
    title: 'Association rules',
    body: '2,574 total rules and 309 habitability-focused rules after filtering the consequent.',
  },
];

const EARTH_REFERENCE = {
  pl_rade: 1,
  pl_bmasse: 1,
  pl_dens: 5.5,
  pl_eqt: 288,
  pl_insol: 1,
  st_teff: 5778,
};

const HABITABILITY_FIELDS = [
  'pl_rade',
  'pl_eqt',
  'pl_insol',
  'pl_dens',
  'st_teff',
];

const SIMILARITY_FIELDS = [
  'pl_rade',
  'pl_eqt',
  'pl_insol',
  'pl_dens',
  'st_teff',
  ...FEATURE_KEYS.filter((key) => !['pl_rade', 'pl_eqt', 'pl_insol', 'pl_dens', 'st_teff'].includes(key)),
];

const defaultSimilarityInput = Object.fromEntries(FEATURE_KEYS.map((key) => [key, '']));
const defaultHabitabilityInput = Object.fromEntries(HABITABILITY_FIELDS.map((key) => [key, '']));
const FOUND_PLANETS = new Set(['Kepler-69 c', 'Kepler-311 d']);

function format(value, digits = 2) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

function normalizePlanetRows(summary, rows) {
  const headers = summary.rowFields ?? ['pl_name', ...summary.featureNames];
  return rows.map((row) => {
    const record = headers.reduce((acc, key, index) => {
      acc[key] = row[index];
      return acc;
    }, {});

    record.isTarget = Boolean(record.is_target);
    record.kmCluster = record.km_cluster;
    record.aggCluster = record.agg_cluster;

    return record;
  });
}

function Field({ label, value, onChange, step = 'any', suffix, placeholder, min, max }) {
  return (
    <label className="field">
      <span className="field__label">
        {label}
        {suffix ? <em>{suffix}</em> : null}
      </span>
      <input
        type="number"
        value={value}
        step={step}
        min={min}
        max={max}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function MetricCard({ label, value, note }) {
  return (
    <article className="metric-card">
      <span className="metric-card__label">{label}</span>
      <strong className="metric-card__value">{value}</strong>
      <p className="metric-card__note">{note}</p>
    </article>
  );
}

function FigureCard({ figure, onOpen }) {
  return (
    <button className="figure-card" type="button" onClick={() => onOpen(figure)}>
      <img src={figure.src} alt={figure.title} />
      <div className="figure-card__body">
        <span>{figure.id.toUpperCase()}</span>
        <h3>{figure.title}</h3>
        <p>{figure.caption}</p>
      </div>
    </button>
  );
}

function getSimilarityLabel(planet) {
  if (FOUND_PLANETS.has(planet.pl_name)) {
    return 'Found planet';
  }

  if (planet.isTarget) {
    return 'Target planet';
  }

  return `K-Means cluster ${planet.kmCluster} · Agg cluster ${planet.aggCluster}`;
}

function NavButton({ active, children, onClick }) {
  return (
    <button type="button" className={active ? 'nav-pill is-active' : 'nav-pill'} onClick={onClick}>
      {children}
    </button>
  );
}

function FindingsPage({ summary, onOpenFigure }) {
  return (
    <div className="page-stack">
      <header className="hero">
        <div className="hero__copy">
          <p className="eyebrow">IEEE-style lab report interface</p>
          <h1>Exoplanet Habitability Research Dashboard</h1>
          <p className="hero__lede">
            A paper-first interface for your data mining lab. This page keeps the findings,
            the strongest figures, and the method story together in one place so it reads
            like a proper research presentation instead of a generic app.
          </p>
          <div className="hero__chips">
            <span>NASA Exoplanet Archive</span>
            <span>KNN imputation</span>
            <span>K-Means + Ward clustering</span>
            <span>Habitability scoring</span>
          </div>
        </div>

        <aside className="hero__summary">
          <div className="hero__summary-top">
            <span>Paper state</span>
            <strong>Complete analysis run</strong>
          </div>
          <div className="hero__summary-grid">
            <div>
              <span>Targets recovered</span>
              <strong>{summary?.targetRecovered ?? '20 / 20'}</strong>
            </div>
            <div>
              <span>Top candidate</span>
              <strong>{summary?.topCandidate?.name ?? 'Kepler-452 b'}</strong>
            </div>
            <div>
              <span>Top score</span>
              <strong>{summary?.topCandidate?.score ?? '9.24'}</strong>
            </div>
            <div>
              <span>Habitable candidates</span>
              <strong>{summary?.habitableCandidates ?? 39}</strong>
            </div>
          </div>
        </aside>
      </header>

      <section className="metrics">
        {PAPER_HIGHLIGHTS.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="narrative-grid">
        <article className="panel panel--narrow">
          <p className="section-label">Research narrative</p>
          <h2>What the paper actually shows</h2>
          <ul className="finding-list">
            <li>
              The dataset is heavily sparse in a few orbital and stellar channels, so the
              preprocessing story matters as much as the clustering itself.
            </li>
            <li>
              Five clusters work well after removing extreme outliers, and the Earth-like
              cluster is stable across both K-Means and Ward linkage.
            </li>
            <li>
              The candidate ranking is anchored by a transparent Gaussian score, which
              makes the shortlist easy to explain in front of your instructor.
            </li>
          </ul>
        </article>

        <article className="panel">
          <p className="section-label">Model snapshot</p>
          <div className="model-grid">
            {MODEL_SUMMARY.map((model) => (
              <div key={model.title} className="model-card">
                <strong>{model.title}</strong>
                <p>{model.body}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="section-label">Evidence atlas</p>
            <h2>The plots that carry the paper</h2>
          </div>
          <p className="section-note">
            Only the figures that support the argument are shown here. The noisier
            exploratory and classifier diagnostics stay out of the main narrative.
          </p>
        </div>

        <div className="figure-grid">
          {FIGURES.map((figure) => (
            <FigureCard key={figure.id} figure={figure} onOpen={onOpenFigure} />
          ))}
        </div>
      </section>

      <section className="paper-footer panel">
        <div>
          <p className="section-label">Paper context</p>
          <h2>Why this reads as research, not a demo</h2>
        </div>
        <div className="footer-grid">
          <div>
            <strong>Method chain</strong>
            <p>
              Missing-value review, KNN imputation, scaling, cluster selection,
              score-based ranking, and a validation classifier.
            </p>
          </div>
          <div>
            <strong>Scientific tone</strong>
            <p>
              Minimal chrome, dense information, clear captions, and an IEEE-like
              structure that suits a lab viva or conference showcase.
            </p>
          </div>
          <div>
            <strong>Recommended presentation order</strong>
            <p>
              Start with the summary cards, move to the atlas, then demo the two tools
              live.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function SimilarityPage({ planets, summary }) {
  const [input, setInput] = useState(defaultSimilarityInput);
  const stats = useMemo(
    () => buildFeatureStatsForKeys(planets, SIMILARITY_FIELDS),
    [planets],
  );
  const results = useMemo(
    () => rankSimilarPlanetsFlexible(input, planets, stats, SIMILARITY_FIELDS, 5),
    [input, planets, stats],
  );

  const activeCount = SIMILARITY_FIELDS.filter(
    (key) => input[key] !== '' && input[key] !== null && input[key] !== undefined,
  ).length;

  return (
    <div className="page-stack">
      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="section-label">Similarity search</p>
            <h2>Find the 5 most similar planets using all 17 features</h2>
          </div>
          <div className="page-note">
            Empty fields are ignored. The match is computed only from the values you fill in.
          </div>
        </div>

        <div className="lab-grid">
          <div className="lab-grid__form">
            <div className="toolbar">
              <div className="toolbar__meta">
                <strong>{activeCount}</strong>
                <span>active features</span>
              </div>
              <button type="button" className="secondary" onClick={() => setInput(defaultSimilarityInput)}>
                Clear all
              </button>
            </div>

            <div className="form-grid form-grid--dense">
              {SIMILARITY_FIELDS.map((key) => (
                <Field
                  key={key}
                  label={FEATURE_META[key]?.label ?? key}
                  suffix={FEATURE_META[key]?.unit ? `(${FEATURE_META[key].unit})` : ''}
                  value={input[key]}
                  placeholder="Optional"
                  onChange={(value) => setInput((prev) => ({ ...prev, [key]: value }))}
                />
              ))}
            </div>
          </div>

          <aside className="lab-grid__results">
            <div className="result-card result-card--focus">
              <span className="section-label">Result</span>
              {results.length > 0 ? (
                <>
                  <p className="result-card__text">
                    Based on the features you supplied, these are the five closest planets
                    in the cleaned catalogue.
                  </p>
                  <div className="similar-stack">
                    {results.map((planet) => (
                      <div key={planet.pl_name} className="similar-row">
                        <div>
                          <strong>{planet.pl_name}</strong>
                          <span>{getSimilarityLabel(planet)}</span>
                        </div>
                        <div className="similar-row__meta">
                          <strong>{format(planet.similarity)}%</strong>
                          <span>match</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="result-card__text">
                  Enter one or more feature values to rank the five most similar planets.
                </p>
              )}
            </div>

            <div className="result-card">
              <span className="section-label">Notes</span>
              <p className="result-card__text">
                The comparison uses z-score-normalized distance over all 17 features you
                choose to provide. Leaving a field empty simply removes it from the match.
              </p>
              <p className="result-card__text">
                Candidate pool loaded: {summary?.dataset?.usableRows ?? planets.length} planets.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

function HabitabilityPage() {
  const [input, setInput] = useState(defaultHabitabilityInput);
  const assessment = useMemo(() => assessHabitability(input), [input]);
  const earthScore = useMemo(() => calculateHabitabilityScore(EARTH_REFERENCE), []);

  return (
    <div className="page-stack">
      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="section-label">Habitability scoring</p>
            <h2>Use the 5 core features to score a planet or stop early if it is clearly uninhabitable</h2>
          </div>
          <div className="page-note">
            Exact Earth-like values map to a perfect 10.0.
          </div>
        </div>

        <div className="lab-grid">
          <div className="lab-grid__form">
            <div className="toolbar">
              <div className="toolbar__meta">
                <strong>5</strong>
                <span>required features</span>
              </div>
              <div className="toolbar__actions">
                <button type="button" className="secondary" onClick={() => setInput(defaultHabitabilityInput)}>
                  Clear
                </button>
                <button type="button" className="secondary" onClick={() => setInput({
                  pl_rade: '1',
                  pl_eqt: '288',
                  pl_insol: '1',
                  pl_dens: '5.5',
                  st_teff: '5778',
                })}>
                  Load Earth baseline
                </button>
              </div>
            </div>

            <div className="form-grid">
              <Field
                label="Planet radius"
                suffix="(Earth radii)"
                value={input.pl_rade}
                onChange={(value) => setInput((prev) => ({ ...prev, pl_rade: value }))}
              />
              <Field
                label="Equilibrium temperature"
                suffix="(K)"
                value={input.pl_eqt}
                onChange={(value) => setInput((prev) => ({ ...prev, pl_eqt: value }))}
              />
              <Field
                label="Insolation flux"
                suffix="(Earth flux)"
                value={input.pl_insol}
                onChange={(value) => setInput((prev) => ({ ...prev, pl_insol: value }))}
              />
              <Field
                label="Planet density"
                suffix="(g/cm^3)"
                value={input.pl_dens}
                onChange={(value) => setInput((prev) => ({ ...prev, pl_dens: value }))}
              />
              <Field
                label="Stellar effective temperature"
                suffix="(K)"
                value={input.st_teff}
                onChange={(value) => setInput((prev) => ({ ...prev, st_teff: value }))}
              />
            </div>

            <p className="form-hint">
              If one value is far outside the broad habitable window used by the lab,
              the system returns <strong>Uninhabitable</strong> instead of forcing a score.
            </p>
          </div>

          <aside className="lab-grid__results">
            <div className="result-card result-card--focus">
              <span className="section-label">Assessment</span>
              {assessment.status === 'uninhabitable' ? (
                <>
                  <div className="score-row score-row--alert">
                    <strong>Uninhabitable</strong>
                    <span>{assessment.reason}</span>
                  </div>
                  <p className="result-card__text">
                    The input falls outside the conservative habitability window inferred
                    from the lab’s filtering ranges.
                  </p>
                </>
              ) : assessment.status === 'incomplete' ? (
                <p className="result-card__text">{assessment.reason}</p>
              ) : (
                <>
                  <div className="score-row">
                    <strong>{DECIMAL_FORMATTER.format(assessment.score)}</strong>
                    <span>{classifyScore(assessment.score)}</span>
                  </div>
                  <div className="progress">
                    <div style={{ width: `${Math.min((assessment.score ?? 0) * 10, 100)}%` }} />
                  </div>
                  <div className="score-components">
                    {assessment.components.map((component) => (
                      <div key={component.key} className="score-components__item">
                        <span>{component.label}</span>
                        <strong>{DECIMAL_FORMATTER.format(component.contribution)}</strong>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="result-card">
              <span className="section-label">Earth reference</span>
              <p className="result-card__text">
                Earth-like input scores a perfect {DECIMAL_FORMATTER.format(earthScore.score)}.
              </p>
              <p className="result-card__text">
                Radius: 1.0, temp: 288 K, insolation: 1.0, density: 5.5, stellar temp: 5778 K.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

export default function App() {
  const [summary, setSummary] = useState(null);
  const [planets, setPlanets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalFigure, setModalFigure] = useState(null);
  const [page, setPage] = useState('findings');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [summaryRes, planetsRes] = await Promise.all([
          fetch('/data/analysis-summary.json'),
          fetch('/data/planet-rows.json'),
        ]);

        if (!summaryRes.ok || !planetsRes.ok) {
          throw new Error('Failed to load analysis data.');
        }

        const summaryJson = await summaryRes.json();
        const planetsJson = await planetsRes.json();
        const parsedPlanets = normalizePlanetRows(summaryJson, planetsJson.rows);

        if (!cancelled) {
          setSummary(summaryJson);
          setPlanets(parsedPlanets);
          setLoading(false);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message || 'Unable to load project data.');
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="app-shell">
      <nav className="topbar">
        <div className="topbar__brand">
          <strong>Exoplanet Habitability Research Dashboard</strong>
          <span>NASA Archive · Data Mining Lab</span>
        </div>

        <div className="topbar__nav">
          <NavButton active={page === 'findings'} onClick={() => setPage('findings')}>
            Findings
          </NavButton>
          <NavButton active={page === 'similarity'} onClick={() => setPage('similarity')}>
            17-feature similarity
          </NavButton>
          <NavButton active={page === 'habitability'} onClick={() => setPage('habitability')}>
            5-feature habitability
          </NavButton>
        </div>
      </nav>

      <main className="content">
        {page === 'findings' ? (
          <FindingsPage summary={summary} onOpenFigure={setModalFigure} />
        ) : null}
        {page === 'similarity' ? <SimilarityPage planets={planets} summary={summary} /> : null}
        {page === 'habitability' ? <HabitabilityPage /> : null}
      </main>

      {loading ? <div className="overlay">Loading analysis data...</div> : null}
      {error ? <div className="overlay overlay--error">{error}</div> : null}

      {modalFigure ? (
        <button
          type="button"
          className="modal-backdrop"
          onClick={() => setModalFigure(null)}
        >
          <figure className="modal-card" onClick={(event) => event.stopPropagation()}>
            <img src={modalFigure.src} alt={modalFigure.title} />
            <figcaption>
              <strong>{modalFigure.title}</strong>
              <p>{modalFigure.caption}</p>
            </figcaption>
          </figure>
        </button>
      ) : null}
    </div>
  );
}
