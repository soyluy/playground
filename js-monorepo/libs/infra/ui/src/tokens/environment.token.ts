import { InjectionToken } from '@angular/core';
import { HubEnvironment } from '../types/environment.interface';

export const ENVIRONMENT = new InjectionToken<HubEnvironment>('ENVIRONMENT');

export const provideEnvironment = (environment: HubEnvironment) => {
  return {
    provide: ENVIRONMENT,
    useValue: environment,
  };
};
