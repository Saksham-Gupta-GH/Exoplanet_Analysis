export const FEATURE_KEYS = [
  'pl_rade',
  'pl_bmasse',
  'pl_dens',
  'pl_eqt',
  'pl_insol',
  'pl_orbsmax',
  'pl_orbper',
  'pl_orbeccen',
  'pl_trandur',
  'pl_ratdor',
  'pl_ratror',
  'st_teff',
  'st_rad',
  'st_mass',
  'st_met',
  'st_lum',
  'st_logg',
];

export const SIMILARITY_KEYS = [
  'pl_rade',
  'pl_bmasse',
  'pl_dens',
  'pl_eqt',
  'pl_insol',
  'st_teff',
];

export const FEATURE_META = {
  pl_rade: { label: 'Planet radius', unit: 'Earth radii' },
  pl_bmasse: { label: 'Planet mass', unit: 'Earth masses' },
  pl_dens: { label: 'Planet density', unit: 'g/cm^3' },
  pl_eqt: { label: 'Equilibrium temperature', unit: 'K' },
  pl_insol: { label: 'Insolation flux', unit: 'Earth flux' },
  pl_orbsmax: { label: 'Semi-major axis', unit: 'AU' },
  pl_orbper: { label: 'Orbital period', unit: 'days' },
  pl_orbeccen: { label: 'Orbital eccentricity', unit: 'ratio' },
  pl_trandur: { label: 'Transit duration', unit: 'hours' },
  pl_ratdor: { label: 'Scaled orbital distance', unit: 'ratio' },
  pl_ratror: { label: 'Radius ratio', unit: 'ratio' },
  st_teff: { label: 'Stellar effective temperature', unit: 'K' },
  st_rad: { label: 'Stellar radius', unit: 'solar radii' },
  st_mass: { label: 'Stellar mass', unit: 'solar masses' },
  st_met: { label: 'Stellar metallicity', unit: 'dex' },
  st_lum: { label: 'Stellar luminosity', unit: 'log solar' },
  st_logg: { label: 'Stellar surface gravity', unit: 'log g' },
};

export const TARGET_PLANETS = [
  'LP 890-9 c',
  'Gliese 12 b',
  'K2-3 d',
  'Kepler-1652 b',
  'Kepler-1649 c',
  'TOI-2095 c',
  'Kepler-1653 b',
  'TOI-715 b',
  'K2-133 e',
  'TOI-6002 b',
  'TOI-7166 b',
  'TOI-4336 A b',
  'K2-9 b',
  'TOI-1452 b',
  'TOI-712 d',
  'LHS 1140 b',
  'Kepler-1052 c',
  'Kepler-22 b',
  'Kepler-452 b',
  'Kepler-186 f',
];

export const EARTH_DEFAULTS = {
  pl_rade: 1,
  pl_bmasse: 1,
  pl_dens: 5.5,
  pl_eqt: 288,
  pl_insol: 1,
  st_teff: 5778,
};

export const SCORE_MODEL = [
  { key: 'pl_rade', label: 'Radius', ideal: 1.0, tolerance: 0.8, weight: 0.25 },
  { key: 'pl_eqt', label: 'Equilibrium temp', ideal: 288.0, tolerance: 90.0, weight: 0.25 },
  { key: 'pl_insol', label: 'Insolation', ideal: 1.0, tolerance: 1.0, weight: 0.2 },
  { key: 'pl_dens', label: 'Density', ideal: 5.5, tolerance: 3.0, weight: 0.15 },
  { key: 'st_teff', label: 'Stellar temp', ideal: 5778.0, tolerance: 1500.0, weight: 0.15 },
];

export const HABITABILITY_GATES = {
  pl_rade: { min: 0.5, max: 2.8, reason: 'radius is outside a broadly rocky / super-Earth range' },
  pl_eqt: { min: 180, max: 370, reason: 'equilibrium temperature is far from the temperate zone' },
  pl_insol: { min: 0.2, max: 10, reason: 'received flux is too low or too high for the target zone' },
  pl_dens: { min: 0.5, max: 15, reason: 'density is incompatible with a plausible rocky world' },
  st_teff: { min: 3500, max: 6500, reason: 'stellar temperature is far from a stable habitable host regime' },
};

export const NUMBER_FORMATTER = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
});

export const DECIMAL_FORMATTER = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function asNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function asOptionalNumber(value) {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function gaussianSimilarity(value, ideal, tolerance) {
  return Math.exp(-((value - ideal) ** 2) / (2 * tolerance ** 2));
}

export function calculateHabitabilityScore(values) {
  const components = SCORE_MODEL.map((model) => {
    const value = asNumber(values[model.key], model.ideal);
    const score = gaussianSimilarity(value, model.ideal, model.tolerance);
    return {
      ...model,
      value,
      score,
      contribution: score * model.weight * 10,
    };
  });

  const total = components.reduce((sum, component) => sum + component.contribution, 0);

  return {
    score: Number(total.toFixed(2)),
    components,
  };
}

export function assessHabitability(values) {
  const missing = SCORE_MODEL.filter((model) => values[model.key] === '' || values[model.key] === null || values[model.key] === undefined);
  if (missing.length > 0) {
    return {
      status: 'incomplete',
      score: null,
      reason: `Please enter all 5 habitability features: ${missing.map((item) => item.label).join(', ')}.`,
      components: [],
    };
  }

  const hardStop = [];
  for (const [key, gate] of Object.entries(HABITABILITY_GATES)) {
    const value = asNumber(values[key], NaN);
    if (!Number.isFinite(value)) {
      return {
        status: 'incomplete',
        score: null,
        reason: `Please enter a valid numeric value for ${key}.`,
        components: [],
      };
    }
    if (value < gate.min || value > gate.max) {
      hardStop.push({ key, value, ...gate });
    }
  }

  if (hardStop.length > 0) {
    return {
      status: 'uninhabitable',
      score: null,
      reason: hardStop[0].reason,
      components: hardStop,
    };
  }

  const scoreResult = calculateHabitabilityScore(values);
  return {
    status: 'score',
    score: scoreResult.score,
    reason: scoreResult.score >= 9.5 ? 'Earth-like baseline' : classifyScore(scoreResult.score),
    components: scoreResult.components,
  };
}

export function buildFeatureStats(planets) {
  const stats = {};

  for (const key of SIMILARITY_KEYS) {
    const values = planets.map((planet) => asNumber(planet[key])).filter(Number.isFinite);
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
    const std = Math.sqrt(variance) || 1;
    stats[key] = {
      mean,
      std,
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }

  return stats;
}

export function buildFeatureStatsForKeys(planets, keys) {
  const stats = {};

  for (const key of keys) {
    const values = planets.map((planet) => asNumber(planet[key])).filter(Number.isFinite);
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
    const std = Math.sqrt(variance) || 1;
    stats[key] = {
      mean,
      std,
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }

  return stats;
}

export function rankSimilarPlanets(values, planets, stats, limit = 5) {
  const weighted = {
    pl_rade: 1.4,
    pl_bmasse: 1.1,
    pl_dens: 1.2,
    pl_eqt: 1.4,
    pl_insol: 1.3,
    st_teff: 1.0,
  };

  const input = Object.fromEntries(
    SIMILARITY_KEYS.map((key) => [key, asNumber(values[key], stats[key]?.mean ?? 0)]),
  );

  return planets
    .map((planet) => {
      let distanceSum = 0;
      let weightSum = 0;

      for (const key of SIMILARITY_KEYS) {
        const stat = stats[key];
        const normalizedDelta = (asNumber(planet[key]) - input[key]) / (stat.std || 1);
        const weight = weighted[key] ?? 1;
        distanceSum += (normalizedDelta * weight) ** 2;
        weightSum += weight;
      }

      const distance = Math.sqrt(distanceSum / Math.max(weightSum, 1));
      const similarity = Math.exp(-distance * 0.75) * 100;

      return {
        ...planet,
        distance,
        similarity,
      };
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
    .map((planet, index) => ({
      ...planet,
      rank: index + 1,
    }));
}

export function rankSimilarPlanetsFlexible(values, planets, stats, keys, limit = 5) {
  const providedKeys = keys.filter((key) => asOptionalNumber(values[key]) !== null);

  if (providedKeys.length === 0) {
    return [];
  }

  const weights = Object.fromEntries(keys.map((key) => [key, 1]));
  const input = Object.fromEntries(
    providedKeys.map((key) => [key, asOptionalNumber(values[key])]),
  );

  return planets
    .map((planet) => {
      let distanceSum = 0;
      let weightSum = 0;

      for (const key of providedKeys) {
        const stat = stats[key];
        const value = input[key];
        const normalizedDelta = (asNumber(planet[key]) - value) / (stat.std || 1);
        const weight = weights[key] ?? 1;
        distanceSum += (normalizedDelta * weight) ** 2;
        weightSum += weight;
      }

      const distance = Math.sqrt(distanceSum / Math.max(weightSum, 1));
      const similarity = Math.exp(-distance * 0.7) * 100;

      return {
        ...planet,
        distance,
        similarity,
      };
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
    .map((planet, index) => ({
      ...planet,
      rank: index + 1,
    }));
}

export function classifyScore(score) {
  if (score >= 8.5) return 'Strong candidate';
  if (score >= 7.0) return 'Promising';
  if (score >= 5.5) return 'Moderate';
  return 'Low';
}
