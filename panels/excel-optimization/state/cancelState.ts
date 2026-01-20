/**
 * Egyszerű globális cancel flag a panelen belül.
 * A validateBatch és más hosszú folyamatok ezt figyelik.
 */

export const cancelFlag = {
  active: false,
};

export function cancelProcessing() {
  cancelFlag.active = true;
}

export function resetCancel() {
  cancelFlag.active = false;
}
