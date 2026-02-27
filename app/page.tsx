import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import ButtonPressPanel from "@/components/ButtonPressPanel";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL must be set to connect to Convex");
}

const convexClient = new ConvexHttpClient(convexUrl);

type Task = {
  _id: string;
  text: string;
  isCompleted: boolean;
  createdAt?: string;
};

async function loadTasks(): Promise<Task[]> {
  const result = await convexClient.query(api.tasks.list);
  return result as Task[];
}

export default async function Home() {
  const tasks = await loadTasks();
  const total = tasks.length;
  const completed = tasks.filter((task) => task.isCompleted).length;
  const queued = total - completed;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12">
        <header className="flex flex-col gap-6 rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900 to-slate-800/70 p-8 shadow-2xl shadow-slate-900/60">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Convex + Next.js</p>
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Convex Hub &mdash; live tasks
              </h1>
              <p className="mt-2 text-lg text-slate-400">
                Every source of truth lives in Convex. This dashboard queries the
                tasks table directly at render time, so the UI stays in sync with
                the database without any manual syncing.
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-right text-sm text-slate-300">
              <span>Team deployment:</span>
              <span className="text-xs uppercase tracking-[0.4em] text-emerald-300">
                convex-hub · prod
              </span>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <article className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Total entries</p>
              <p className="text-3xl font-semibold text-white">{total}</p>
            </article>
            <article className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-5">
              <p className="text-xs uppercase tracking-[0.4em] text-sky-200">Completed</p>
              <p className="text-3xl font-semibold text-white">{completed}</p>
            </article>
            <article className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
              <p className="text-xs uppercase tracking-[0.4em] text-amber-200">In flight</p>
              <p className="text-3xl font-semibold text-white">{queued}</p>
            </article>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-4 rounded-3xl border border-white/5 bg-slate-900/70 p-6 shadow-xl shadow-black/40">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Task list</h2>
              <p className="text-sm text-slate-400">
                Sourced live from Convex. Push a new row to trigger an auto-deploy.
              </p>
            </div>
            <div className="space-y-4">
              {tasks.map((task) => (
                <article key={task._id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div>
                    <p className="text-base font-semibold text-white">{task.text}</p>
                    <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                      {task.isCompleted ? "complete" : "pending"}
                    </p>
                  </div>
                  <div className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-slate-200">
                    {task.isCompleted ? "Done" : "Waiting"}
                  </div>
                </article>
              ))}
            </div>
          </div>
          <div className="space-y-4 rounded-3xl border border-white/5 bg-gradient-to-b from-slate-900/70 to-slate-800/70 p-6 shadow-lg shadow-black">
            <h3 className="text-lg font-semibold text-white">How it works</h3>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex gap-3">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400"></span>
                Convex exposes a query function (`api.tasks.list`) that reads straight from the
                `tasks` table.
              </li>
              <li className="flex gap-3">
                <span className="inline-block h-2 w-2 rounded-full bg-cyan-400"></span>
                The Next.js page instantiates `ConvexHttpClient` in the Server Component and
                calls that query at render time.
              </li>
              <li className="flex gap-3">
                <span className="inline-block h-2 w-2 rounded-full bg-amber-400"></span>
                Pushing commits to GitHub triggers Vercel auto-deploys because the project is linked and
                the GitHub integration is active.
              </li>
            </ul>
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-sm text-slate-400">
              <p>The Convex access token is injected via <code className="rounded bg-slate-800 px-1 py-0.5">CONVEX_ACCESS_TOKEN</code>, and
              Vercel reads <code className="rounded bg-slate-800 px-1 py-0.5">NEXT_PUBLIC_CONVEX_URL</code> when building.</p>
            </div>
          </div>
        </section>
        <ButtonPressPanel />
      </main>
    </div>
  );
}
