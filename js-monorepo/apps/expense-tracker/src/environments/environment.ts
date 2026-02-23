export const environment = {
  production: false,

  // Currency Display
  currency: 'TRY',
  currencySymbol: '₺',
  currencyDecimalPlaces: 2,

  // Database
  databaseName: 'expense-tracker',
  databaseVersion: 1,
  databaseStores: [
    {
      name: 'transactions',
      keys: ['id', 'description', 'amount', 'type', 'category', 'date'],
    },
  ],

  // Object Stores
  expensesObjStoreName: 'expenses',
};
