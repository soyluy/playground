import { Injectable, Logger } from '@nestjs/common';

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

@Injectable()
export class EmailClient {
  private readonly _logger = new Logger(EmailClient.name);

  async sendEmail(payload: EmailPayload): Promise<{ accepted: boolean }> {
    await this.simulateLatency();
    this._logger.log(`Sending email to=${payload.to} subject="${payload.subject}"`);
    return { accepted: true };
  }

  async sendBulkEmail(
    recipients: string[],
    subject: string,
    html: string,
    text?: string,
  ): Promise<{ accepted: number; rejected: number }> {
    let accepted = 0;
    let rejected = 0;

    for (const to of recipients) {
      try {
        const result = await this.sendEmail({ to, subject, html, text });
        if (result.accepted) {
          accepted += 1;
        } else {
          rejected += 1;
        }
      } catch {
        rejected += 1;
      }
    }

    return { accepted, rejected };
  }

  async sendTemplatedEmail(input: {
    to: string;
    template: string;
    subject: string;
    variables: Record<string, string | number>;
  }): Promise<{ accepted: boolean }> {
    let html = input.template;
    for (const [key, value] of Object.entries(input.variables)) {
      html = html.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), String(value));
    }

    return this.sendEmail({
      to: input.to,
      subject: input.subject,
      html,
    });
  }

  private async simulateLatency(): Promise<void> {
    const timeout = Math.floor(Math.random() * 60) + 40;
    await new Promise((resolve) => setTimeout(resolve, timeout));
  }
}
