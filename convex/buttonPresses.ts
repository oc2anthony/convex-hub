import { mutation, query } from "./_generated/server";

export const press = mutation({
  handler: async ({ db }) => {
    await db.insert("buttonPresses", {
      pressedAt: new Date().toISOString(),
    });
    return null;
  },
});

export const summary = query({
  handler: async ({ db }) => {
    const presses = await db.query("buttonPresses").collect();
    const entries = presses
      .slice(-5)
      .reverse()
      .map((press) => {
        const createdAt = press._createdAt;
        const createdAtString =
          createdAt instanceof Date ? createdAt.toISOString() : null;
        return {
          id: String(press._id),
          pressedAt: press.pressedAt ?? null,
          createdAt: createdAtString,
        };
      });
    return {
      total: presses.length,
      entries,
    };
  },
});
