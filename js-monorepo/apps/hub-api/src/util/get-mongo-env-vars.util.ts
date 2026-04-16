export function getMongoUrl(): string {
  const url = process.env.MONGODB_URL;
  if (!url) {
    throw new Error('MONGODB_URL is not set');
  }
  return url;
}

export function getMongoDbName(): string {
  const dbName = process.env.MONGODB_DB_NAME;
  if (!dbName) {
    throw new Error('MONGODB_DB_NAME is not set');
  }
  return dbName;
}
