-- Runs once, on first container init. Creates a second database for tests
-- so `npm test` never touches dev data.
CREATE DATABASE saved_posts_test;
