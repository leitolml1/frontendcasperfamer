import { useMemo, useState } from "react";
import { ArrowLeft, Download, ExternalLink, Search } from "lucide-react";
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
  Pending: "bg-brand/10 text-brand border-brand/20",
  Observation: "bg-zinc-800 text-zinc-400 border-zinc-700",
  Failed: "bg-red-500/10 text-red-400 border-red-500/20",
};



export const AuditPage=()=> {
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
    Math.round((entries.filter((e) => e.status === "Success").length / entries.length) * 100) + "%";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans pb-16">
      <nav className="border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 transition-colors text-sm">
              <ArrowLeft className="size-4" />
              <span>{t.back}</span>
            </Link>
          </div>
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
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-medium text-zinc-100 tracking-tight">{t.title}</h1>
          <p className="mt-2 text-sm text-zinc-500">{t.sub}</p>
        </header>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { l: t.totalEvents, v: entries.length.toString().padStart(2, "0") },
            { l: t.last24h, v: "06" },
            { l: t.successRate, v: successRate },
            { l: t.avgGas, v: "1.22 CSPR" },
          ].map((s) => (
            <div key={s.l} className="rounded-xl border border-zinc-900 bg-zinc-900/30 p-4">
              <div className="text-[10px] uppercase tracking-widest text-zinc-500">{s.l}</div>
              <div className="mt-2 text-2xl font-mono text-zinc-100 tabular-nums">{s.v}</div>
            </div>
          ))}
        </section>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-600" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t.search}
              className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-900/40 border border-zinc-800 rounded-lg text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-brand/50"
            />
          </div>
          <div className="flex items-center gap-2">
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
                  {s === "all"
                    ? t.all
                    : s === "Success"
                    ? t.success
                    : s === "Pending"
                    ? t.pending
                    : s === "Observation"
                    ? t.observation
                    : t.failed}
                </button>
              ))}
            </div>
            <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-800 text-xs text-zinc-300 hover:bg-zinc-900/60 transition-colors">
              <Download className="size-3.5" />
              {t.export}
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-900 bg-zinc-900/30 text-[10px] uppercase tracking-widest text-zinc-500">
                <th className="px-4 py-3 font-medium">{t.time}</th>
                <th className="px-4 py-3 font-medium">{t.action}</th>
                <th className="px-4 py-3 font-medium">{t.target}</th>
                <th className="px-4 py-3 font-medium">{t.amount}</th>
                <th className="px-4 py-3 font-medium">{t.status}</th>
                <th className="px-4 py-3 font-medium text-right">{t.tx}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/50">
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-zinc-400 whitespace-nowrap">{e.ts}</td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-100">{e.action}</td>
                  <td className="px-4 py-3 text-zinc-300">{e.target}</td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-300">{e.amount}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-mono uppercase tracking-wider ${statusTone[e.status]}`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <a
                      href={`${EXPLORER}${e.hash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-xs text-brand hover:underline"
                    >
                      {e.hash.slice(0, 8)}…
                      <ExternalLink className="size-3" />
                    </a>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-zinc-600">
                    —
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
