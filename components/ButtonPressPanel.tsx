"use client";

import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { useCallback, useEffect, useMemo, useState } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL must be provided to interact with Convex");
}

const convexClient = new ConvexHttpClient(convexUrl);

type SummaryEntry = {
  id: string;
  pressedAt: string | null;
  createdAt: string | null;
};

type Summary = {
  total: number;
  entries: SummaryEntry[];
};

const formatTimestamp = (timestamp: string | null) =>
  timestamp ? new Date(timestamp).toLocaleString() : "just now";

export default function ButtonPressPanel() {
  const [summary, setSummary] = useState<Summary>({ total: 0, entries: [] });
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const result = await convexClient.query(api.buttonPresses.summary);
      setSummary(result);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const recordPress = useCallback(async () => {
    setRefreshing(true);
    try {
      await convexClient.mutation(api.buttonPresses.press);
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  const recent = useMemo(() => summary.entries.slice(0, 4), [summary.entries]);

  return (
    <section className="space-y-4 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-800/60 p-8 shadow-2xl shadow-black/60">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Live button press tally</p>
          <h2 className="text-3xl font-semibold text-white">Count of button presses</h2>
        </div>
        <div className="flex items-baseline gap-3">
          <p className="text-sm text-slate-400">Total</p>
          <span className="rounded-full bg-gradient-to-r from-emerald-400 to-cyan-300 px-4 py-1 text-lg font-semibold text-slate-950">
            {summary.total}
          </span>
        </div>
      </header>
      <div className="grid gap-5 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-3 rounded-2xl border border-white/5 bg-white/5 p-6">
          <p className="text-sm text-slate-300">
            Each press writes a document into the <code className="rounded bg-slate-900 px-1 py-0.5 text-xs uppercase tracking-[0.35em] text-slate-200">buttonPresses</code> table
            and immediately updates this tally using Convex.
          </p>
          <button
            type="button"
            onClick={recordPress}
            disabled={refreshing}
            className="inline-flex items-center justify-center rounded-2xl bg-white/90 px-5 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-950 transition hover:-translate-y-0.5"
          >
            {refreshing ? "Recording..." : "Record press"}
          </button>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-5 text-sm text-slate-300">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Last presses</p>
          <ul className="mt-4 space-y-3">
            {recent.length === 0 ? (
              <li className="text-slate-500">No presses recorded yet.</li>
            ) : (
              recent.map((entry) => (
                <li key={entry.id} className="flex items-center justify-between">
                  <span>{formatTimestamp(entry.pressedAt ?? entry.createdAt)}</span>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-emerald-300">
                    {entry.pressedAt ? "manual" : "auto"}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
