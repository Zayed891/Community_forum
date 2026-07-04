import { db } from "./client";
import { users, courses, enrollments, posts, savedPosts } from "./schema";

const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);
const hoursAgo = (h: number) => new Date(Date.now() - h * 60 * 60 * 1000);

// Spreads posts out over the last N days (oldest first), except the last
// item in the list which is made "fresh" (a few hours ago) so the feed
// doesn't look abandoned.
function withTimestamps<T>(items: T[]): (T & { createdAt: Date })[] {
  return items.map((item, i) => ({
    ...item,
    createdAt: i === items.length - 1 ? hoursAgo(3) : daysAgo(items.length - i),
  }));
}

export async function seed() {
  await db.delete(savedPosts);
  await db.delete(posts);
  await db.delete(enrollments);
  await db.delete(courses);
  await db.delete(users);

  const [math, history] = await db
    .insert(courses)
    .values([{ name: "Math 101" }, { name: "History 201" }])
    .returning();

  const [alice, bob, carol, mod] = await db
    .insert(users)
    .values([
      { name: "Alice", role: "student" },
      { name: "Bob", role: "student" },
      { name: "Carol", role: "student" },
      { name: "Morgan (mod)", role: "moderator" },
    ])
    .returning();

  // Alice: both courses. Bob: Math only. Carol: History only.
  await db.insert(enrollments).values([
    { userId: alice.id, courseId: math.id },
    { userId: alice.id, courseId: history.id },
    { userId: bob.id, courseId: math.id },
    { userId: carol.id, courseId: history.id },
  ]);

  const mathPosts = [
    { authorId: bob.id, title: "Help with derivatives", body: "Can someone explain the chain rule?" },
    { authorId: alice.id, title: "Study group Thursday?", body: "Anyone free to meet up before the midterm?" },
    { authorId: bob.id, title: "Integration by parts examples", body: "Sharing a few worked examples." },
    { authorId: alice.id, title: "Quick question about limits", body: "Is the limit as x approaches 0 always undefined for 1/x?" },
    { authorId: bob.id, title: "Anyone else confused by related rates?", body: "The ladder-sliding-down-a-wall problem is breaking my brain." },
    { authorId: mod.id, title: "Office hours moved to Friday", body: "This week's office hours are moving from Wednesday to Friday 2-4pm." },
    { authorId: alice.id, title: "Recommended practice problems for the midterm", body: "The textbook's chapter 4 review set was really helpful." },
    { authorId: bob.id, title: "Chain rule vs product rule cheat sheet", body: "Made a quick reference sheet, happy to share if useful." },
    { authorId: alice.id, title: "Optimization problems walkthrough", body: "Went through the classic 'minimize the fence' problem step by step." },
    { authorId: bob.id, title: "Implicit differentiation help", body: "Stuck on differentiating x^2 + y^2 = 25 with respect to x." },
    { authorId: alice.id, title: "Series and sequences resources", body: "Found a good video series on convergence tests." },
    { authorId: bob.id, title: "Struggling with epsilon-delta proofs", body: "Does anyone have a simpler way to think about these?" },
    { authorId: mod.id, title: "Calculators allowed on the exam", body: "Graphing calculators are fine, phones are not." },
    { authorId: bob.id, title: "L'Hopital's rule examples", body: "When exactly can we apply this vs just factoring?" },
    { authorId: alice.id, title: "Partial fractions practice", body: "These are finally starting to click for me." },
    { authorId: bob.id, title: "Riemann sums explained simply", body: "Thinking of it as stacking rectangles really helped." },
    { authorId: mod.id, title: "Extra credit assignment posted", body: "Check the course page for the optional proof-writing assignment." },
    { authorId: alice.id, title: "Volume of revolution problems", body: "Disk method vs shell method - when do you pick which?" },
    { authorId: bob.id, title: "Taylor series intuition", body: "Any good analogies for why these approximations work?" },
    { authorId: alice.id, title: "Final exam study guide", body: "Compiled a summary of every topic we've covered this semester." },
  ];

  const historyPosts = [
    { authorId: carol.id, title: "Essay question thoughts", body: "What's everyone's take on question 3?" },
    { authorId: alice.id, title: "Primary source links", body: "Found some useful archives for the essay." },
    { authorId: carol.id, title: "Discussion on causes of WWI", body: "Which factor do you think mattered most - alliances or nationalism?" },
    { authorId: alice.id, title: "Reading response for chapter 5", body: "Curious what others thought about the author's argument." },
    { authorId: mod.id, title: "Office hours canceled this week", body: "I'm out at a conference - email me if it's urgent." },
    { authorId: carol.id, title: "Thoughts on the assigned documentary", body: "The pacing was slow but the interviews were worth it." },
    { authorId: alice.id, title: "Timeline project group sign-up", body: "Still need two more people for the 1920s group." },
    { authorId: carol.id, title: "Debate prep for next class", body: "Anyone want to run through arguments together beforehand?" },
    { authorId: alice.id, title: "Map exercise questions", body: "Are we labeling borders as they were in 1914 or today?" },
    { authorId: carol.id, title: "Book recommendation for further reading", body: "This one covers the same period from a different angle." },
    { authorId: mod.id, title: "Midterm review session", body: "Scheduled for next Tuesday in the usual room." },
    { authorId: alice.id, title: "Comparing historiographies", body: "It's interesting how differently these two authors frame the same event." },
    { authorId: carol.id, title: "Citation format reminder", body: "Make sure footnotes follow Chicago style, not APA." },
    { authorId: alice.id, title: "Guest lecture notes", body: "Sharing my notes from Tuesday's guest speaker in case anyone missed it." },
    { authorId: carol.id, title: "Final paper topic ideas", body: "Thinking about comparing propaganda techniques across two countries." },
  ];

  const insertedPosts = await db
    .insert(posts)
    .values([
      ...withTimestamps(mathPosts).map((p) => ({ ...p, courseId: math.id })),
      ...withTimestamps(historyPosts).map((p) => ({ ...p, courseId: history.id })),
    ])
    .returning();

  const derivatives = insertedPosts.find((p) => p.title === "Help with derivatives")!;
  const studyGroup = insertedPosts.find((p) => p.title === "Study group Thursday?")!;
  const essayQuestion = insertedPosts.find((p) => p.title === "Essay question thoughts")!;

  // A couple of pre-existing saves so the app doesn't start completely empty.
  await db.insert(savedPosts).values([
    { userId: alice.id, postId: derivatives.id, isActive: true },
    { userId: alice.id, postId: studyGroup.id, isActive: true },
    { userId: bob.id, postId: derivatives.id, isActive: true },
    { userId: carol.id, postId: essayQuestion.id, isActive: true },
  ]);

  return { math, history, alice, bob, carol, mod, posts: insertedPosts };
}
