export interface HubEnvironment {
  production: boolean;
  apiUrl: string;

  // Expense Tracker
  currency: string;
  currencySymbol: string;
  currencyDecimalPlaces: number;

  // IndexedDB
  databaseName: string;
  databaseVersion: number;
  expensesObjStoreName: string;
}
