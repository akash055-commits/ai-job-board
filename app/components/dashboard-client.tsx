"use client";

import { useDeferredValue, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ApplicationStatus, APPLICATION_STATUSES, RoleType } from "@/lib/domain";
import type { DashboardJob } from "@/lib/types";

const statusOptions = APPLICATION_STATUSES;

const sourceLabels: Record<string, string> = {
  SERPAPI: "Google Jobs",
  LINKEDIN: "LinkedIn",
  INDEED: "Indeed",
  NAUKRI: "Naukri",
  INSTAHYRE: "Instahyre",
  WELLFOUND: "Wellfound",
  COMPANY_PAGE: "Company Page"
};

const roleLabels: Record<RoleType, string> = {
  GROWTH: "Growth",
  PRODUCT: "Product",
  MARKETING: "Marketing",
  FOUNDERS_OFFICE: "Founder's Office",
  OPERATIONS: "Operations",
  OTHER: "Other"
};

function formatStatus(value: ApplicationStatus) {
  return value
    .toLowerCase()
    .split("_")
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

function statusClasses(status: ApplicationStatus) {
  if (status === ApplicationStatus.APPLIED) {
    return "border-emerald-300 bg-emerald-50 text-emerald-700";
  }

  if (status === ApplicationStatus.SAVED) {
    return "border-amber-300 bg-amber-50 text-amber-700";
  }

  if (status === ApplicationStatus.REJECTED) {
    return "border-slate-300 bg-slate-100 text-slate-500";
  }

  return "border-yellow-300 bg-yellow-50 text-yellow-700";
}

async function updateStatus(jobId: string, status: ApplicationStatus) {
  const response = await fetch(`/api/jobs/${jobId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ status })
  });

  if (!response.ok) {
    throw new Error("Unable to update job status");
  }
}

export function DashboardClient({ initialJobs }: { initialJobs: DashboardJob[] }) {
  const router = useRouter();
  const [jobs, setJobs] = useState(initialJobs);
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("ALL");
  const [roleType, setRoleType] = useState("ALL");
  const [location, setLocation] = useState("ALL");
  const [scoreFloor, setScoreFloor] = useState("0");
  const [status, setStatus] = useState("ALL");
  const [isRefreshing, startRefresh] = useTransition();
  const [isUpdating, startUpdate] = useTransition();
  const deferredSearch = useDeferredValue(search);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const haystack = `${job.title} ${job.company} ${job.description} ${job.reasoning}`.toLowerCase();
      const locationMatch = location === "ALL" || (job.location ?? "Unknown") === location;
      const sourceMatch = source === "ALL" || job.source === source;
      const roleMatch = roleType === "ALL" || job.roleType === roleType;
      const statusMatch = status === "ALL" || job.status === status;
      const scoreMatch = job.matchScore >= Number(scoreFloor);
      const searchMatch = !deferredSearch || haystack.includes(deferredSearch.toLowerCase());

      return locationMatch && sourceMatch && roleMatch && statusMatch && scoreMatch && searchMatch;
    });
  }, [deferredSearch, jobs, location, roleType, scoreFloor, source, status]);

  const locations = Array.from(new Set(jobs.map((job) => job.location ?? "Unknown")));

  const topMatches = filteredJobs.filter((job) => job.topMatch).slice(0, 3);
  const applyFirst = [...filteredJobs]
    .filter((job) => job.status === ApplicationStatus.NOT_APPLIED && job.matchScore >= 80)
    .slice(0, 4);
  const lowEffortHighFit = filteredJobs.filter((job) => job.lowEffortHighFit).slice(0, 3);

  const stats = {
    total: filteredJobs.length,
    applied: filteredJobs.filter((job) => job.status === ApplicationStatus.APPLIED).length,
    saved: filteredJobs.filter((job) => job.status === ApplicationStatus.SAVED).length,
    avgScore:
      filteredJobs.length > 0
        ? Math.round(filteredJobs.reduce((sum, job) => sum + job.matchScore, 0) / filteredJobs.length)
        : 0
  };

  return (
    <main className="grid-shell min-h-screen px-5 py-8 md:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="panel relative overflow-hidden rounded-[32px] px-6 py-7 md:px-8">
          <div className="absolute inset-y-0 right-0 w-72 bg-gradient-to-l from-mint/60 to-transparent" />
          <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className="font-mono text-xs uppercase tracking-[0.32em] text-teal">
                Personal AI Job Board
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
                Growth, product, and high-ownership roles ranked for Akash.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
                Multi-source aggregation, profile-aware scoring, one-click apply links, and a
                status pipeline that keeps daily job hunting structured instead of noisy.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                className="rounded-full border border-ink bg-ink px-5 py-3 text-sm font-medium text-white transition hover:translate-y-[-1px]"
                onClick={() =>
                  startRefresh(async () => {
                    const response = await fetch("/api/jobs/refresh", { method: "POST" });
                    if (response.ok) {
                      router.refresh();
                    }
                  })
                }
                type="button"
              >
                {isRefreshing ? "Refreshing..." : "Find New Jobs"}
              </button>
              <a
                className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-teal hover:text-teal"
                href="/api/cron/daily"
                target="_blank"
              >
                Test Daily Sync
              </a>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          {[
            { label: "Visible Jobs", value: stats.total, tone: "bg-white" },
            { label: "Applied", value: stats.applied, tone: "bg-emerald-50" },
            { label: "Saved", value: stats.saved, tone: "bg-amber-50" },
            { label: "Avg Match", value: `${stats.avgScore}%`, tone: "bg-teal/10" }
          ].map((card) => (
            <div key={card.label} className={`panel rounded-[24px] p-5 ${card.tone}`}>
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-slate-500">
                {card.label}
              </p>
              <p className="mt-4 text-3xl font-semibold">{card.value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr_0.85fr]">
          <InsightCard
            title="Top Matches Today"
            tone="mint"
            items={topMatches.map((job) => `${job.title} at ${job.company} · ${job.matchScore}%`)}
            fallback="Refresh or lower the score filter to surface more high-confidence roles."
          />
          <InsightCard
            title="Jobs You Should Apply First"
            tone="amber"
            items={applyFirst.map((job) => `${job.title} at ${job.company}`)}
            fallback="Once you have fresh high-fit jobs, they’ll show up here."
          />
          <InsightCard
            title="Low Effort High Fit"
            tone="teal"
            items={lowEffortHighFit.map((job) => `${job.title} at ${job.company}`)}
            fallback="Enable direct-apply heavy sources or add more company pages for this bucket."
          />
        </section>

        <section className="panel rounded-[28px] p-5 md:p-6">
          <div className="grid gap-3 md:grid-cols-6">
            <input
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-0 transition focus:border-teal"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search title, company, keywords..."
              value={search}
            />
            <select
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal"
              onChange={(event) => setSource(event.target.value)}
              value={source}
            >
              <option value="ALL">All Sources</option>
              {Object.entries(sourceLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal"
              onChange={(event) => setRoleType(event.target.value)}
              value={roleType}
            >
              <option value="ALL">All Role Types</option>
              {Object.entries(roleLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal"
              onChange={(event) => setLocation(event.target.value)}
              value={location}
            >
              <option value="ALL">All Locations</option>
              {locations.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <select
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal"
              onChange={(event) => setStatus(event.target.value)}
              value={status}
            >
              <option value="ALL">All Statuses</option>
              {statusOptions.map((value) => (
                <option key={value} value={value}>
                  {formatStatus(value)}
                </option>
              ))}
            </select>
            <select
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal"
              onChange={(event) => setScoreFloor(event.target.value)}
              value={scoreFloor}
            >
              {[0, 60, 70, 80, 90].map((value) => (
                <option key={value} value={value}>
                  Match {value}%+
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="space-y-4">
          {filteredJobs.map((job) => (
            <article key={job.id} className="panel rounded-[28px] p-5 md:p-6">
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div className="max-w-4xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 font-mono text-[11px] uppercase tracking-[0.22em] text-slate-600">
                      {sourceLabels[job.source]}
                    </span>
                    <span className="rounded-full border border-teal/20 bg-teal/10 px-3 py-1 text-xs font-medium text-teal">
                      {roleLabels[job.roleType]}
                    </span>
                    {job.topMatch ? (
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                        Top Match
                      </span>
                    ) : null}
                    {job.lowEffortHighFit ? (
                      <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                        Low Effort High Fit
                      </span>
                    ) : null}
                  </div>

                  <h2 className="mt-4 text-2xl font-semibold tracking-tight">
                    {job.title}
                    <span className="text-slate-400"> @ </span>
                    <span className="text-teal">{job.company}</span>
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    {job.location ?? "Location not listed"}
                    {job.datePosted ? ` · Posted ${new Date(job.datePosted).toLocaleDateString()}` : ""}
                  </p>

                  <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-700">
                    {job.summary ?? job.description}
                  </p>

                  <p className="mt-3 text-sm leading-6 text-slate-500">{job.reasoning}</p>
                </div>

                <div className="flex min-w-[220px] flex-col gap-3">
                  <div className="status-glow rounded-[24px] border border-slate-200 bg-white p-4">
                    <p className="font-mono text-xs uppercase tracking-[0.26em] text-slate-500">
                      Match Score
                    </p>
                    <p className="mt-2 text-4xl font-semibold">{job.matchScore}</p>
                  </div>

                  <select
                    className={`rounded-2xl border px-4 py-3 text-sm font-medium ${statusClasses(job.status)}`}
                    defaultValue={job.status}
                    onChange={(event) =>
                      startUpdate(async () => {
                        const nextStatus = event.target.value as ApplicationStatus;
                        await updateStatus(job.id, nextStatus);
                        setJobs((current) =>
                          current.map((entry) =>
                            entry.id === job.id ? { ...entry, status: nextStatus } : entry
                          )
                        );
                      })
                    }
                  >
                    {statusOptions.map((value) => (
                      <option key={value} value={value}>
                        {formatStatus(value)}
                      </option>
                    ))}
                  </select>

                  <div className="grid grid-cols-3 gap-2">
                    <a
                      className="rounded-2xl bg-ink px-3 py-3 text-center text-sm font-medium text-white transition hover:translate-y-[-1px]"
                      href={job.applyLink}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Apply
                    </a>
                    <button
                      className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-700 transition hover:border-teal hover:text-teal"
                      onClick={() =>
                        startUpdate(async () => {
                          await updateStatus(job.id, ApplicationStatus.SAVED);
                          setJobs((current) =>
                            current.map((entry) =>
                              entry.id === job.id
                                ? { ...entry, status: ApplicationStatus.SAVED, saved: true }
                                : entry
                            )
                          );
                        })
                      }
                      type="button"
                    >
                      Save
                    </button>
                    <button
                      className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-700 transition hover:border-red-300 hover:text-red-500"
                      onClick={() =>
                        startUpdate(async () => {
                          await updateStatus(job.id, ApplicationStatus.REJECTED);
                          setJobs((current) =>
                            current.map((entry) =>
                              entry.id === job.id
                                ? { ...entry, status: ApplicationStatus.REJECTED }
                                : entry
                            )
                          );
                        })
                      }
                      type="button"
                    >
                      Reject
                    </button>
                  </div>

                  <p className="text-xs text-slate-400">
                    {isUpdating ? "Saving status..." : "Status changes persist immediately."}
                  </p>
                </div>
              </div>
            </article>
          ))}

          {filteredJobs.length === 0 ? (
            <div className="panel rounded-[28px] p-8 text-center text-slate-500">
              No jobs match the active filters yet. Try lowering the score threshold or refreshing
              the sources.
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

function InsightCard({
  title,
  tone,
  items,
  fallback
}: {
  title: string;
  tone: "mint" | "amber" | "teal";
  items: string[];
  fallback: string;
}) {
  const toneClass =
    tone === "mint"
      ? "from-mint/80 to-white"
      : tone === "amber"
        ? "from-amber-100 to-white"
        : "from-teal/15 to-white";

  return (
    <div className={`panel rounded-[28px] bg-gradient-to-br ${toneClass} p-5`}>
      <p className="font-mono text-xs uppercase tracking-[0.28em] text-slate-500">{title}</p>
      <div className="mt-5 space-y-3">
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item} className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm">
              {item}
            </div>
          ))
        ) : (
          <p className="text-sm leading-6 text-slate-500">{fallback}</p>
        )}
      </div>
    </div>
  );
}
