import { TokenRefillStrategy } from './token-refill/token-refill-strategy.interface';
import { SmoothRefillStrategy } from './token-refill/smooth-refill.strategy';

interface QueueEntry<T> {
  task: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
}

export interface RateLimitedQueueOptions {
  /** Max simultaneous in-flight requests. Default: Infinity */
  concurrency?: number;
  /**
   * Provide a pre-built strategy, OR provide maxPerInterval + intervalMs
   * to use the default SmoothRefillStrategy.
   */
  strategy?: TokenRefillStrategy;
  maxPerInterval?: number;
  intervalMs?: number;
}

export class RateLimitedQueue {
  private readonly concurrency: number;
  private readonly strategy: TokenRefillStrategy;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly queue: QueueEntry<any>[] = [];
  private running = 0;
  private wakeTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(options: RateLimitedQueueOptions) {
    this.concurrency = options.concurrency ?? Infinity;

    if (options.strategy) {
      this.strategy = options.strategy;
    } else if (options.maxPerInterval != null && options.intervalMs != null) {
      this.strategy = new SmoothRefillStrategy(
        options.maxPerInterval,
        options.intervalMs,
      );
    } else {
      throw new Error(
        'RateLimitedQueue: provide either `strategy` or both `maxPerInterval` and `intervalMs`.',
      );
    }
  }

  /** Enqueue a task. Resolves/rejects with whatever the task returns/throws. */
  add<T>(task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this._drain();
    });
  }

  private _drain(): void {
    // Cancel any pending wake-up; we'll reschedule if still needed.
    if (this.wakeTimer !== null) {
      clearTimeout(this.wakeTimer);
      this.wakeTimer = null;
    }

    while (
      this.queue.length > 0 &&
      this.running < this.concurrency &&
      this.strategy.available() >= 1
    ) {
      const entry = this.queue.shift();
      if (!entry) {
        // Should never happen, but we'll handle it just in case.
        continue;
      }
      this.strategy.consume();
      this.running++;

      Promise.resolve()
        .then(() => entry.task())
        .then(entry.resolve, entry.reject)
        .finally(() => {
          this.running--;
          this._drain();
        });
    }

    // If tasks are still waiting, schedule a wake-up when the next token arrives.
    if (this.queue.length > 0 && this.running < this.concurrency) {
      const wait = this.strategy.msUntilNextToken();
      this.wakeTimer = setTimeout(() => {
        this.wakeTimer = null;
        this._drain();
      }, wait);
    }
  }
}
