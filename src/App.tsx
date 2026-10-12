import { useEffect, useState } from 'react';
import { HashRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Icon } from './components/Icon';
import { TabBar } from './components/TabBar';
import { onAnnounce, onBanner, type Banner } from './pwa/bus';
import { applyUpdate, registerSW } from './pwa/registerSW';
import { startOutbox } from './store/outbox';
import { Alert } from './screens/Alert';
import { Caches } from './screens/Caches';
import { CheckInFlow } from './screens/CheckIn';
import { Home } from './screens/Home';
import { LovedOnes } from './screens/LovedOnes';
import { Settings } from './screens/Settings';

function Banners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const navigate = useNavigate();
  useEffect(() => onBanner((b) => setBanners((list) => [b, ...list].slice(0, 3))), []);
  const dismiss = (id: string) => setBanners((list) => list.filter((b) => b.id !== id));
  if (banners.length === 0) return null;
  return (
    <div className="banners">
      {banners.map((b) => (
        <div
          key={b.id}
          className={`banner banner--${b.tone}`}
          role={b.tone === 'alert' ? 'alert' : 'status'}
        >
          <Icon name={b.tone === 'alert' ? 'alert' : 'bell'} />
          <div className="banner__body">
            <strong>{b.title}</strong>
            {b.body && <p>{b.body}</p>}
            {b.action && (
              <div className="banner__actions">
                <button
                  type="button"
                  className="btn btn--small"
                  onClick={() => {
                    dismiss(b.id);
                    navigate(b.action!.to);
                  }}
                >
                  {b.action.label}
                </button>
              </div>
            )}
          </div>
          <button
            type="button"
            className="banner__close"
            aria-label="Dismiss"
            onClick={() => dismiss(b.id)}
          >
            <Icon name="x" />
          </button>
        </div>
      ))}
    </div>
  );
}

function LiveRegion() {
  const [text, setText] = useState('');
  useEffect(
    () =>
      onAnnounce((t) => {
        // Clear first so repeating the same text is announced again.
        setText('');
        setTimeout(() => setText(t), 50);
      }),
    [],
  );
  return (
    <div className="sr-only" aria-live="polite" aria-atomic="true">
      {text}
    </div>
  );
}

function UpdateToast() {
  const [show, setShow] = useState(false);
  useEffect(() => registerSW(() => setShow(true)), []);
  if (!show) return null;
  return (
    <div className="toast" role="status">
      <span>Update available</span>
      <button type="button" className="btn btn--small" onClick={applyUpdate}>
        Reload
      </button>
      <button
        type="button"
        className="banner__close"
        aria-label="Dismiss"
        onClick={() => setShow(false)}
      >
        <Icon name="x" />
      </button>
    </div>
  );
}

export default function App() {
  useEffect(() => startOutbox(), []);
  return (
    <HashRouter>
      <div className="app">
        <a
          href="#main"
          className="skip-link"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById('main')?.focus();
          }}
        >
          Skip to content
        </a>
        <Header />
        <Banners />
        <main id="main" tabIndex={-1}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/alert" element={<Alert />} />
            <Route path="/checkin" element={<CheckInFlow />} />
            <Route path="/caches" element={<Caches />} />
            <Route path="/loved" element={<LovedOnes />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <TabBar />
        <LiveRegion />
        <UpdateToast />
      </div>
    </HashRouter>
  );
}
