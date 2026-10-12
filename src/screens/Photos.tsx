import { useEffect, useState } from 'react';
import { Icon } from '../components/Icon';
import { useStepFocus } from '../components/useStepFocus';
import { MAX_PHOTOS } from '../config';
import { deletePhoto, getPhoto, resizePhoto, savePhoto } from '../store/photos';

export function PhotosStep({
  photoIds,
  onChange,
  onContinue,
}: {
  photoIds: string[];
  onChange: (ids: string[]) => void;
  onContinue: () => void;
}) {
  const heading = useStepFocus<HTMLHeadingElement>('Add photos. Optional.');
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Load thumbnails for stored photos.
  useEffect(() => {
    let cancelled = false;
    const created: string[] = [];
    (async () => {
      const next: Record<string, string> = {};
      for (const id of photoIds) {
        const blob = await getPhoto(id);
        if (blob) {
          next[id] = URL.createObjectURL(blob);
          created.push(next[id]);
        }
      }
      if (!cancelled) setUrls(next);
    })();
    return () => {
      cancelled = true;
      created.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [photoIds]);

  async function addFiles(files: FileList | null) {
    if (!files?.length) return;
    setError('');
    setBusy(true);
    const ids = [...photoIds];
    try {
      for (const file of Array.from(files)) {
        if (ids.length >= MAX_PHOTOS) break;
        ids.push(await savePhoto(await resizePhoto(file)));
      }
      if (files.length + photoIds.length > MAX_PHOTOS)
        setError(`You can add up to ${MAX_PHOTOS} photos.`);
    } catch {
      setError('That photo could not be added. Try another one.');
    } finally {
      setBusy(false);
      onChange(ids);
    }
  }

  async function remove(id: string) {
    await deletePhoto(id);
    onChange(photoIds.filter((p) => p !== id));
  }

  const full = photoIds.length >= MAX_PHOTOS;

  return (
    <div className="stack">
      <p className="label">Photos</p>
      <h1 className="question" tabIndex={-1} ref={heading}>
        Add photos of injuries or damage
      </h1>
      <p className="hint">
        Optional. Up to {MAX_PHOTOS} photos help responders plan. They stay on this device.
      </p>

      {photoIds.length > 0 && (
        <ul
          className="photos"
          aria-label="Your photos"
          style={{ listStyle: 'none', margin: 0, padding: 0 }}
        >
          {photoIds.map((id, i) => (
            <li className="photo" key={id}>
              {urls[id] && <img src={urls[id]} alt={`Photo ${i + 1}`} />}
              <button
                type="button"
                aria-label={`Remove photo ${i + 1}`}
                onClick={() => void remove(id)}
              >
                <Icon name="x" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {!full && (
        <div className="row" style={{ flexWrap: 'nowrap' }}>
          <label className="photo-add" style={{ flex: 1 }}>
            <Icon name="camera" />
            {busy ? 'Adding…' : 'Take photo'}
            <input
              className="sr-only"
              type="file"
              accept="image/*"
              capture="environment"
              disabled={busy}
              onChange={(e) => {
                void addFiles(e.target.files);
                e.target.value = '';
              }}
            />
          </label>
          <label className="photo-add" style={{ flex: 1 }}>
            <Icon name="plus" />
            Choose photos
            <input
              className="sr-only"
              type="file"
              accept="image/*"
              multiple
              disabled={busy}
              onChange={(e) => {
                void addFiles(e.target.files);
                e.target.value = '';
              }}
            />
          </label>
        </div>
      )}
      {error && (
        <p className="small" role="alert" style={{ color: 'var(--risk-high-ink)' }}>
          {error}
        </p>
      )}

      {photoIds.length === 0 ? (
        <button type="button" className="btn btn--ghost" onClick={onContinue}>
          Skip for now
        </button>
      ) : (
        <button type="button" className="btn btn--ink" onClick={onContinue} disabled={busy}>
          Continue with {photoIds.length} photo{photoIds.length === 1 ? '' : 's'}
        </button>
      )}
    </div>
  );
}
