// Dev environment
import { HubEnvironment } from '@hub/ui-infra';

export const environment: HubEnvironment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',

  // Currency Display
  currency: 'TRY',
  currencySymbol: '₺',
  currencyDecimalPlaces: 2,

  // IndexedDB
  databaseName: 'expense-tracker',
  databaseVersion: 1,
  expensesObjStoreName: 'expenses',
};
