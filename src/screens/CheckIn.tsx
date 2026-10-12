import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { ProgressBar } from '../components/ProgressBar';
import { APP_NAME } from '../config';
import { QUESTIONS_BY_ID } from '../data/questions';
import { flowSteps, isQuestionStep, progress, type FlowStep } from '../logic/flow';
import { areaRisk } from '../logic/risk';
import { triage } from '../logic/triage';
import {
  clearDraft,
  getCheckIn,
  lastCheckIn,
  loadDraft,
  newCheckIn,
  saveCheckIn,
  saveDraft,
  type Draft,
} from '../store/checkins';
import { enqueue, processOutbox } from '../store/outbox';
import { getSettings, updateSettings } from '../store/settings';
import { notify } from '../pwa/notifications';
import type { CheckIn } from '../types';
import { CachesView } from './CachesView';
import { DoneStep } from './Done';
import { HelpStep } from './Help';
import { LocationStep } from './Location';
import { PhotosStep } from './Photos';
import { QuestionStep } from './Question';
import { ResultStep } from './Result';

/** A new check-in starts fresh but pre-fills location, loved-ones answers and help from the last one. */
async function freshDraft(): Promise<Draft> {
  const last = await lastCheckIn();
  const s = getSettings();
  const loved: Record<string, string> = {};
  if (s.lastLoved.L1) loved.L1 = s.lastLoved.L1;
  if (s.lastLoved.L2) loved.L2 = s.lastLoved.L2;
  const checkIn = newCheckIn({
    location: {
      lat: last?.location.lat,
      lng: last?.location.lng,
      text: last?.location.text || s.lastAddress || undefined,
    },
    answers: loved,
    help: s.lastHelp,
  });
  return { schemaVersion: 1, checkIn, step: 'location', rescueNotified: false };
}

/** Write changes to the saved (completed) record, keeping its current send status unless re-queued. */
async function patchSaved(id: string, patch: Partial<CheckIn>, requeue = false): Promise<void> {
  const saved = await getCheckIn(id);
  if (!saved) return;
  await saveCheckIn({ ...saved, ...patch });
  if (requeue) {
    await enqueue(id);
    void processOutbox();
  }
}

export function CheckInFlow() {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const wantsNew = params.get('new') === '1';
  const loaded = useRef(false);

  useEffect(() => {
    // Load once on mount, and again only when asked for a new check-in (e.g. "Check in now").
    if (loaded.current && !wantsNew) return;
    loaded.current = true;
    (async () => {
      let d = await loadDraft();
      if (!d || (wantsNew && d.checkIn.completedAt)) {
        d = await freshDraft();
        await saveDraft(d);
      }
      setDraft(d);
      if (wantsNew) setParams({}, { replace: true });
    })();
  }, [wantsNew, setParams]);

  /** Apply a change and persist the draft right away so a reload resumes here. */
  const update = useCallback((fn: (d: Draft) => Draft) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const next = fn(prev);
      void saveDraft(next);
      return next;
    });
  }, []);

  if (!draft) {
    return <p className="body">Loading…</p>;
  }

  const { checkIn } = draft;
  const steps = flowSteps(checkIn.answers);
  // A stored step that no longer applies (e.g. a branch closed) falls back to the start.
  const step = steps.includes(draft.step) ? draft.step : 'location';
  const at = steps.indexOf(step);
  const go = (s: FlowStep) => update((d) => ({ ...d, step: s }));
  const next = () => go(steps[at + 1]);
  const back = () => (at <= 0 ? navigate('/') : go(steps[at - 1]));
  const setCheckIn = (patch: Partial<CheckIn>) =>
    update((d) => ({ ...d, checkIn: { ...d.checkIn, ...patch } }));

  /** Called when the last question is answered: compute results, save, queue for sending. */
  async function complete(d: Draft): Promise<Draft> {
    const risk = areaRisk(d.checkIn.answers);
    const completed: CheckIn = {
      ...d.checkIn,
      completedAt: d.checkIn.completedAt ?? new Date().toISOString(),
      color: triage(d.checkIn.answers, d.checkIn.worse),
      risk: risk.level,
      rescueAlert: risk.rescueAlert,
      status: 'queued',
    };
    await saveCheckIn(completed);
    await enqueue(completed.id);
    void processOutbox();
    updateSettings({
      lastAddress: completed.location.text ?? '',
      lastLoved: { L1: completed.answers.L1, L2: completed.answers.L2 },
    });
    let rescueNotified = d.rescueNotified;
    if (risk.rescueAlert && !rescueNotified) {
      rescueNotified = true;
      void notify(
        'Rescue alert sent',
        'Responders have your location and photos for the trapped person.',
        { tone: 'alert', tag: 'rescue', url: '#/checkin', fallbackBanner: false },
      );
    }
    return { ...d, checkIn: completed, step: 'result', rescueNotified };
  }

  async function answer(qid: string, optionId: string) {
    const answers = { ...checkIn.answers, [qid]: optionId };
    const nextSteps = flowSteps(answers);
    const nextStep = nextSteps[nextSteps.indexOf(qid) + 1];
    let d: Draft = { ...draft!, checkIn: { ...checkIn, answers }, step: nextStep };
    if (nextStep === 'result') d = await complete(d);
    update(() => d);
  }

  async function again() {
    await clearDraft();
    const d = await freshDraft();
    await saveDraft(d);
    setDraft(d);
  }

  let body: React.ReactNode;
  if (step === 'location') {
    body = (
      <LocationStep
        location={checkIn.location}
        onChange={(patch) =>
          update((d) => ({
            ...d,
            checkIn: { ...d.checkIn, location: { ...d.checkIn.location, ...patch } },
          }))
        }
        onContinue={next}
      />
    );
  } else if (isQuestionStep(step)) {
    const q = QUESTIONS_BY_ID[step];
    const p = progress(checkIn.answers, step);
    body = (
      <QuestionStep
        question={q}
        selected={checkIn.answers[step]}
        position={`step ${p.index + 1} of ${p.total}`}
        onAnswer={(id) => void answer(step, id)}
      />
    );
  } else if (step === 'photos') {
    body = (
      <PhotosStep
        photoIds={checkIn.photoIds}
        onChange={(photoIds) => setCheckIn({ photoIds })}
        onContinue={next}
      />
    );
  } else if (step === 'result') {
    body = (
      <ResultStep
        checkIn={checkIn}
        onWorse={() => {
          setCheckIn({ worse: true, color: 'red' });
          void patchSaved(checkIn.id, { worse: true, color: 'red' }, true);
        }}
        onContinue={next}
      />
    );
  } else if (step === 'help') {
    body = (
      <HelpStep
        help={checkIn.help}
        onChange={(help) => {
          setCheckIn({ help });
          updateSettings({ lastHelp: help });
          void patchSaved(checkIn.id, { help });
        }}
        onContinue={next}
      />
    );
  } else if (step === 'caches') {
    body = (
      <CachesView
        risk={checkIn.risk ?? 'low'}
        location={checkIn.location}
        bringing={checkIn.bringing}
        onBring={(bringing) => {
          setCheckIn({ bringing });
          void patchSaved(checkIn.id, { bringing });
        }}
        onContinue={next}
      />
    );
  } else {
    body = <DoneStep checkIn={checkIn} onAgain={() => void again()} />;
  }

  const p = progress(checkIn.answers, step);
  const showProgress = at < steps.indexOf('result');

  return (
    <div>
      <div className="flow-top">
        {step !== 'done' && (
          <button type="button" className="back" onClick={back}>
            <Icon name="back" />
            Back
          </button>
        )}
        {showProgress ? (
          <ProgressBar index={p.index} total={p.total} />
        ) : (
          <span className="label">{APP_NAME} check-in</span>
        )}
      </div>
      <div key={step}>{body}</div>
    </div>
  );
}
