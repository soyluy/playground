export function getMongoUrl(): string {
  const url = process.env.MONGODB_URL;
  if (!url) {
    throw new Error('MONGODB_URL is not set');
  }
  return url;
}
