import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Button } from './components/ui/button';
import { About } from './pages/About';
import { Dashboard } from './pages/Dashboard';
import { Landing } from './pages/Landing';
import { normalizePlanetRows } from './lib/appData';

export default function App() {
  const [summary, setSummary] = useState(null);
  const [planets, setPlanets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [started, setStarted] = useState(false);
  const [activePage, setActivePage] = useState('similarity');
  const [modalFigure, setModalFigure] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadAnalysisData() {
      try {
        const [summaryResponse, planetsResponse] = await Promise.all([
          fetch('/data/analysis-summary.json'),
          fetch('/data/planet-rows.json'),
        ]);

        if (!summaryResponse.ok || !planetsResponse.ok) {
          throw new Error('Failed to load analysis data.');
        }

        const summaryJson = await summaryResponse.json();
        const planetsJson = await planetsResponse.json();
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

    loadAnalysisData();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-white text-google-text">
      {!started ? (
        <Landing onStart={() => setStarted(true)} />
      ) : (
        <>
          <Navbar
            activePage={activePage}
            onNavigate={setActivePage}
            onHome={() => {
              setStarted(false);
              setActivePage('similarity');
            }}
          />
          <main className="bg-google-surface-dim min-h-[calc(100vh-49px)]">
            {activePage === 'about' ? (
              <div className="bg-white">
                <About key="about" summary={summary} onOpenFigure={setModalFigure} />
              </div>
            ) : (
              <Dashboard key="dashboard" activePage={activePage} planets={planets} summary={summary} />
            )}
          </main>
        </>
      )}

      {/* Loading toast */}
      {loading ? (
        <div className="fixed inset-x-0 bottom-4 z-50 mx-auto w-fit rounded-g-xl bg-[#323232] px-5 py-3 text-sm text-white shadow-g-2">
          Loading analysis data…
        </div>
      ) : null}

      {/* Error toast */}
      {error ? (
        <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md rounded-g-lg bg-google-red p-4 text-sm text-white shadow-g-2">
          {error}
        </div>
      ) : null}

      {/* Figure modal */}
      {modalFigure ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setModalFigure(null)}
        >
          <figure
            className="relative max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-g-lg bg-white shadow-g-3"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setModalFigure(null)}
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-google-text-secondary shadow-g-1 transition hover:bg-google-surface-dim"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
            <img src={modalFigure.src} alt={modalFigure.title} className="max-h-[72vh] w-full bg-white object-contain" />
            <figcaption className="border-t border-google-outline p-5">
              <strong className="text-base font-medium text-google-text">{modalFigure.title}</strong>
              {modalFigure.caption ? (
                <p className="mt-1 text-sm text-google-text-secondary">{modalFigure.caption}</p>
              ) : null}
            </figcaption>
          </figure>
        </div>
      ) : null}
    </div>
  );
}
