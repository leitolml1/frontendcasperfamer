import { useEffect, useState } from "react";
import { ArrowUpRight, Eye, Brain, Zap, FileText, Github, ExternalLink } from "lucide-react";

import { Link } from "react-router-dom";
import { WalletConnect } from "#components/WalletConnect";
// ---------- i18n ----------
type Lang = "en" | "es";

const dict = {
    en: {
        badge: "Casper Agentic Buildathon 2026 · Testnet live",
        heroLine1: "Your capital.",
        heroLine2: "The agent decides.",
        heroSub:
            "An autonomous AI agent that monitors DeFi pools on Casper Network, executes swaps when APY justifies it, and logs every decision on-chain.",
        ctaDashboard: "Open live dashboard",
        ctaExplorer: "Testnet explorer",
        loopTitle: "agent.py · main loop",
        observe: "Observe",
        decide: "Decide",
        execute: "Execute",
        log: "Log",
        stats: {
            decisions: "Decisions logged",
            uptime: "Loop uptime",
            avgApy: "Avg. APY delta",
            latency: "Avg. cycle",
        },
        agentStateTitle: "Agent state",
        running: "RUNNING",
        nextCycle: "Next cycle",
        balanceLabel: "Vault balance",
        networkLabel: "Network",
        ruleLabel: "APY rule",
        slippageLabel: "Max slippage",
        stack: "STACK",
        feedTitle: "Real-time decisions",
        howTitle: "How it works",
        howSub: "The autonomous loop",
        howDesc: "Every 5 minutes the agent runs this cycle without human intervention.",
        steps: [
            { t: "Observe", d: "Reads vault balance, CSPR/sCSPR prices and pool APY via Casper MCP and CSPR.trade MCP." },
            { t: "Decide", d: "Claude analyzes the conditions: if APY rises +2% and slippage < 1.5%, the verdict is SWAP. Otherwise HOLD." },
            { t: "Execute", d: "Signs and submits the transaction on-chain via CSPR.click. Calls execute_swap() on the YieldVault contract." },
            { t: "Log", d: "Records the decision on-chain with log_action() so the jury and anyone else can audit it." },
        ],
        featuresTitle: "Features",
        featuresSub: "Built for the buildathon",
        features: [
            { t: "Onchain audit", d: "Every decision is logged inside the YieldVault contract. Fully traceable." },
            { t: "MCP-native", d: "Talks directly to Casper MCP and CSPR.trade MCP. Zero glue code." },
            { t: "Claude reasoning", d: "Uses LLM reasoning to weigh APY, slippage and liquidity at every step." },
            { t: "CSPR.click", d: "Wallet flow ready for jury demo with native Casper signing." },
            { t: "Odra contract", d: "Rust-based YieldVault contract: deposit, swap, log_action, withdraw." },
            { t: "Live dashboard", d: "Operators see every action of the agent with timestamps and tx hashes." },
        ],
        roadmapTitle: "Roadmap",
        roadmapSub: "From testnet to production",
        roadmap: [
            { q: "Q2 2026", label: "NOW", items: ["YieldVault on Testnet", "Functional agent loop", "Live React dashboard", "Jury demo"] },
            { q: "Q3 2026", label: "NEXT", items: ["Mainnet migration", "Multi-pool support", "Telegram / Discord alerts", "Gas optimization"] },
            { q: "Q4 2026", label: "FUTURE", items: ["Public API for dApps", "Multiple strategies", "Fiat on-ramp integration", "Developer SDK"] },
        ],
        ctaTitle: "Watch the agent in action",
        ctaDesc: "Every transaction is real and verifiable on Casper Testnet.",
        ctaViewTx: "View transactions",
        ctaSource: "Source code",
        footer: "Casper Agentic Buildathon 2026",
        nav: { how: "How it works", features: "Features", roadmap: "Roadmap" },
    },
    es: {
        badge: "Casper Agentic Buildathon 2026 · Testnet activo",
        heroLine1: "Tu capital.",
        heroLine2: "El agente decide.",
        heroSub:
            "Un agente de IA autónomo que monitorea pools DeFi en Casper Network, ejecuta swaps cuando el APY lo justifica y loguea cada decisión on-chain.",
        ctaDashboard: "Abrir dashboard en vivo",
        ctaExplorer: "Explorador testnet",
        loopTitle: "agent.py · loop principal",
        observe: "Observar",
        decide: "Decidir",
        execute: "Ejecutar",
        log: "Loguear",
        stats: {
            decisions: "Decisiones logueadas",
            uptime: "Uptime del loop",
            avgApy: "Δ APY promedio",
            latency: "Ciclo promedio",
        },
        agentStateTitle: "Estado del agente",
        running: "CORRIENDO",
        nextCycle: "Próximo ciclo",
        balanceLabel: "Balance del vault",
        networkLabel: "Red",
        ruleLabel: "Regla APY",
        slippageLabel: "Slippage máx.",
        stack: "STACK",
        feedTitle: "Decisiones en tiempo real",
        howTitle: "Cómo funciona",
        howSub: "El loop autónomo",
        howDesc: "Cada 5 minutos el agente ejecuta este ciclo sin intervención humana.",
        steps: [
            { t: "Observar", d: "Lee balance del vault, precios CSPR/sCSPR y APY del pool via Casper MCP y CSPR.trade MCP." },
            { t: "Decidir", d: "Claude analiza las condiciones: si el APY sube +2% y slippage < 1.5%, el veredicto es SWAP. Si no, HOLD." },
            { t: "Ejecutar", d: "Firma y envía la transacción on-chain via CSPR.click. Llama a execute_swap() en el contrato YieldVault." },
            { t: "Loguear", d: "Registra la decisión on-chain con log_action() para que el jurado y cualquiera pueda auditarla." },
        ],
        featuresTitle: "Features",
        featuresSub: "Construido para el buildathon",
        features: [
            { t: "Auditoría onchain", d: "Cada decisión se loguea dentro del contrato YieldVault. Totalmente trazable." },
            { t: "MCP-native", d: "Habla directamente con Casper MCP y CSPR.trade MCP. Sin glue code." },
            { t: "Razonamiento Claude", d: "Usa LLM para pesar APY, slippage y liquidez en cada paso." },
            { t: "CSPR.click", d: "Flujo de wallet listo para la demo del jurado con firma nativa Casper." },
            { t: "Contrato Odra", d: "YieldVault en Rust: deposit, swap, log_action, withdraw." },
            { t: "Dashboard en vivo", d: "Los operadores ven cada acción del agente con timestamps y tx hashes." },
        ],
        roadmapTitle: "Roadmap",
        roadmapSub: "De testnet a producción",
        roadmap: [
            { q: "Q2 2026", label: "ACTUAL", items: ["YieldVault en Testnet", "Loop agente funcional", "Dashboard React live", "Demo para el jurado"] },
            { q: "Q3 2026", label: "PRÓXIMO", items: ["Migración a Mainnet", "Soporte multi-pool", "Alertas Telegram/Discord", "Optimización de gas"] },
            { q: "Q4 2026", label: "FUTURO", items: ["API pública para dApps", "Múltiples estrategias", "Integración fiat on-ramp", "SDK para devs"] },
        ],
        ctaTitle: "Mirá el agente en acción",
        ctaDesc: "Cada transacción es real y verificable en Casper Testnet.",
        ctaViewTx: "Ver transacciones",
        ctaSource: "Ver código fuente",
        footer: "Casper Agentic Buildathon 2026",
        nav: { how: "Cómo funciona", features: "Features", roadmap: "Roadmap" },
    },
} as const;

// ---------- Loop ticker ----------
const LOOP_ICONS = [Eye, Brain, Zap, FileText];

function LoopTicker({ labels }: { labels: string[] }) {
    const [active, setActive] = useState(0);
    useEffect(() => {
        const t = setInterval(() => setActive((a) => (a + 1) % 4), 1800);
        return () => clearInterval(t);
    }, []);
    return (
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {labels.map((label, i) => {
                const Icon = LOOP_ICONS[i];
                const on = i === active;
                return (
                    <div key={label} className="flex items-center gap-3 sm:gap-4">
                        <div
                            className="flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-wider transition-all duration-500"
                            style={{
                                borderColor: on ? "#ff2d2d" : "#27272a",
                                color: on ? "#ff2d2d" : "#a1a1aa",
                                background: on ? "rgba(255,45,45,0.08)" : "transparent",
                                boxShadow: on ? "0 0 24px rgba(255,45,45,0.25)" : "none",
                            }}
                        >
                            <Icon className="h-3.5 w-3.5" />
                            {label}
                        </div>
                        {i < 3 && <div className="h-px w-6 sm:w-10 bg-zinc-800" />}
                    </div>
                );
            })}
        </div>
    );
}

// ---------- Live counter ----------
function LiveCounter({ label, value, suffix = "" }: { label: string; value: number; suffix?: string }) {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
        let cur = 0;
        const step = value / 40;
        const t = setInterval(() => {
            cur += step;
            if (cur >= value) {
                setDisplay(value);
                clearInterval(t);
            } else setDisplay(Math.floor(cur));
        }, 30);
        return () => clearInterval(t);
    }, [value]);
    return (
        <div className="rounded-xl border border-zinc-900 bg-zinc-950/50 p-5">
            <div className="font-mono text-2xl font-bold text-zinc-100">
                {display.toLocaleString()}
                {suffix}
            </div>
            <div className="mt-1 text-xs uppercase tracking-wider text-zinc-500">{label}</div>
        </div>
    );
}

// ---------- Decision feed ----------
type Decision = {
    id: number;
    action: "SWAP" | "HOLD";
    reasoning: string;
    amount: number | null;
    tokenIn: string | null;
    tokenOut: string | null;
    timestamp: string;
    tx: string | null;
};

function makeInitial(lang: Lang): Decision[] {
    const t = (en: string, es: string) => (lang === "es" ? es : en);
    return [
        {
            id: 1,
            action: "SWAP",
            reasoning: t(
                "sCSPR APY rose +3.2% over current pool. Estimated slippage: 0.8%. Optimal conditions to move funds.",
                "APY sCSPR subió 3.2% sobre el pool actual. Slippage estimado: 0.8%. Condiciones óptimas para mover fondos.",
            ),
            amount: 420,
            tokenIn: "CSPR",
            tokenOut: "sCSPR",
            timestamp: t("2 min ago", "hace 2 min"),
            tx: "deploy-a1b2c3d4e5f6",
        },
        {
            id: 2,
            action: "HOLD",
            reasoning: t(
                "Estimated slippage 1.9% exceeds the 1.5% threshold. No execution until liquidity improves.",
                "Slippage estimado 1.9% supera el umbral de 1.5%. No se ejecuta hasta que mejore la liquidez.",
            ),
            amount: null,
            tokenIn: null,
            tokenOut: null,
            timestamp: t("7 min ago", "hace 7 min"),
            tx: null,
        },
        {
            id: 3,
            action: "SWAP",
            reasoning: t(
                "Balance 820 CSPR. APY differential +2.4%. Executing swap to maximize yield.",
                "Balance 820 CSPR. APY diferencial +2.4%. Ejecutando swap para maximizar rendimiento.",
            ),
            amount: 200,
            tokenIn: "CSPR",
            tokenOut: "sCSPR",
            timestamp: t("12 min ago", "hace 12 min"),
            tx: "deploy-9f8e7d6c5b4a",
        },
    ];
}

function DecisionItem({ d }: { d: Decision }) {
    const isSwap = d.action === "SWAP";
    return (
        <div
            className="rounded-xl border p-4"
            style={{
                borderColor: isSwap ? "rgba(255,45,45,0.25)" : "#27272a",
                background: isSwap ? "rgba(255,45,45,0.04)" : "rgba(255,255,255,0.015)",
            }}
        >
            <div className="flex items-center justify-between">
                <span
                    className="font-mono text-xs font-bold uppercase tracking-wider"
                    style={{ color: isSwap ? "#ff2d2d" : "#a1a1aa" }}
                >
                    {isSwap ? "⚡ SWAP" : "⏸ HOLD"}
                </span>
                <span className="font-mono text-[10px] uppercase text-zinc-500">{d.timestamp}</span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-zinc-300">{d.reasoning}</p>
            {isSwap && (
                <div className="mt-3 flex items-center justify-between border-t border-zinc-900 pt-3 font-mono text-xs">
                    <span className="text-zinc-200">
                        {d.amount} {d.tokenIn} → {d.tokenOut}
                    </span>
                    {d.tx && (
                        <a
                            href={`https://testnet.cspr.live/deploy/${d.tx}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-zinc-500 hover:text-zinc-200"
                        >
                            {d.tx.slice(0, 14)}…
                            <ExternalLink className="h-3 w-3" />
                        </a>
                    )}
                </div>
            )}
        </div>
    );
}

// ---------- Main ----------
export const LandingPage = () => {
    const [lang, setLang] = useState<Lang>("es");
    const t = dict[lang];
    const [nextIn, setNextIn] = useState(300);
    const [decisions, setDecisions] = useState<Decision[]>(() => makeInitial("es"));

    useEffect(() => {
        setDecisions(makeInitial(lang));
    }, [lang]);

    useEffect(() => {
        const i = setInterval(() => setNextIn((n) => (n <= 0 ? 300 : n - 1)), 1000);
        return () => clearInterval(i);
    }, []);

    const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

    return (
        <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans">
            {/* Ambient glow */}
            <div
                aria-hidden
                className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[600px]"
                style={{
                    background:
                        "radial-gradient(ellipse at 50% 0%, rgba(255,45,45,0.12), transparent 60%)",
                }}
            />

            {/* NAV */}
            <nav className="sticky top-0 z-50 border-b border-zinc-900 bg-[#09090b]/80 backdrop-blur">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#ff2d2d] text-black">
                            <Zap className="h-4 w-4" />
                        </div>
                        <span className="font-mono text-sm font-bold tracking-tight">YieldAgent</span>
                        <span className="ml-2 rounded border border-zinc-800 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                            testnet
                        </span>
                    </div>

                    <div className="hidden items-center gap-7 text-sm text-zinc-400 md:flex">
                        <a href="#how" className="hover:text-zinc-100">{t.nav.how}</a>
                        <a href="#features" className="hover:text-zinc-100">{t.nav.features}</a>
                        <a href="#roadmap" className="hover:text-zinc-100">{t.nav.roadmap}</a>
                        <a
                            href="https://github.com"
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 hover:text-zinc-100"
                        >
                            <Github className="h-3.5 w-3.5" /> GitHub
                        </a>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex overflow-hidden rounded-md border border-zinc-800 font-mono text-[11px]">
                            <button
                                onClick={() => setLang("en")}
                                className={`px-2.5 py-1 ${lang === "en" ? "bg-zinc-100 text-zinc-900" : "text-zinc-400 hover:text-zinc-100"}`}
                            >
                                EN
                            </button>
                            <button
                                onClick={() => setLang("es")}
                                className={`px-2.5 py-1 ${lang === "es" ? "bg-zinc-100 text-zinc-900" : "text-zinc-400 hover:text-zinc-100"}`}
                            >
                                ES
                            </button>
                        </div>
                        
                    </div>
                </div>
            </nav>

            {/* HERO */}
            <section className="mx-auto max-w-5xl px-6 pt-20 pb-16 text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-zinc-400">
                    <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-[#10b981]" />
                    {t.badge}
                </div>

                <h1 className="mt-8 text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
                    {t.heroLine1}
                    <br />
                    <span style={{ color: "#ff2d2d" }}>{t.heroLine2}</span>
                </h1>

                <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400">
                    {t.heroSub}
                </p>

                <div className="mt-10">
                    <LoopTicker labels={[t.observe, t.decide, t.execute, t.log]} />
                </div>

                <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 rounded-md bg-[#ff2d2d] px-5 py-3 font-mono text-sm font-bold text-black hover:opacity-90"
                    >
                        {t.ctaDashboard} <ArrowUpRight className="h-4 w-4" />
                    </Link>
                    <a
                        href="https://testnet.cspr.live"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-md border border-zinc-800 px-5 py-3 font-mono text-sm text-zinc-200 hover:border-zinc-600"
                    >
                        {t.ctaExplorer} <ExternalLink className="h-4 w-4" />
                    </a>
                </div>

                {/* Code snippet */}
                <div className="mx-auto mt-14 max-w-2xl rounded-xl border border-zinc-900 bg-zinc-950/60 text-left">
                    <div className="flex items-center gap-2 border-b border-zinc-900 px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-zinc-500">
                        <span className="h-2 w-2 rounded-full bg-zinc-700" />
                        <span className="h-2 w-2 rounded-full bg-zinc-700" />
                        <span className="h-2 w-2 rounded-full bg-zinc-700" />
                        <span className="ml-2">{t.loopTitle}</span>
                    </div>
                    <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-relaxed text-zinc-300">
                        {`while True:
    # 1. ${t.observe.toLowerCase()} → balance + APY via MCP
    # 2. ${t.decide.toLowerCase()}  → LLM analyzes conditions
    # 3. ${t.execute.toLowerCase()} → on-chain swap if APY +2%
    # 4. ${t.log.toLowerCase()}     → YieldVault.log_action()
    await asyncio.sleep(300)`}
                    </pre>
                </div>
            </section>

            {/* STATS */}
            <section className="mx-auto max-w-7xl px-6 py-12">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <LiveCounter label={t.stats.decisions} value={1248} />
                    <LiveCounter label={t.stats.uptime} value={99} suffix="%" />
                    <LiveCounter label={t.stats.avgApy} value={3} suffix=".4%" />
                    <LiveCounter label={t.stats.latency} value={300} suffix="s" />
                </div>
            </section>

            {/* LIVE PANEL */}
            <section className="mx-auto grid max-w-7xl gap-6 px-6 py-12 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6">
                    <h3 className="text-lg font-semibold">{t.agentStateTitle}</h3>

                    <div className="mt-5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 animate-pulse-soft rounded-full bg-[#10b981]" />
                            <span className="font-mono text-xs font-bold tracking-wider text-[#10b981]">
                                {t.running}
                            </span>
                        </div>
                        <span className="font-mono text-xs text-zinc-500">
                            {t.nextCycle}: {fmt(nextIn)}
                        </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                        {[
                            { l: t.balanceLabel, v: "5,420 CSPR" },
                            { l: t.networkLabel, v: "Casper Testnet" },
                            { l: t.ruleLabel, v: "Δ > +2%" },
                            { l: t.slippageLabel, v: "1.5%" },
                        ].map((it) => (
                            <div key={it.l} className="rounded-lg border border-zinc-900 bg-zinc-950/60 p-3">
                                <div className="text-[10px] uppercase tracking-wider text-zinc-500">{it.l}</div>
                                <div className="mt-1 font-mono text-sm text-zinc-100">{it.v}</div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 text-[10px] uppercase tracking-wider text-zinc-500">{t.stack}</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {["Odra (Rust)", "Casper MCP", "CSPR.trade MCP", "CSPR.click", "Python", "React + Vite"].map(
                            (tech) => (
                                <span
                                    key={tech}
                                    className="rounded-full border border-zinc-800 px-2.5 py-1 font-mono text-[11px] text-zinc-300"
                                >
                                    {tech}
                                </span>
                            ),
                        )}
                    </div>
                </div>

                <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-semibold">{t.feedTitle}</h3>
                        <span className="h-2 w-2 animate-pulse-soft rounded-full bg-[#ff2d2d]" />
                    </div>
                    <div className="space-y-3">
                        {decisions.map((d) => (
                            <DecisionItem key={d.id} d={d} />
                        ))}
                    </div>
                </div>
            </section>

            {/* HOW */}
            <section id="how" className="mx-auto max-w-7xl px-6 py-20">
                <div className="text-center">
                    <div className="font-mono text-xs uppercase tracking-wider text-[#ff2d2d]">{t.howTitle}</div>
                    <h2 className="mt-2 text-3xl font-bold sm:text-4xl">{t.howSub}</h2>
                    <p className="mx-auto mt-3 max-w-xl text-zinc-400">{t.howDesc}</p>
                </div>

                <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {t.steps.map((s, i) => {
                        const Icon = LOOP_ICONS[i];
                        return (
                            <div
                                key={s.t}
                                className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-5 transition-colors hover:border-zinc-700"
                            >
                                <div className="font-mono text-xs text-zinc-600">0{i + 1}</div>
                                <Icon className="mt-3 h-5 w-5 text-[#ff2d2d]" />
                                <div className="mt-3 font-semibold">{s.t}</div>
                                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{s.d}</p>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* FEATURES */}
            <section id="features" className="mx-auto max-w-7xl px-6 py-20">
                <div className="text-center">
                    <div className="font-mono text-xs uppercase tracking-wider text-[#ff2d2d]">{t.featuresTitle}</div>
                    <h2 className="mt-2 text-3xl font-bold sm:text-4xl">{t.featuresSub}</h2>
                </div>

                <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {t.features.map((f) => (
                        <div
                            key={f.t}
                            className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-6 transition-colors hover:border-zinc-700"
                        >
                            <div className="font-semibold">{f.t}</div>
                            <p className="mt-2 text-sm leading-relaxed text-zinc-400">{f.d}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ROADMAP */}
            <section id="roadmap" className="mx-auto max-w-7xl px-6 py-20">
                <div className="text-center">
                    <div className="font-mono text-xs uppercase tracking-wider text-[#ff2d2d]">{t.roadmapTitle}</div>
                    <h2 className="mt-2 text-3xl font-bold sm:text-4xl">{t.roadmapSub}</h2>
                </div>

                <div className="mt-12 grid gap-4 md:grid-cols-3">
                    {t.roadmap.map((p) => (
                        <div key={p.q} className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-6">
                            <div className="flex items-center justify-between">
                                <div className="font-mono text-sm text-zinc-300">{p.q}</div>
                                <span className="rounded-full border border-zinc-800 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                                    {p.label}
                                </span>
                            </div>
                            <ul className="mt-4 space-y-2">
                                {p.items.map((it) => (
                                    <li key={it} className="flex items-start gap-2 text-sm text-zinc-300">
                                        <span className="mt-1.5 h-1 w-1 rounded-full bg-[#ff2d2d]" />
                                        {it}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="mx-auto max-w-4xl px-6 py-24 text-center">
                <h2 className="text-3xl font-bold sm:text-4xl">{t.ctaTitle}</h2>
                <p className="mx-auto mt-3 max-w-xl text-zinc-400">{t.ctaDesc}</p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 rounded-md bg-[#ff2d2d] px-5 py-3 font-mono text-sm font-bold text-black hover:opacity-90"
                    >
                        {t.ctaViewTx} <ArrowUpRight className="h-4 w-4" />
                    </Link>
                    <a
                        href="https://github.com"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-md border border-zinc-800 px-5 py-3 font-mono text-sm text-zinc-200 hover:border-zinc-600"
                    >
                        {t.ctaSource} <Github className="h-4 w-4" />
                    </a>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="border-t border-zinc-900">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
                    <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#ff2d2d] text-black">
                            <Zap className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-mono text-sm">YieldAgent</span>
                        <span className="ml-2 text-xs text-zinc-500">{t.footer}</span>
                    </div>
                    <div className="flex items-center gap-5 text-xs text-zinc-500">
                        <a href="https://dorahacks.io" target="_blank" rel="noreferrer" className="hover:text-zinc-200">
                            DoraHacks
                        </a>
                        <a href="https://testnet.cspr.live" target="_blank" rel="noreferrer" className="hover:text-zinc-200">
                            Testnet
                        </a>
                        <a href="https://odra.dev/docs/" target="_blank" rel="noreferrer" className="hover:text-zinc-200">
                            Odra docs
                        </a>
                        <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-zinc-200">
                            GitHub
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
