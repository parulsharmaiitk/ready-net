import { expect, test, type Page } from '@playwright/test';

async function answer(page: Page, question: string, option: string) {
  await expect(page.getByRole('heading', { level: 1, name: question })).toBeFocused();
  await page.getByRole('button', { name: option, exact: true }).click();
}

test('full check-in: injured, bleeding arm, someone trapped', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Are you safe?' })).toBeVisible();
  await page.getByRole('link', { name: 'Check in now' }).click();

  // Location
  await expect(page.getByRole('main').getByText('GPS location found')).toBeVisible();
  await expect(page.getByRole('main').getByText('37.775, -122.419')).toBeVisible();
  await page.getByLabel('Address or landmark').fill('Corner of 5th and Main');
  await page.getByRole('button', { name: 'Continue' }).click();

  // About you
  await answer(page, 'Are you injured?', 'Yes, but it can wait');
  await answer(page, 'Can you walk on your own?', 'Yes');
  await answer(page, 'Any trouble breathing, chest pain or heavy bleeding?', 'Yes');

  // Reload mid check-in resumes at the same question.
  await page.reload();
  await answer(page, 'Do you have safe water and food for the next 24 hours?', 'Yes');
  await answer(
    page,
    "Do you or someone with you need medicine, oxygen or care you don't have?",
    'No',
  );

  // Bleeding
  await answer(page, 'Where is the bleeding?', 'Arm or leg');
  await answer(page, 'What does the bleeding look like?', 'Spurting or pulsing');
  await answer(page, 'Does it slow down when you press firmly on it?', 'Yes, it slows or stops');
  await answer(page, 'Is something stuck in the wound?', 'No');

  // Injury
  await answer(page, 'Is the injured person awake and able to talk normally?', 'Yes');
  await answer(page, 'Are they pale, cold, sweaty or breathing fast?', 'No');
  await answer(page, 'Do you think a bone is broken?', 'No');
  await answer(page, 'Is there a burn?', 'No');

  // Surroundings
  await answer(page, 'Is anyone trapped near you?', 'Yes');
  for (const q of [
    'Do you see fire or smoke, or smell gas?',
    'Are buildings near you collapsed or badly cracked?',
    'Is there flooding or rising water?',
    'Are power lines down or is the power out?',
    'Are roads near you blocked or impassable?',
  ]) {
    await answer(page, q, 'No');
  }

  // Photos
  await page.getByRole('button', { name: 'Skip for now' }).click();

  // Loved ones
  await answer(page, 'Do you want your loved ones to know your condition?', 'Yes');
  await answer(page, 'Do you want your loved ones to know your location?', 'No');

  // Result
  await expect(page.getByRole('main').getByText('Rescue alert sent.')).toBeVisible();
  await expect(page.locator('.triage__word')).toHaveText('Red');
  await expect(page.getByRole('main').getByText('Seriously injured')).toBeVisible();
  await expect(page.locator('.tile--high')).toContainText('High');
  await expect(page.getByRole('main').getByText('Status shared')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Arm or leg still bleeding?' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();

  // Help
  await page.getByRole('button', { name: 'Yes', exact: true }).click();
  await expect(page.getByRole('main').getByText('Optional: get a blue card.')).toBeVisible();
  await page.getByRole('button', { name: 'First aid / CPR' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();

  // Caches
  await expect(page.getByRole('main').getByText('Closed — high-risk zone')).toBeVisible();
  await page
    .getByRole('group', { name: 'Supplies you can bring' })
    .getByRole('button', { name: 'Water' })
    .click();
  await page
    .getByRole('group', { name: 'Supplies you can bring' })
    .getByRole('button', { name: 'Blankets' })
    .click();
  await page.getByRole('button', { name: 'Bring 2 items' }).click();
  await expect(page.getByRole('main').getByText("I'm bringing 2 items")).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();

  // Done
  await expect(page.getByRole('heading', { name: 'Checked in' })).toBeVisible();
  await expect(page.getByRole('main').getByText('Sent', { exact: true })).toBeVisible({
    timeout: 5000,
  });
  await expect(page.locator('.summary')).toContainText('Water, Blankets');
  await expect(page.locator('.summary')).toContainText('Yes — First aid / CPR');
});

test('not injured, all clear gives White and every cache open', async ({ page }) => {
  await page.goto('/#/checkin?new=1');
  await page.getByRole('button', { name: 'Continue' }).click();
  await answer(page, 'Are you injured?', 'No');
  await answer(page, 'Can you walk on your own?', 'Yes');
  await answer(page, 'Any trouble breathing, chest pain or heavy bleeding?', 'No');
  await answer(page, 'Do you have safe water and food for the next 24 hours?', 'Yes');
  await answer(
    page,
    "Do you or someone with you need medicine, oxygen or care you don't have?",
    'No',
  );
  for (const q of [
    'Is anyone trapped near you?',
    'Do you see fire or smoke, or smell gas?',
    'Are buildings near you collapsed or badly cracked?',
    'Is there flooding or rising water?',
    'Are power lines down or is the power out?',
    'Are roads near you blocked or impassable?',
  ]) {
    await answer(page, q, 'No');
  }
  await page.getByRole('button', { name: 'Skip for now' }).click();
  await answer(page, 'Do you want your loved ones to know your condition?', 'No');
  await answer(page, 'Do you want your loved ones to know your location?', 'No');
  await expect(page.locator('.triage__word')).toHaveText('White');
  await expect(page.getByRole('main').getByText('Notified you checked in')).toBeVisible();
  await expect(page.getByRole('button', { name: /getting worse/ })).toHaveCount(0);
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Not right now' }).click();
  await expect(page.getByRole('main').getByText('Closed — high-risk zone')).toHaveCount(0);
});

test('offline completion shows Saved, then Sent after reconnecting', async ({ page, context }) => {
  await page.goto('/');
  // Let the service worker take control so the app keeps working offline.
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await context.setOffline(true);
  await page.getByRole('link', { name: 'Check in now' }).click();
  await page.getByLabel('Address or landmark').fill('Library steps');
  await page.getByRole('button', { name: 'Continue' }).click();
  await answer(page, 'Are you injured?', 'No');
  for (const opt of ['Yes', 'No', 'Yes', 'No']) {
    await page.getByRole('button', { name: opt, exact: true }).click();
  }
  for (let i = 0; i < 6; i++) await page.getByRole('button', { name: 'No', exact: true }).click();
  await page.getByRole('button', { name: 'Skip for now' }).click();
  await page.getByRole('button', { name: 'Yes', exact: true }).click();
  await page.getByRole('button', { name: 'Yes', exact: true }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Not right now' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('main').getByText('Saved — will send when online')).toBeVisible();
  await context.setOffline(false);
  await expect(page.getByRole('main').getByText('Sent', { exact: true })).toBeVisible({
    timeout: 5000,
  });
});

test('loved ones demo: add, verify, simulated check-in', async ({ page }) => {
  await page.goto('/#/loved');
  await page.getByRole('button', { name: 'Add loved one' }).click();
  await page.getByLabel('Name').fill('Sam Rivera');
  await page.getByLabel('Phone or email').fill('+1 555 0142');
  await page.getByRole('button', { name: 'Send invite' }).click();
  await expect(
    page.getByRole('main').getByText('Waiting for them to verify', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: /Simulate: they verified/ }).click();
  await expect(page.getByRole('main').getByText('Linked', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: /Simulate: Sam checked in/ }).click();
  await expect(page.getByRole('main').getByText(/Checked in ·/)).toBeVisible();
});
