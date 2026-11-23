/**
 * Generic Optimistic UI Update Helper with Snapshot Rollback.
 * Allows instant UI transitions without waiting for network/database round trips.
 */

export interface OptimisticActionOptions<T> {
  current: T;
  optimistic: (prev: T) => T;
  applyState: (next: T) => void;
  mutation: () => Promise<any>;
  onSuccess?: (result: any) => void;
  onError?: (error: any) => void;
}

export async function executeOptimisticAction<T>(
  options: OptimisticActionOptions<T>
): Promise<boolean> {
  const { current, optimistic, applyState, mutation, onSuccess, onError } = options;

  // 1. Capture snapshot and apply optimistic update immediately
  const snapshot = current;
  const optimisticState = optimistic(current);
  applyState(optimisticState);

  // 2. Perform background server mutation
  try {
    const result = await mutation();
    if (onSuccess) onSuccess(result);
    return true;
  } catch (err: any) {
    // 3. Rollback immediately to prior snapshot on failure
    applyState(snapshot);
    if (onError) onError(err);
    return false;
  }
}
