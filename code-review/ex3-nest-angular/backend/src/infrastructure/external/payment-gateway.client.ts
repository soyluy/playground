import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

type PaymentIntentInput = {
  amount: number;
  currency: string;
  reference: string;
};

type ChargeInput = {
  paymentIntentId: string;
  amount: number;
};

type RefundInput = {
  paymentIntentId: string;
  amount: number;
  reason?: string;
};

type MockPaymentStatus = 'requires_payment_method' | 'processing' | 'succeeded' | 'failed';

@Injectable()
export class PaymentGatewayClient {
  private readonly _statusByIntent = new Map<string, MockPaymentStatus>();

  async createPaymentIntent(input: PaymentIntentInput): Promise<{
    id: string;
    clientSecret: string;
    status: MockPaymentStatus;
  }> {
    await this.simulateDelay(120, 260);
    this.assertAmount(input.amount);

    const id = `pi_${randomUUID()}`;
    this._statusByIntent.set(id, 'requires_payment_method');

    return {
      id,
      clientSecret: `${id}_secret_${randomUUID().slice(0, 10)}`,
      status: 'requires_payment_method',
    };
  }

  async charge(input: ChargeInput): Promise<{ status: 'succeeded' | 'failed' }> {
    await this.simulateDelay(180, 500);
    this.assertAmount(input.amount);

    const shouldTimeout = Math.random() < 0.04;
    if (shouldTimeout) {
      await this.simulateDelay(2000, 3500);
      return { status: 'failed' };
    }

    const shouldFail = Math.random() < 0.12;
    const status: MockPaymentStatus = shouldFail ? 'failed' : 'succeeded';
    this._statusByIntent.set(input.paymentIntentId, status);
    return { status: shouldFail ? 'failed' : 'succeeded' };
  }

  async refund(input: RefundInput): Promise<{ status: 'succeeded' | 'failed' }> {
    await this.simulateDelay(120, 320);
    this.assertAmount(input.amount);

    const existing = this._statusByIntent.get(input.paymentIntentId);
    if (!existing || existing === 'failed') {
      return { status: 'failed' };
    }

    const shouldFail = Math.random() < 0.08;
    if (!shouldFail) {
      this._statusByIntent.set(input.paymentIntentId, 'failed');
    }

    return { status: shouldFail ? 'failed' : 'succeeded' };
  }

  async getStatus(paymentIntentId: string): Promise<{ status: MockPaymentStatus }> {
    await this.simulateDelay(60, 180);
    return { status: this._statusByIntent.get(paymentIntentId) ?? 'failed' };
  }

  private assertAmount(amount: number): void {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error('Invalid amount');
    }
  }

  private async simulateDelay(minMs: number, maxMs: number): Promise<void> {
    const timeout = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
    await new Promise((resolve) => setTimeout(resolve, timeout));
  }
}
