/**
 * A batch feldolgozás állapota.
 * A validateBatch és a UI is használja.
 */

export const batchProgressState = {
  current: 0,
  total: 0,
};

export function resetBatchProgress(total: number) {
  batchProgressState.current = 0;
  batchProgressState.total = total;
}

export function incrementBatchProgress() {
  batchProgressState.current++;
}

export function getBatchPercent() {
  if (batchProgressState.total === 0) return 0;
  return Math.round(
    (batchProgressState.current / batchProgressState.total) * 100
  );
}
