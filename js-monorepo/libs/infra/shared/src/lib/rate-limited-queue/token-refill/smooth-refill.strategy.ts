import { TokenRefillStrategy } from './token-refill-strategy.interface';

export class SmoothRefillStrategy implements TokenRefillStrategy {
  private tokens: number;
  private lastRefillAt: number;
  private readonly refillRatePerMs: number; // tokens per millisecond

  /**
   * @param maxPerInterval  Maximum tokens (= burst capacity).
   * @param intervalMs      Duration of one full interval in ms.
   *                        e.g. maxPerInterval=50, intervalMs=60_000  →  50 req/min
   */
  constructor(
    private readonly maxPerInterval: number,
    private readonly intervalMs: number,
  ) {
    this.refillRatePerMs = maxPerInterval / intervalMs;
    this.tokens = maxPerInterval; // start full
    this.lastRefillAt = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const gained = (now - this.lastRefillAt) * this.refillRatePerMs;
    this.tokens = Math.min(this.maxPerInterval, this.tokens + gained);
    this.lastRefillAt = now;
  }

  available(): number {
    this.refill();
    return this.tokens;
  }

  consume(): void {
    this.tokens -= 1;
  }

  msUntilNextToken(): number {
    this.refill();
    if (this.tokens >= 1) return 0;
    return Math.ceil((1 - this.tokens) / this.refillRatePerMs);
  }
}
