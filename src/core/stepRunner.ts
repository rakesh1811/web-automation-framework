import fs from 'fs';
import path from 'path';
import type { Page, TestInfo } from '@playwright/test';
import * as allure from 'allure-js-commons';
import { env } from '../config/env';
import { paths } from '../config/paths';
import { logger, type LogContext } from '../utils/logger';
import { isSensitiveKey, maskValue } from '../utils/mask';
import { firstLine, slugify, stripAnsi } from '../utils/text';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type StepStatus = 'passed' | 'failed';

export interface StepSpec {
  title: string;
  action: string;
  expected: string;
  data?: Record<string, string | number | boolean>;
  component?: string;
}

export class StepRunner {
  private stepNumber = 0;
  private readonly logLines: string[] = [];
  private readonly screenshotDir: string;

  constructor(
    private readonly page: Page,
    private readonly testInfo: TestInfo,
    readonly tcId: string,
  ) {
    this.screenshotDir = path.join(paths.screenshots, tcId, `retry-${testInfo.retry}`);
  }

  async run(spec: StepSpec, body: () => Promise<string>): Promise<void> {
    const number = ++this.stepNumber;
    const context: LogContext = { step: number, component: spec.component };

    await allure.step(`Step ${number}: ${spec.title}`, async (step) => {
      await step.parameter('Action', spec.action);
      if (spec.component) await step.parameter('Page / component', spec.component);
      for (const [key, value] of Object.entries(spec.data ?? {})) {
        const sensitive = isSensitiveKey(key);
        await step.parameter(
          `Test data: ${key}`,
          sensitive ? maskValue() : String(value),
          sensitive ? 'masked' : undefined,
        );
      }
      await step.parameter('Expected', spec.expected);

      this.log('info', `START ${spec.title} | Action: ${spec.action}${this.describeData(spec.data)}`, context);
      const started = Date.now();
      try {
        const actual = await body();
        await step.parameter('Actual', actual);
        await step.parameter('Status', 'PASSED');
        this.log(
          'info',
          `PASSED in ${Date.now() - started} ms | Expected: ${spec.expected} | Actual: ${actual}`,
          context,
        );
        if (env.stepScreenshots) await this.capture(number, spec.title, 'passed');
      } catch (error) {
        const message = error instanceof Error ? stripAnsi(error.message) : String(error);
        await step.parameter('Actual', `FAILED: ${firstLine(message)}`);
        await step.parameter('Status', 'FAILED');
        this.log(
          'error',
          `FAILED after ${Date.now() - started} ms | Expected: ${spec.expected} | Error: ${message}`,
          context,
        );
        if (error instanceof Error && error.stack) {
          await allure.attachment(`Step ${number} error details`, stripAnsi(error.stack), 'text/plain');
        }
        await this.capture(number, spec.title, 'failed');
        throw error;
      }
    });
  }

  async housekeeping<T>(title: string, body: () => Promise<T>): Promise<T> {
    return allure.step(title, async () => {
      this.log('info', title, { component: 'Housekeeping' });
      return body();
    });
  }

  log(level: LogLevel, message: string, context: LogContext = {}): void {
    const fullContext: LogContext = { tcId: this.tcId, retry: this.testInfo.retry, ...context };
    logger.log({ level, message, ...fullContext });
    const step = context.step !== undefined ? ` [Step ${context.step}]` : '';
    this.logLines.push(`${new Date().toISOString()} [${level.toUpperCase()}] [${this.tcId}]${step} ${message}`);
  }

  async finalize(): Promise<void> {
    const { status, expectedStatus, retry } = this.testInfo;
    const passed = status === expectedStatus;
    const finalAttempt = retry >= this.testInfo.project.retries;
    let outcome: string;
    if (passed) outcome = retry === 0 ? 'PASSED on initial attempt' : `PASSED after retry ${retry}`;
    else
      outcome = finalAttempt
        ? `FAILED after exhausting ${retry} retries`
        : `FAILED on attempt ${retry + 1}; will retry`;

    this.log(passed ? 'info' : 'error', `Test finished: ${outcome} (status: ${status}, ${this.testInfo.duration} ms)`);
    await allure.attachment('Execution log', this.logLines.join('\n'), 'text/plain');
  }

  private describeData(data?: StepSpec['data']): string {
    if (!data || Object.keys(data).length === 0) return '';
    const parts = Object.entries(data).map(
      ([key, value]) => `${key}=${isSensitiveKey(key) ? maskValue() : String(value)}`,
    );
    return ` | Data: ${parts.join(', ')}`;
  }

  private async capture(number: number, title: string, status: StepStatus): Promise<void> {
    if (this.page.isClosed()) {
      this.log('warn', `Screenshot skipped: page already closed`, { step: number });
      return;
    }
    try {
      const buffer = await this.page.screenshot({
        animations: 'disabled',
        mask: [this.page.locator('input[type="password"]')],
      });
      fs.mkdirSync(this.screenshotDir, { recursive: true });
      const fileName = `${this.tcId}_retry${this.testInfo.retry}_step${String(number).padStart(2, '0')}_${slugify(title)}_${status}.png`;
      fs.writeFileSync(path.join(this.screenshotDir, fileName), buffer);
      await allure.attachment(`Screenshot - Step ${number} (${status})`, buffer, 'image/png');
      this.log('debug', `Screenshot saved: ${fileName}`, { step: number });
    } catch (error) {
      this.log('warn', `Screenshot capture failed: ${error instanceof Error ? error.message : String(error)}`, {
        step: number,
      });
    }
  }
}
