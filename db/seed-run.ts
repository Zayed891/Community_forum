import { seed } from "./seed";

async function main() {
  const result = await seed();
  console.log("Seeded:", {
    courses: [result.math, result.history],
    users: [result.alice, result.bob, result.carol, result.mod],
    posts: result.posts.length,
  });
  // The pg Pool keeps a connection open otherwise, and the script never exits.
  process.exit(0);
}

main();
