import { useState } from 'react';
import { AlertCircle, CheckCircle2, Download, LoaderCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { convertGoogleDocsDownloadLink } from '../lib/appData';

/* ─── Inline plot figure ──────────────────────────────────────── */
function PlotFigure({ src, alt, caption, onOpenFigure }) {
  return (
    <figure
      className="my-5 cursor-pointer overflow-hidden rounded-g-lg border border-google-outline transition hover:shadow-g-1 sm:my-6"
      onClick={() => onOpenFigure?.({ id: alt, src, title: alt, caption: caption || '' })}
    >
      <img src={src} alt={alt} className="w-full object-contain bg-white" loading="lazy" />
      {caption ? (
        <figcaption className="border-t border-google-outline px-4 py-2.5 text-xs text-google-text-tertiary">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

function PlotRow({ children }) {
  return <div className="my-5 grid gap-4 sm:my-6 sm:grid-cols-2">{children}</div>;
}

function PlotRowItem({ src, alt, caption, onOpenFigure }) {
  return (
    <figure
      className="cursor-pointer overflow-hidden rounded-g-lg border border-google-outline transition hover:shadow-g-1"
      onClick={() => onOpenFigure?.({ id: alt, src, title: alt, caption: caption || '' })}
    >
      <img src={src} alt={alt} className="w-full object-contain bg-white" loading="lazy" />
      {caption ? (
        <figcaption className="border-t border-google-outline px-3 py-2 text-xs text-google-text-tertiary">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

/* ═══ About Page ══════════════════════════════════════════════════ */

// <!-- TODO: Replace paperAuthors, paperInstitution with final paper metadata. -->
// <!-- TODO: Set VITE_RESEARCH_PAPER_URL to https://docs.google.com/document/d/DOC_ID/export?format=pdf when the final Google Doc is ready. -->

const paperAuthors = 'Saksham Gupta';
const paperInstitution = '[Insert institution name here]';
const paperYear = '2026';

export function About({ summary, onOpenFigure }) {
  const paperUrl = convertGoogleDocsDownloadLink(import.meta.env.VITE_RESEARCH_PAPER_URL);
  const [downloadState, setDownloadState] = useState('idle');
  const [downloadError, setDownloadError] = useState('');

  const handleDownload = async () => {
    setDownloadState('loading');
    setDownloadError('');
    try {
      const response = await fetch(paperUrl);
      if (!response.ok) throw new Error('Download unavailable');
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = 'exoplanet-analysis-research-paper.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
      setDownloadState('success');
    } catch (err) {
      setDownloadState('error');
      setDownloadError(err.message || 'Download unavailable');
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-3 py-6 sm:px-6 sm:py-10 lg:px-8">
      {/* Header */}
      <header className="border-b border-google-outline pb-6 sm:pb-8">
        <h1 className="text-2xl font-medium text-google-text sm:text-4xl">
          Exoplanet Habitability Analysis
        </h1>
        <p className="mt-2 text-base text-google-text-secondary">
          Data Mining &amp; Unsupervised Learning on the NASA Exoplanet Archive
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-google-text-tertiary">
          <span className="text-google-text-secondary">{paperAuthors}</span>
          <span>·</span>
          <span>{paperInstitution}</span>
          <span>·</span>
          <span className="number">{paperYear}</span>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button
            onClick={handleDownload}
            disabled={downloadState === 'loading'}
            className="w-full sm:w-auto"
          >
            {downloadState === 'loading' ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : downloadState === 'success' ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {downloadState === 'loading' ? 'Preparing…' : downloadState === 'success' ? 'Downloaded' : 'Download Paper'}
          </Button>
          {downloadState === 'error' ? (
            <span className="flex items-center gap-1.5 text-sm text-google-red">
              <AlertCircle className="h-4 w-4" />
              {downloadError}
            </span>
          ) : null}
        </div>
      </header>

      {/* ── Article body ──────────────────────────────────────── */}
      <article className="prose-research mt-8">

        <p>
          This project presents a comprehensive data mining framework for analyzing
          exoplanets and identifying potentially habitable candidates using
          unsupervised learning techniques. The study is built on the{' '}
          <strong>NASA Exoplanet Archive</strong>, starting from over 39,000 raw
          records and refining them into a high-quality dataset of{' '}
          <strong>4,326 confirmed exoplanets</strong> described by 17 physically
          meaningful planetary and stellar features.
        </p>

        <p>
          A complete <strong>Knowledge Discovery in Databases (KDD)</strong> pipeline
          is implemented, covering data selection, cleaning, transformation,
          clustering, evaluation, and prediction. Missing data is handled using{' '}
          <strong>KNN imputation</strong>, while extreme outliers are removed to
          improve clustering stability. Feature distributions and preprocessing
          effects are visualized below, highlighting the importance of data quality
          and normalization before modeling.
        </p>

        <PlotFigure
          src="/plots/plot01_missing_values.png"
          alt="Missing Value Profile"
          caption="Feature sparsity before KNN imputation — red bars exceed 50% missing."
          onOpenFigure={onOpenFigure}
        />

        <PlotFigure
          src="/plots/plot02_feature_distributions.png"
          alt="Feature Distributions"
          caption="Distributional shape of the 17 selected planetary and stellar features after imputation."
          onOpenFigure={onOpenFigure}
        />

        <PlotFigure
          src="/plots/plot03_correlation_heatmap.png"
          alt="Correlation Heatmap"
          caption="Top feature relationships — reveals strong stellar–radius coupling."
          onOpenFigure={onOpenFigure}
        />

        <h2>Unsupervised Clustering</h2>

        <p>
          Two unsupervised clustering algorithms — <strong>K-Means</strong> and{' '}
          <strong>Agglomerative (Ward linkage)</strong> — are applied to uncover
          natural groupings of exoplanets. The optimal number of clusters
          (k&nbsp;=&nbsp;5) is validated using elbow and silhouette analysis. These
          clusters correspond to meaningful astrophysical categories such as hot
          Jupiters, sub-Neptunes, and Earth-like rocky planets.
        </p>

        <PlotFigure
          src="/plots/plot09_elbow_silhouette.png"
          alt="Elbow & Silhouette Analysis"
          caption="Elbow (WCSS) and silhouette score — k = 5 is the optimal cluster count."
          onOpenFigure={onOpenFigure}
        />

        <PlotRow>
          <PlotRowItem
            src="/plots/plot10_kmeans_islands.png"
            alt="K-Means Cluster Visualization"
            caption="PCA-projected K-Means separation — each color is a distinct astrophysical population."
            onOpenFigure={onOpenFigure}
          />
          <PlotRowItem
            src="/plots/agglomerative_islands.png"
            alt="Agglomerative Cluster Visualization"
            caption="PCA-projected agglomerative cluster islands for comparison with K-Means."
            onOpenFigure={onOpenFigure}
          />
        </PlotRow>

        <PlotFigure
          src="/plots/plot13_dendrogram.png"
          alt="Ward Dendrogram"
          caption="Hierarchical structure from PCA-10D representation with Ward linkage."
          onOpenFigure={onOpenFigure}
        />

        <PlotRow>
          <PlotRowItem
            src="/plots/plot11_kmeans_cluster_sizes.png"
            alt="K-Means Cluster Sizes"
            caption="K-Means cluster population."
            onOpenFigure={onOpenFigure}
          />
          <PlotRowItem
            src="/plots/plot14_agg_cluster_sizes.png"
            alt="Agglomerative Cluster Sizes"
            caption="Agglomerative cluster population."
            onOpenFigure={onOpenFigure}
          />
        </PlotRow>

        <p>
          Cluster size distributions confirm balanced and stable groupings across
          both algorithms, with no degenerate singleton clusters after outlier
          removal.
        </p>

        <h2>Gaussian Habitability Scoring</h2>

        <p>
          A key innovation is the <strong>Gaussian-based habitability scoring
          system</strong>. Instead of rigid habitable zone definitions, a continuous
          score (0–10) is computed using Earth-referenced Gaussian functions over
          radius, temperature, insolation, density, and stellar temperature.
        </p>

        <PlotFigure
          src="/plots/plot18_habitability_scores.png"
          alt="Habitability Score Distribution"
          caption="Score distribution and top-20 candidates — gold bars are known benchmark planets."
          onOpenFigure={onOpenFigure}
        />

        <PlotFigure
          src="/plots/plot19_3d_habitability.png"
          alt="3D Habitability Landscape"
          caption="Radius × Insolation × Temperature colored by habitability score — cyan star marks Earth."
          onOpenFigure={onOpenFigure}
        />

        <PlotFigure
          src="/plots/plot20_radar_top5.png"
          alt="Top-5 Radar Chart"
          caption="Earth-relative profile of the strongest candidates — 1.0 = identical to Earth."
          onOpenFigure={onOpenFigure}
        />

        <h2>Validation &amp; Benchmark Recovery</h2>

        <p>
          The framework is validated using a benchmark set of{' '}
          <strong>20 scientifically recognized habitable-zone planets</strong>,
          all successfully recovered by the clustering and scoring system. This
          demonstrates both robustness and interpretability.
        </p>

        <PlotRow>
          <PlotRowItem
            src="/plots/plot10C_comparison.png"
            alt="K-Means vs Agglomerative"
            caption="Side-by-side cluster comparison."
            onOpenFigure={onOpenFigure}
          />
          <PlotRowItem
            src="/plots/plot12_cluster_table.png"
            alt="Cluster Summary Table"
            caption="Mean feature values per cluster."
            onOpenFigure={onOpenFigure}
          />
        </PlotRow>

        <h2>Interactive Prediction Interface</h2>

        <p>
          Finally, the project provides an <strong>interactive prediction
          interface</strong>. Users can input planetary parameters to obtain both a
          cluster classification and a habitability score, making the system a
          practical tool for evaluating newly discovered exoplanets. This transforms
          the work from a purely exploratory study into a scalable, real-world
          application for astrophysical research.
        </p>

      </article>
    </div>
  );
}
