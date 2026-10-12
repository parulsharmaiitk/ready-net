import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { getCheckIn, newCheckIn, saveCheckIn } from './checkins';
import { clearAllStores } from './db';
import { enqueue, outboxIds, processOutbox } from './outbox';

describe('outbox', () => {
  beforeEach(async () => {
    await clearAllStores();
  });

  it('keeps check-ins queued while offline', async () => {
    const c = newCheckIn();
    await saveCheckIn(c);
    await enqueue(c.id);
    await processOutbox(() => false);
    expect((await getCheckIn(c.id))?.status).toBe('queued');
    expect(await outboxIds()).toEqual([c.id]);
  });

  it('marks queued check-ins sent after a delay once online', async () => {
    const c = newCheckIn();
    await saveCheckIn(c);
    await enqueue(c.id);
    const done = processOutbox(() => true, 50);
    expect((await getCheckIn(c.id))?.status).toBe('queued');
    await done;
    expect((await getCheckIn(c.id))?.status).toBe('sent');
    expect(await outboxIds()).toEqual([]);
  });
});
