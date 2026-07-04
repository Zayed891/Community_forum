// Points the app at the Docker Compose "saved_posts_test" database instead
// of dev data, so `npm test` never touches what you're browsing locally.
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/saved_posts_test";
