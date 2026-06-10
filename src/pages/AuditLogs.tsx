import { useMemo, useState } from "react";
import { ArrowLeft, Download, ExternalLink, Search, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

const EXPLORER = "https://testnet.cspr.live/deploy/";

type Lang = "en" | "es";
const dict = {
  en: {
    title: "Audit Logs",
    sub: "Immutable trail of every agent action on Casper Testnet.",
    back: "Back to dashboard",
    search: "Search by tx hash, pool, or action…",
    export: "Export CSV",
    time: "Timestamp",
    action: "Action",
    target: "Target",
    amount: "Amount",
    status: "Status",
    tx: "Tx",
    all: "All",
    success: "Success",
    pending: "Pending",
    observation: "Observation",
    failed: "Failed",
    totalEvents: "Total events",
    last24h: "Last 24h",
    successRate: "Success rate",
    avgGas: "Avg gas",
  },
  es: {
    title: "Logs de Auditoría",
    sub: "Traza inmutable de cada acción del agente en Casper Testnet.",
    back: "Volver al dashboard",
    search: "Buscar por hash, pool o acción…",
    export: "Exportar CSV",
    time: "Timestamp",
    action: "Acción",
    target: "Objetivo",
    amount: "Monto",
    status: "Estado",
    tx: "Tx",
    all: "Todos",
    success: "Éxito",
    pending: "Pendiente",
    observation: "Observación",
    failed: "Fallido",
    totalEvents: "Eventos totales",
    last24h: "Últimas 24h",
    successRate: "Tasa de éxito",
    avgGas: "Gas promedio",
  },
} as const;

type Status = "Success" | "Pending" | "Observation" | "Failed";

type Entry = {
  id: string;
  ts: string;
  action: string;
  target: string;
  amount: string;
  status: Status;
  hash: string;
  gas: string;
};

const entries: Entry[] = [
  { id: "1", ts: "2026-06-09 14:42:18", action: "REBALANCE", target: "CSPR/WETH", amount: "32,000 CSPR", status: "Pending", hash: "9a2f8c4b1d7e6a3f5c9b2e8d4a1f7c6b3e9d2a8f5c1b4e7d6a9c3f8b2e5d1a4f", gas: "1.20" },
  { id: "2", ts: "2026-06-09 14:28:04", action: "SCAN", target: "12 pools", amount: "—", status: "Observation", hash: "4b1e8d2c7f3a9b6d5e2c8a4f1b9d7e3c6a8f2b5d9c4e7a1f3b6d8c2e5a9f4b7d", gas: "0.10" },
  { id: "3", ts: "2026-06-09 13:30:51", action: "SWAP", target: "CSPR → USDT", amount: "5,000 CSPR", status: "Success", hash: "1c4a2e7b9d3f6a8c5e1b4d7f2a9c6e3b8d5f1a4c7e2b9d6f3a8c5e1b4d7f2a9c", gas: "0.90" },
  { id: "4", ts: "2026-06-09 12:57:12", action: "VAULT_INIT", target: "YieldVault Odra", amount: "1,200,000 CSPR", status: "Success", hash: "fe31a8c4b7d2e9f6a3c8b5d1e7f4a2c9b6d3e8f5a1c4b7d2e9f6a3c8b5d1e7f4", gas: "3.40" },
  { id: "5", ts: "2026-06-09 11:14:42", action: "STAKE", target: "CSPR/USDT", amount: "184,200 CSPR", status: "Success", hash: "7a3f5c9b2e8d4a1f7c6b3e9d2a8f5c1b4e7d6a9c3f8b2e5d1a4f9a2f8c4b1d7e", gas: "1.50" },
  { id: "6", ts: "2026-06-09 10:02:01", action: "CLAIM", target: "CSPR/USDT rewards", amount: "+42.18 CSPR", status: "Success", hash: "2e5d1a4f9a2f8c4b1d7e6a3f5c9b2e8d4a1f7c6b3e9d2a8f5c1b4e7d6a9c3f8b", gas: "0.62" },
  { id: "7", ts: "2026-06-09 09:18:33", action: "STRATEGY_UPDATE", target: "APY threshold → 12.5%", amount: "—", status: "Success", hash: "8f5c1b4e7d6a9c3f8b2e5d1a4f9a2f8c4b1d7e6a3f5c9b2e8d4a1f7c6b3e9d2a", gas: "0.20" },
  { id: "8", ts: "2026-06-09 08:44:10", action: "REBALANCE", target: "CSPR/USDC", amount: "75,000 CSPR", status: "Failed", hash: "5d9c4e7a1f3b6d8c2e5a9f4b7d4b1e8d2c7f3a9b6d5e2c8a4f1b9d7e3c6a8f2b", gas: "1.80" },
];

const statusTone: Record<Status, string> = {
  Success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Pending: "bg-red-500/10 text-red-400 border-red-500/20",
  Observation: "bg-zinc-800/80 text-zinc-400 border-zinc-700",
  Failed: "bg-red-900/20 text-red-500 border-red-800/40",
};

const actionTone: Record<string, string> = {
  REBALANCE: "text-red-400",
  SWAP: "text-red-300",
  STAKE: "text-emerald-400",
  CLAIM: "text-emerald-400",
  VAULT_INIT: "text-emerald-400",
  SCAN: "text-zinc-400",
  STRATEGY_UPDATE: "text-zinc-300",
};

export const AuditPage = () => {
  const [lang, setLang] = useState<Lang>("en");
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [q, setQ] = useState("");
  const t = dict[lang];

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (filter !== "all" && e.status !== filter) return false;
      if (!q.trim()) return true;
      const needle = q.toLowerCase();
      return (
        e.hash.toLowerCase().includes(needle) ||
        e.target.toLowerCase().includes(needle) ||
        e.action.toLowerCase().includes(needle)
      );
    });
  }, [filter, q]);

  const successRate =
    Math.round(
      (entries.filter((e) => e.status === "Success").length / entries.length) * 100
    ) + "%";

  const avgGas =
    (
      entries.reduce((acc, e) => acc + parseFloat(e.gas), 0) / entries.length
    ).toFixed(2) + " CSPR";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans pb-16">

      {/* Navbar */}
      <nav className="border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="size-6 bg-brand rounded-sm flex items-center justify-center">
              <div className="size-2 bg-zinc-950 rounded-full" />
            </div>
            <span className="font-medium text-zinc-100 tracking-tight">Casper Autopilot</span>
            <div className="h-4 w-px bg-zinc-800 mx-1" />
            <Link
              to="/"
              className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-200 transition-colors text-xs font-mono"
            >
              <ArrowLeft className="size-3.5" />
              {t.back}
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2">
              <ShieldCheck className="size-3.5 text-red-400/70" />
              <span
                className="text-[10px] font-mono uppercase tracking-widest text-red-400/70"
                style={{ textShadow: "0 0 8px #ff2d2d" }}
              >
                Audit Trail
              </span>
            </div>
            <div className="h-4 w-px bg-zinc-800" />
            <div className="inline-flex items-center rounded-lg border border-zinc-800 bg-zinc-900/40 p-0.5">
              {(["en", "es"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-2 py-1 text-[10px] font-mono uppercase tracking-wider rounded-md transition-colors ${
                    lang === l ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="size-1.5 rounded-full bg-red-500 animate-pulse"
              style={{ boxShadow: "0 0 6px #ff2d2d" }}
            />
            <span className="text-[10px] font-mono uppercase tracking-widest text-red-400/70">
              Live · casper-test
            </span>
          </div>
          <h1
            className="text-3xl font-medium text-zinc-100 tracking-tight"
            style={{ textShadow: "0 0 40px rgba(255,45,45,0.15)" }}
          >
            {t.title}
          </h1>
          <p className="mt-1.5 text-sm text-zinc-500">{t.sub}</p>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {[
            { l: t.totalEvents, v: entries.length.toString().padStart(2, "0"), accent: false },
            { l: t.last24h, v: "06", accent: false },
            { l: t.successRate, v: successRate, accent: true },
            { l: t.avgGas, v: avgGas, accent: false },
          ].map((s) => (
            <div
              key={s.l}
              className="rounded-xl border border-red-500/15 bg-red-500/5 p-4"
              style={{ boxShadow: "0 0 20px rgba(255,45,45,0.05)" }}
            >
              <div className="text-[9px] uppercase tracking-widest text-zinc-500 mb-2">{s.l}</div>
              <div
                className={`text-2xl font-mono tabular-nums ${
                  s.accent ? "text-emerald-400" : "text-zinc-100"
                }`}
              >
                {s.v}
              </div>
            </div>
          ))}
        </section>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-600" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t.search}
              className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-900/60 border border-zinc-800 rounded-lg text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-red-500/40 font-mono transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center rounded-lg border border-zinc-800 bg-zinc-900/40 p-0.5">
              {(["all", "Success", "Pending", "Observation", "Failed"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider rounded-md transition-colors ${
                    filter === s
                      ? "bg-zinc-800 text-zinc-100"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {s === "all" ? t.all
                    : s === "Success" ? t.success
                    : s === "Pending" ? t.pending
                    : s === "Observation" ? t.observation
                    : t.failed}
                </button>
              ))}
            </div>
            <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900/40 text-[10px] font-mono uppercase tracking-wider text-zinc-400 hover:text-zinc-200 hover:border-red-500/30 transition-colors">
              <Download className="size-3" />
              {t.export}
            </button>
          </div>
        </div>

        {/* Table */}
        <div
          className="overflow-hidden rounded-xl border border-red-500/15 bg-zinc-950"
          style={{ boxShadow: "0 0 30px rgba(255,45,45,0.06)" }}
        >
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-900 bg-red-500/5">
                {[t.time, t.action, t.target, t.amount, t.status, t.tx].map((h, i) => (
                  <th
                    key={h}
                    className={`px-4 py-3 text-[9px] font-medium uppercase tracking-widest text-zinc-500 ${
                      i === 5 ? "text-right" : ""
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/50">
              {filtered.map((e) => (
                <tr
                  key={e.id}
                  className="hover:bg-red-500/[0.03] transition-colors group"
                >
                  <td className="px-4 py-3.5 font-mono text-[11px] text-zinc-500 whitespace-nowrap">
                    {e.ts}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`font-mono text-xs font-semibold ${
                        actionTone[e.action] ?? "text-zinc-300"
                      }`}
                    >
                      {e.action}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-zinc-300">{e.target}</td>
                  <td className="px-4 py-3.5 font-mono text-xs text-zinc-400">{e.amount}</td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[9px] font-mono uppercase tracking-wider ${statusTone[e.status]}`}
                    >
                      {e.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <a
                      href={`${EXPLORER}${e.hash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-[11px] text-red-400/70 hover:text-red-400 transition-colors"
                    >
                      {e.hash.slice(0, 8)}…
                      <ExternalLink className="size-3" />
                    </a>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-xs text-zinc-600 font-mono uppercase tracking-widest">
                    No results found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Count */}
        <div className="mt-3 text-[10px] font-mono text-zinc-600 text-right">
          {filtered.length} / {entries.length} events
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-zinc-900 bg-zinc-950/80 backdrop-blur-md z-30">
        <div className="mx-auto max-w-7xl px-6 h-10 flex items-center justify-between text-[10px] font-mono text-zinc-600">
          <div className="flex gap-6">
            <span>EVENTS: <span className="text-zinc-400">{entries.length}</span></span>
            <span>SUCCESS RATE: <span className="text-emerald-500/60">{successRate}</span></span>
            <span>AVG GAS: <span className="text-zinc-400">{avgGas}</span></span>
          </div>
          <div className="flex gap-4">
            <span className="text-emerald-500/60">CASPER-TEST</span>
            <span>v0.12.4-BETA</span>
          </div>
        </div>
      </footer>
    </div>
  );
};