export interface TokenRefillStrategy {
  /** How many tokens are currently available (may update internal state). */
  available(): number;
  /** Deduct one token. Called only after available() confirmed >= 1. */
  consume(): void;
  /** How many ms until at least one token will be available. */
  msUntilNextToken(): number;
}
