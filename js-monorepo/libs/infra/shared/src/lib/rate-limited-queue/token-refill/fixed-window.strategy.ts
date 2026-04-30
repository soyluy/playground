import { TokenRefillStrategy } from './token-refill-strategy.interface';

export class FixedWindowRefillStrategy implements TokenRefillStrategy {
  private tokens: number;
  private windowStart: number;

  constructor(
    private readonly maxPerInterval: number,
    private readonly intervalMs: number,
  ) {
    this.tokens = maxPerInterval;
    this.windowStart = Date.now();
  }

  private maybeReset(): void {
    const now = Date.now();
    if (now - this.windowStart >= this.intervalMs) {
      this.tokens = this.maxPerInterval;
      this.windowStart = now;
    }
  }

  available(): number {
    this.maybeReset();
    return this.tokens;
  }

  consume(): void {
    this.tokens -= 1;
  }

  msUntilNextToken(): number {
    this.maybeReset();
    if (this.tokens >= 1) return 0;
    return this.intervalMs - (Date.now() - this.windowStart);
  }
}
