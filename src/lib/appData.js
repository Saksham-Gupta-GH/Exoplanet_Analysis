import { FEATURE_KEYS } from './analysis';

export const FIGURES = [
  {
    id: 'plot03',
    src: '/plots/plot03_correlation_heatmap.png',
    title: 'Correlation structure',
    caption: 'Top feature relationships across the NASA Exoplanet Archive sample.',
  },
  {
    id: 'plot01',
    src: '/plots/plot01_missing_values.png',
    title: 'Missingness profile',
    caption: 'Feature sparsity before KNN imputation and downstream modelling.',
  },
  {
    id: 'plot02',
    src: '/plots/plot02_feature_distributions.png',
    title: 'Feature distributions',
    caption: 'Distributional shape of the 17 selected planetary and stellar features.',
  },
  {
    id: 'plot09',
    src: '/plots/plot09_elbow_silhouette.png',
    title: 'Cluster selection',
    caption: 'Elbow and silhouette evidence for the five-cluster K-Means model.',
  },
  {
    id: 'plot10C',
    src: '/plots/plot10C_comparison.png',
    title: 'K-Means vs Agglomerative',
    caption: 'A comparative view of the partitioning behaviour after outlier handling.',
  },
  {
    id: 'plot11',
    src: '/plots/plot11_kmeans_cluster_sizes.png',
    title: 'K-Means cluster sizes',
    caption: 'Population balance across the K-Means clusters.',
  },
  {
    id: 'plot14',
    src: '/plots/plot14_agg_cluster_sizes.png',
    title: 'Agglomerative cluster sizes',
    caption: 'Ward-linkage cluster counts after PCA reduction.',
  },
  {
    id: 'agg-islands',
    src: '/plots/agglomerative_islands.png',
    title: 'Agglomerative islands',
    caption: 'Island-style projection of agglomerative clusters for visual comparison with K-Means structure.',
  },
  {
    id: 'plot13',
    src: '/plots/plot13_dendrogram.png',
    title: 'Ward dendrogram',
    caption: 'Hierarchical structure from the PCA-10D representation.',
  },
  {
    id: 'plot18',
    src: '/plots/plot18_habitability_scores.png',
    title: 'Habitability scores',
    caption: 'Ranked candidate distribution from the Gaussian score model.',
  },
  {
    id: 'plot20',
    src: '/plots/plot20_radar_top5.png',
    title: 'Top-five radar view',
    caption: 'Earth-relative profile of the strongest candidates.',
  },
];

export const RESEARCH_PAPER_LINK = 'https://drive.google.com/file/d/1eCSkRGe7b6PZEWs1A0tK00jLGcB3kKXt/view?usp=sharing';

export const PAPER_HIGHLIGHTS = [
  { label: 'Usable rows', value: '4,529' },
  { label: 'Target recovery', value: '20 / 20' },
  { label: 'Candidates', value: '39' },
  { label: 'Top score', value: '9.24' },
];

export const CONTRIBUTIONS = [
  'Multiple clustering algorithms for exoplanet grouping',
  'Extreme outlier handling before cluster fitting',
  'Gaussian habitability scoring over planetary and stellar features',
  'Recovery of known habitable benchmark planets',
];

export const HABITABILITY_FIELDS = ['pl_rade', 'pl_eqt', 'pl_insol', 'pl_dens', 'st_teff'];

export const SIMILARITY_FIELDS = [
  'pl_rade',
  'pl_eqt',
  'pl_insol',
  'pl_dens',
  'st_teff',
  ...FEATURE_KEYS.filter((key) => !['pl_rade', 'pl_eqt', 'pl_insol', 'pl_dens', 'st_teff'].includes(key)),
];

export const NEGATIVE_ALLOWED_FIELDS = new Set(['st_met', 'st_lum']);
export const FOUND_PLANETS = new Set(['Kepler-69 c', 'Kepler-311 d']);

export const EXAMPLE_VALUES = {
  pl_rade: '1.63',
  pl_bmasse: '5',
  pl_dens: '5.5',
  pl_eqt: '288',
  pl_insol: '1',
  pl_orbsmax: '1.0',
  pl_orbper: '365',
  pl_orbeccen: '0.02',
  pl_trandur: '12',
  pl_ratdor: '215',
  pl_ratror: '0.009',
  st_teff: '5778',
  st_rad: '1',
  st_mass: '1',
  st_met: '0',
  st_lum: '0',
  st_logg: '4.44',
};

export function formatNumber(value, digits = 2) {
  if (typeof value !== 'number' || Number.isNaN(value)) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function normalizePlanetRows(summary, rows) {
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

export function getSimilarityLabel(planet) {
  if (FOUND_PLANETS.has(planet.pl_name)) return 'Found planet';
  if (planet.isTarget) return 'Target planet';
  return `K-Means cluster ${planet.kmCluster} · Agg cluster ${planet.aggCluster}`;
}

export function convertGoogleDocsDownloadLink(url) {
  if (!url) return '/assets/research-paper.pdf';
  const docsMatch = url.match(/docs\.google\.com\/document\/d\/([^/]+)/);
  if (docsMatch?.[1]) {
    return `https://docs.google.com/document/d/${docsMatch[1]}/export?format=pdf`;
  }
  return url;
}
