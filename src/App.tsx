import { lazy, Suspense, useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Footer } from './components/Footer';
import { NotFound } from './components/NotFound';
import { loadCatalog } from './lib/catalog';
import type { Catalog } from './lib/types';

const SpaceGrid = lazy(() =>
  import('./components/SpaceGrid').then((module) => ({ default: module.SpaceGrid })),
);
const SurfaceCompare = lazy(() =>
  import('./components/SurfaceCompare').then((module) => ({ default: module.SurfaceCompare })),
);
const LaunchMonitorTiers = lazy(() =>
  import('./components/LaunchMonitorTiers').then((module) => ({
    default: module.LaunchMonitorTiers,
  })),
);
const HowItWorks = lazy(() =>
  import('./components/HowItWorks').then((module) => ({ default: module.HowItWorks })),
);
const QuoteForm = lazy(() =>
  import('./components/QuoteForm').then((module) => ({ default: module.QuoteForm })),
);

const homeMeta = {
  title: 'Home | Golf Spaces Kenya',
  description:
    'Design and build putting greens, simulator bays and golf practice spaces for Kenyan homes, hotels and workplaces.',
};

function updateMeta(title: string, description: string, noindex = false) {
  document.title = title;
  document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  document
    .querySelector('meta[name="robots"]')
    ?.setAttribute('content', noindex ? 'noindex,nofollow' : 'index,follow');
}

function SectionSkeleton({ label }: { label: string }) {
  return (
    <section className="section" aria-label={label} aria-busy="true">
      <div className="container">
        <div className="section-skeleton" role="status">
          <span className="skeleton-line skeleton-line-wide" />
          <span className="skeleton-line skeleton-line-short" />
          <span className="skeleton-block" />
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const [catalog, setCatalog] = useState<Catalog>({ spaces: [], tiers: [], remote: false }),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(''),
    [reload, setReload] = useState(0),
    [selected, setSelected] = useState<string[]>([]),
    [tier, setTier] = useState(''),
    [announcement, setAnnouncement] = useState('');
  const isNotFound = window.location.pathname !== '/' && window.location.pathname !== '/index.html';

  useEffect(() => {
    const syncMeta = () => {
      if (isNotFound) {
        updateMeta(
          'Page not found | Golf Spaces Kenya',
          'The page you requested could not be found.',
          true,
        );
        return;
      }
      updateMeta(homeMeta.title, homeMeta.description);
    };
    syncMeta();
    window.addEventListener('hashchange', syncMeta);
    return () => window.removeEventListener('hashchange', syncMeta);
  }, [isNotFound]);

  useEffect(() => {
    if (isNotFound) return;
    let active = true;
    loadCatalog()
      .then((c) => {
        if (active) {
          setCatalog(c);
          setError('');
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setError(
            'We couldn’t load the space catalogue. Check your connection and try again; if it continues, please contact us.',
          );
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [reload, isNotFound]);
  function toggle(id: string) {
    const space = catalog.spaces.find((s) => s.id === id);
    setAnnouncement(
      `${space?.name ?? 'Space'} ${selected.includes(id) ? 'removed from' : 'added to'} your quote.`,
    );
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }
  if (isNotFound) return <NotFound />;

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header count={selected.length} />
      <main id="main">
        <Hero />
        <Suspense fallback={<SectionSkeleton label="Loading spaces" />}>
          <SpaceGrid
            spaces={catalog.spaces}
            selected={selected}
            onToggle={toggle}
            remote={catalog.remote}
            loading={loading}
            error={error}
            onRetry={() => {
              setLoading(true);
              setReload((r) => r + 1);
            }}
          />
        </Suspense>
        <Suspense fallback={<SectionSkeleton label="Loading surface options" />}>
          <SurfaceCompare />
        </Suspense>
        <Suspense fallback={<SectionSkeleton label="Loading golf technology" />}>
          <LaunchMonitorTiers
            tiers={catalog.tiers}
            selected={tier}
            onSelect={(id) => {
              setTier(id);
              const sim = catalog.spaces.find((s) => s.is_simulator);
              if (id && sim && !selected.includes(sim.id)) toggle(sim.id);
            }}
          />
        </Suspense>
        <Suspense fallback={<SectionSkeleton label="Loading the process" />}>
          <HowItWorks />
        </Suspense>
        <Suspense fallback={<SectionSkeleton label="Loading the quote form" />}>
          <QuoteForm
            spaces={catalog.spaces}
            selected={selected}
            onToggle={toggle}
            remote={catalog.remote}
            tiers={catalog.tiers}
            tier={tier}
            onTier={setTier}
            onReset={() => {
              setSelected([]);
              setTier('');
            }}
          />
        </Suspense>
      </main>
      <Footer />
      <span className="sr-only" role="status" aria-live="polite">
        {announcement}
      </span>
    </>
  );
}
