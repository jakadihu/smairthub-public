/**
 * A panel globális "éppen dolgozunk" állapota.
 * A UI és a logika is használhatja.
 */

export const processingState = {
  active: false,
  step: null as string | null,
};

export function startProcessing(step: string) {
  processingState.active = true;
  processingState.step = step;
}

export function stopProcessing() {
  processingState.active = false;
  processingState.step = null;
}
