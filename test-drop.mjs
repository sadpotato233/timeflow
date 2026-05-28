// test-drop.mjs - Test if placeTask updates the calendar view
import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Listen for console messages
  page.on('console', msg => console.log('  [browser console]', msg.text()));
  
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
  
  // Wait for React to mount
  await page.waitForTimeout(2000);
  
  // Check initial state
  const toolbarText = await page.textContent('h1');
  console.log('Toolbar:', toolbarText);
  
  // Check initial DayView
  const slotsCount = await page.evaluate(() => {
    const slots = document.querySelectorAll('[data-slot]');
    return slots.length;
  });
  console.log('Initial visible slots:', slotsCount);
  
  // Create a test task and place it via store
  const result = await page.evaluate(async () => {
    try {
      // Access Zustand stores from window
      const { useTaskStore } = await import('/src/stores/taskStore.ts');
      const { useCalendarStore } = await import('/src/stores/calendarStore.ts');
      
      const task = await useTaskStore.getState().addTask({
        name: 'TEST - Auto created',
        estimatedMinutes: 30,
        tags: [],
        deadline: null,
        parentId: null,
      });
      
      const today = new Date().toISOString().slice(0, 10);
      await useCalendarStore.getState().placeTask(task.id, today, '14:00', 30);
      
      return { taskId: task.id, slots: useCalendarStore.getState().slots.length };
    } catch (e) {
      return { error: e.message };
    }
  });
  
  console.log('placeTask result:', result);
  
  // Wait for React to re-render
  await page.waitForTimeout(1000);
  
  // Check toolbar again
  const toolbarText2 = await page.textContent('h1');
  console.log('Toolbar after drop:', toolbarText2);
  
  // Check DayView for rendered slots
  const slotsAfter = await page.evaluate(() => {
    const slots = document.querySelectorAll('[data-slot]');
    return slots.length;
  });
  console.log('Slots after placeTask:', slotsAfter);
  
  // Screenshot
  await page.screenshot({ path: 'test-result.png', fullPage: true });
  console.log('Screenshot saved to test-result.png');
  
  await browser.close();
})().catch(e => {
  console.error('Test failed:', e.message);
  process.exit(1);
});