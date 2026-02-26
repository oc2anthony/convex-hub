import { query } from "./_generated/server";

export const list = query({
  handler: async ({ db }) => {
    return db.query("tasks").collect();
  },
});
