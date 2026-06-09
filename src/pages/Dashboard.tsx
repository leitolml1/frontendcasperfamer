import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { ChevronDown, ChevronRight, ExternalLink, Info, Wallet, X } from "lucide-react";

const EXPLORER = "https://testnet.cspr.live/deploy/";

// ---------- i18n ----------

type Lang = "en" | "es";

const dict = {
    en: {
        agentActive: "Agent Active",
        nextCycle: "Next cycle",
        testnetNode: "Testnet Node",
        connectWallet: "Connect wallet",
        totalVaultBalance: "{t.totalVaultBalance}",
        rangeChange: "Change",
        activePositions: "Active Positions",
        totalDeploys: "Total Deploys",
        agentStrategy: "Agent Strategy",
        apyThreshold: "APY Threshold",
        strategyDesc:
            "Dynamic liquidity provisioning with auto-compounding on Casper testnet pools. Sensitivity adjusted for low-volatility events.",
        updateStrategy: "Update Strategy",
        onchainTelemetry: "On-chain Telemetry",
        telemetrySub: "Gas price & node latency",
        window: "window",
        gasPrice: "Gas price",
        nodeLatency: "Node latency",
        opportunityScanner: "Opportunity Scanner",
        clickPool: "Click a pool to inspect",
        poolName: "Pool Name",
        status: "Status",
        scannerHint:
            "The agent has identified a yield imbalance in the CSPR/USDC pool. Deployment scheduled for next epoch transition (approx. 42 minutes).",
        reasoningFeed: "Autonomous Reasoning Feed",
        expandDrill: "Expand for drill-down",
        viewAudit: "View Audit Logs",
        connected: "CONNECTED",
        poolDetail: "Pool detail",
        position: "Position",
        rewards24h: "Rewards 24h",
        apyLast24h: "APY · last 24h",
        agentReasoning: "Agent reasoning",
        riskProfile: "Risk profile",
        impermanentLoss: "Impermanent loss",
        scRisk: "Smart-contract risk",
        audited: "Audited",
        oracleSource: "Oracle source",
        forceEntry: "Force entry",
        blacklist: "Blacklist",
        inputs: "Inputs",
        reasoningTrace: "Reasoning trace",
        viewExplorer: "View on explorer",
    },
    es: {
        agentActive: "Agente activo",
        nextCycle: "Próximo ciclo",
        testnetNode: "Nodo testnet",
        connectWallet: "Conectar wallet",
        totalVaultBalance: "Balance total del vault",
        rangeChange: "Variación",
        activePositions: "Posiciones activas",
        totalDeploys: "Despliegues totales",
        agentStrategy: "Estrategia del agente",
        apyThreshold: "Umbral de APY",
        strategyDesc:
            "Provisión dinámica de liquidez con auto-compounding en pools de Casper testnet. Sensibilidad ajustada para eventos de baja volatilidad.",
        updateStrategy: "Actualizar estrategia",
        onchainTelemetry: "Telemetría on-chain",
        telemetrySub: "Precio de gas y latencia del nodo",
        window: "ventana",
        gasPrice: "Precio de gas",
        nodeLatency: "Latencia del nodo",
        opportunityScanner: "Escáner de oportunidades",
        clickPool: "Hacé clic en un pool para inspeccionar",
        poolName: "Pool",
        status: "Estado",
        scannerHint:
            "El agente detectó un desequilibrio de rendimiento en el pool CSPR/USDC. Despliegue programado para la próxima transición de epoch (aprox. 42 minutos).",
        reasoningFeed: "Feed de razonamiento autónomo",
        expandDrill: "Expandir para ver detalle",
        viewAudit: "Ver logs de auditoría",
        connected: "CONECTADO",
        poolDetail: "Detalle del pool",
        position: "Posición",
        rewards24h: "Rewards 24h",
        apyLast24h: "APY · últimas 24h",
        agentReasoning: "Razonamiento del agente",
        riskProfile: "Perfil de riesgo",
        impermanentLoss: "Impermanent loss",
        scRisk: "Riesgo de smart-contract",
        audited: "Auditado",
        oracleSource: "Fuente de oráculo",
        forceEntry: "Forzar entrada",
        blacklist: "Lista negra",
        inputs: "Entradas",
        reasoningTrace: "Traza de razonamiento",
        viewExplorer: "Ver en el explorer",
    },
} as const;

type Dict = { [K in keyof typeof dict.en]: string };
const LangContext = createContext<{ lang: Lang; t: Dict }>({ lang: "en", t: dict.en });
const useT = () => useContext(LangContext).t;
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { WalletConnect } from "#components/WalletConnect";
import { ProfileMenu } from "#components/ProfileOptions";



// ---------- data ----------

type Pool = {
    pair: string;
    apy: string;
    apyNum: number;
    tvl: string;
    status: string;
    tone: "emerald" | "zinc" | "brand";
    muted?: boolean;
    protocol: string;
    fee: string;
    position: string;
    rewards24h: string;
    impermanentLoss: string;
    reasoning: string;
};

const pools: Pool[] = [
    {
        pair: "CSPR / USDT",
        apy: "18.4%",
        apyNum: 18.4,
        tvl: "2.4M CSPR",
        status: "Staked",
        tone: "emerald",
        protocol: "FriendlyMarket V2",
        fee: "0.30%",
        position: "184,200 CSPR",
        rewards24h: "+42.18 CSPR",
        impermanentLoss: "0.02%",
        reasoning: "Pool con liquidez profunda y APY por encima del umbral. Mantener posición.",
    },
    {
        pair: "CSPR / WETH",
        apy: "12.1%",
        apyNum: 12.1,
        tvl: "1.8M CSPR",
        status: "Monitoring",
        tone: "zinc",
        protocol: "CSPR.swap",
        fee: "0.25%",
        position: "0 CSPR",
        rewards24h: "—",
        impermanentLoss: "n/a",
        reasoning: "APY justo por debajo del umbral. Observando volatilidad WETH para entrada.",
    },
    {
        pair: "CSPR / WCSPR",
        apy: "4.2%",
        apyNum: 4.2,
        tvl: "8.9M CSPR",
        status: "Ignored",
        tone: "zinc",
        muted: true,
        protocol: "WrapPool",
        fee: "0.05%",
        position: "0 CSPR",
        rewards24h: "—",
        impermanentLoss: "n/a",
        reasoning: "APY insuficiente. No cumple criterio mínimo de rendimiento.",
    },
    {
        pair: "CSPR / USDC",
        apy: "16.8%",
        apyNum: 16.8,
        tvl: "0.9M CSPR",
        status: "Entry queued",
        tone: "brand",
        protocol: "FriendlyMarket V2",
        fee: "0.30%",
        position: "Pending: 75,000 CSPR",
        rewards24h: "—",
        impermanentLoss: "n/a",
        reasoning: "Spread detectado vs USDT. Entrada programada para próximo epoch.",
    },
];

type Decision = {
    id: string;
    when: string;
    tx: string;
    deployHash: string;
    title: string;
    text: string;
    tone: "brand" | "emerald" | "zinc";
    status: "Success" | "Pending" | "Observation";
    inputs: { label: string; value: string }[];
    reasoning: string[];
};

const decisions: Decision[] = [
    {
        id: "d1",
        when: "Just now",
        tx: "DEPLOY_0x9a2...3f",
        deployHash: "9a2f8c4b1d7e6a3f5c9b2e8d4a1f7c6b3e9d2a8f5c1b4e7d6a9c3f8b2e5d1a4f",
        title: "Rebalance CSPR/WETH",
        text: "Detectando desequilibrio en pool CSPR/WETH. Ejecutando rebalanceo para optimizar el rendimiento.",
        tone: "brand",
        status: "Pending",
        inputs: [
            { label: "Pool", value: "CSPR/WETH" },
            { label: "Amount", value: "32,000 CSPR" },
            { label: "Slippage tol.", value: "0.50%" },
            { label: "Gas estimate", value: "1.2 CSPR" },
        ],
        reasoning: [
            "APY observado 18.7% supera umbral configurado (12.5%).",
            "Volatilidad WETH 24h por debajo de 3.1% — riesgo aceptable.",
            "Liquidez del pool >1.5M CSPR cumple criterio de profundidad.",
        ],
    },
    {
        id: "d2",
        when: "14 min ago",
        tx: "SYNC_0x4b1...8e",
        deployHash: "4b1e8d2c7f3a9b6d5e2c8a4f1b9d7e3c6a8f2b5d9c4e7a1f3b6d8c2e5a9f4b7d",
        title: "Snapshot de mercado",
        text: "Confirmed stable liquidity in CSPR/USDT. No action required for this epoch.",
        tone: "zinc",
        status: "Observation",
        inputs: [
            { label: "Pools escaneados", value: "12" },
            { label: "Oráculos", value: "CSPR.trade MCP" },
            { label: "Latencia", value: "42ms" },
        ],
        reasoning: [
            "Delta de APY en pools activos < 0.5% — sin acción necesaria.",
            "Próximo escaneo programado en 5 min.",
        ],
    },
    {
        id: "d3",
        when: "1h 12m ago",
        tx: "SWAP_0x1c4...22",
        deployHash: "1c4a2e7b9d3f6a8c5e1b4d7f2a9c6e3b8d5f1a4c7e2b9d6f3a8c5e1b4d7f2a9c",
        title: "Swap defensivo CSPR→USDT",
        text: "Swap executed: 5,000 CSPR to USDT to maintain delta-neutral positioning during volatility spike.",
        tone: "zinc",
        status: "Success",
        inputs: [
            { label: "From", value: "5,000 CSPR" },
            { label: "To", value: "62.18 USDT" },
            { label: "Slippage", value: "0.12%" },
            { label: "Gas", value: "0.9 CSPR" },
        ],
        reasoning: [
            "Spike de volatilidad +6.2% en 5 min detectado.",
            "Reducción de exposición para mantener delta-neutral.",
        ],
    },
    {
        id: "d4",
        when: "2h 45m ago",
        tx: "VLT_0xfe3...1a",
        deployHash: "fe31a8c4b7d2e9f6a3c8b5d1e7f4a2c9b6d3e8f5a1c4b7d2e9f6a3c8b5d1e7f4",
        title: "Inicialización del vault",
        text: "Vault initialized on Casper Testnet. Diagnostic checks passed. Balance verified: 1.2M CSPR.",
        tone: "emerald",
        status: "Success",
        inputs: [
            { label: "Owner", value: "0x4a92...8f2b" },
            { label: "Initial balance", value: "1,200,000 CSPR" },
            { label: "Network", value: "casper-test" },
        ],
        reasoning: [
            "Despliegue YieldVault Odra exitoso.",
            "Health-check: balance, ownership y action counter verificados.",
        ],
    },
];

// Trend data generators
const RANGES = ["1H", "24H", "7D", "30D"] as const;
type Range = (typeof RANGES)[number];

function buildSeries(range: Range) {
    const points = range === "1H" ? 12 : range === "24H" ? 24 : range === "7D" ? 28 : 30;
    const base = 1_180_000;
    const data = [];
    for (let i = 0; i < points; i++) {
        const drift = Math.sin(i / 2.4) * 18000 + Math.cos(i / 1.7) * 9000;
        const growth = (i / points) * 60000;
        const noise = (Math.sin(i * 7.13) + Math.cos(i * 3.11)) * 4000;
        data.push({
            idx: i,
            label:
                range === "1H"
                    ? `${(i * 5).toString().padStart(2, "0")}m`
                    : range === "24H"
                        ? `${i.toString().padStart(2, "0")}h`
                        : range === "7D"
                            ? `D${Math.floor(i / 4) + 1}`
                            : `D${i + 1}`,
            balance: Math.round(base + drift + growth + noise),
            gas: Math.max(0.6, 1.1 + Math.sin(i / 2) * 0.35 + Math.cos(i / 5) * 0.12),
            latency: Math.round(38 + Math.sin(i / 3) * 9 + Math.cos(i / 1.4) * 4),
        });
    }
    return data;
}

// ---------- components ----------

function StatusBadge({ status, tone }: { status: string; tone: string }) {
    const map: Record<string, string> = {
        emerald: "bg-emerald-500/10 text-emerald-500",
        zinc: "bg-zinc-800 text-zinc-500",
        brand: "bg-brand/10 text-brand",
    };
    return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${map[tone]}`}>
            {status}
        </span>
    );
}

function RangePicker({ value, onChange }: { value: Range; onChange: (r: Range) => void }) {
    return (
        <div className="inline-flex items-center rounded-lg border border-zinc-800 bg-zinc-900/40 p-0.5">
            {RANGES.map((r) => (
                <button
                    key={r}
                    onClick={() => onChange(r)}
                    className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider rounded-md transition-colors ${value === r
                        ? "bg-brand text-zinc-950"
                        : "text-zinc-500 hover:text-zinc-300"
                        }`}
                >
                    {r}
                </button>
            ))}
        </div>
    );
}

function ChartTooltip({ active, payload, label, unit }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-md border border-zinc-800 bg-zinc-950/95 px-3 py-2 text-[11px] font-mono shadow-xl">
            <div className="text-zinc-500 uppercase tracking-wider text-[9px] mb-1">{label}</div>
            {payload.map((p: any) => (
                <div key={p.dataKey} className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full" style={{ background: p.color }} />
                    <span className="text-zinc-200">
                        {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
                        {unit}
                    </span>
                </div>
            ))}
        </div>
    );
}

function PoolDetailSheet({ pool, onClose }: { pool: Pool | null; onClose: () => void }) {
    const t = useT();
    return (
        <Sheet open={!!pool} onOpenChange={(o) => !o && onClose()}>
            <SheetContent
                side="right"
                className="w-full sm:max-w-md bg-zinc-950 border-l border-zinc-900 text-zinc-300 p-0 overflow-y-auto"
            >
                {pool && (
                    <>
                        <SheetHeader className="px-6 py-5 border-b border-zinc-900 text-left">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                                    {t.poolDetail}
                                </span>
                                <button
                                    onClick={onClose}
                                    className="size-7 grid place-items-center rounded-md hover:bg-zinc-900 text-zinc-500"
                                    aria-label="Close"
                                >
                                    <X className="size-4" />
                                </button>
                            </div>
                            <SheetTitle className="text-zinc-100 text-xl font-medium tracking-tight">
                                {pool.pair}
                            </SheetTitle>
                            <SheetDescription className="text-xs text-zinc-500 font-mono">
                                {pool.protocol} · Fee {pool.fee}
                            </SheetDescription>
                            <div className="pt-2">
                                <StatusBadge status={pool.status} tone={pool.tone} />
                            </div>
                        </SheetHeader>

                        <div className="px-6 py-5 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-lg border border-zinc-900 bg-zinc-900/30 p-4">
                                    <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
                                        APY
                                    </div>
                                    <div className="text-2xl font-mono text-emerald-400">{pool.apy}</div>
                                </div>
                                <div className="rounded-lg border border-zinc-900 bg-zinc-900/30 p-4">
                                    <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
                                        TVL
                                    </div>
                                    <div className="text-2xl font-mono text-zinc-100">{pool.tvl}</div>
                                </div>
                                <div className="rounded-lg border border-zinc-900 bg-zinc-900/30 p-4">
                                    <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
                                        {t.position}
                                    </div>
                                    <div className="text-sm font-mono text-zinc-200">{pool.position}</div>
                                </div>
                                <div className="rounded-lg border border-zinc-900 bg-zinc-900/30 p-4">
                                    <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
                                        {t.rewards24h}
                                    </div>
                                    <div className="text-sm font-mono text-emerald-400">{pool.rewards24h}</div>
                                </div>
                            </div>

                            <div>
                                <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-3">
                                    {t.apyLast24h}
                                </div>
                                <div className="h-32 rounded-lg border border-zinc-900 bg-zinc-900/20 p-2">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart
                                            data={Array.from({ length: 24 }, (_, i) => ({
                                                i,
                                                v: pool.apyNum + Math.sin(i / 2.1) * 1.2 + Math.cos(i / 1.3) * 0.6,
                                            }))}
                                        >
                                            <defs>
                                                <linearGradient id="pa" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#ff2d2d" stopOpacity={0.4} />
                                                    <stop offset="100%" stopColor="#ff2d2d" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <Area
                                                type="monotone"
                                                dataKey="v"
                                                stroke="#ff2d2d"
                                                strokeWidth={1.5}
                                                fill="url(#pa)"
                                            />
                                            <Tooltip content={<ChartTooltip unit="%" />} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div>
                                <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
                                    {t.agentReasoning}
                                </div>
                                <p className="text-sm text-zinc-300 leading-relaxed text-pretty">
                                    {pool.reasoning}
                                </p>
                            </div>

                            <div className="rounded-lg border border-zinc-900 bg-zinc-900/30 p-4">
                                <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
                                    {t.riskProfile}
                                </div>
                                <div className="space-y-2 text-xs font-mono">
                                    <div className="flex justify-between">
                                        <span className="text-zinc-500">{t.impermanentLoss}</span>
                                        <span className="text-zinc-200">{pool.impermanentLoss}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-500">{t.scRisk}</span>
                                        <span className="text-emerald-400">{t.audited}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-500">{t.oracleSource}</span>
                                        <span className="text-zinc-200">CSPR.trade MCP</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 pb-4">
                                <button className="flex-1 py-2 px-3 bg-brand text-zinc-950 text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity">
                                    {t.forceEntry}
                                </button>
                                <button className="flex-1 py-2 px-3 border border-zinc-800 text-zinc-300 text-sm font-medium rounded-lg hover:bg-zinc-900 transition-colors">
                                    {t.blacklist}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}

function DecisionRow({ d }: { d: Decision }) {
    const [open, setOpen] = useState(false);
    const t = useT();
    const ringColor =
        d.tone === "brand"
            ? "border-brand"
            : d.tone === "emerald"
                ? "border-emerald-500/50"
                : "border-zinc-800";
    const dotColor =
        d.tone === "brand" ? "bg-brand" : d.tone === "emerald" ? "bg-emerald-500" : "bg-zinc-800";
    const whenColor =
        d.tone === "brand"
            ? "text-brand"
            : d.tone === "emerald"
                ? "text-emerald-500/70"
                : "text-zinc-500";
    const statusMap = {
        Success: "bg-emerald-500/10 text-emerald-500",
        Pending: "bg-brand/10 text-brand",
        Observation: "bg-zinc-800 text-zinc-400",
    } as const;

    return (
        <Collapsible open={open} onOpenChange={setOpen}>
            <div className="relative pl-8">
                <div
                    className={`absolute left-0 top-1 size-6 rounded-full bg-zinc-950 border-2 ${ringColor} flex items-center justify-center`}
                >
                    <div className={`size-1.5 rounded-full ${dotColor}`} />
                </div>
                <CollapsibleTrigger className="w-full text-left group">
                    <div className="flex justify-between items-start mb-1 gap-3">
                        <span className={`text-xs font-mono ${whenColor}`}>{d.when}</span>
                        <div className="flex items-center gap-2">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${statusMap[d.status]}`}>
                                {d.status}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-600">{d.tx}</span>
                            {open ? (
                                <ChevronDown className="size-3.5 text-zinc-500" />
                            ) : (
                                <ChevronRight className="size-3.5 text-zinc-500" />
                            )}
                        </div>
                    </div>
                    <div className="text-sm text-zinc-200 font-medium mb-1">{d.title}</div>
                    <p className="text-xs text-zinc-500 text-pretty leading-relaxed">{d.text}</p>
                </CollapsibleTrigger>

                <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                    <div className="mt-4 space-y-4 rounded-lg border border-zinc-900 bg-zinc-900/30 p-4">
                        <div>
                            <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">
                                {t.inputs}
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs font-mono">
                                {d.inputs.map((i) => (
                                    <div key={i.label} className="flex justify-between">
                                        <span className="text-zinc-500">{i.label}</span>
                                        <span className="text-zinc-200">{i.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">
                                {t.reasoningTrace}
                            </div>
                            <ul className="space-y-1.5">
                                {d.reasoning.map((r, idx) => (
                                    <li key={idx} className="text-xs text-zinc-400 flex gap-2">
                                        <span className="text-brand font-mono">›</span>
                                        <span className="text-pretty">{r}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="pt-2 border-t border-zinc-900 flex items-center justify-between">
                            <span className="text-[10px] font-mono text-zinc-600 truncate max-w-[60%]" title={d.deployHash}>
                                {d.deployHash.slice(0, 18)}…
                            </span>
                            <a
                                href={`${EXPLORER}${d.deployHash}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] font-mono uppercase tracking-wider text-brand hover:underline flex items-center gap-1"
                            >
                                {t.viewExplorer} <ExternalLink className="size-3" />
                            </a>
                        </div>
                    </div>
                </CollapsibleContent>
            </div>
        </Collapsible>
    );
}

// ---------- main ----------

export const Dashboard = () => {
    const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
    const [range, setRange] = useState<Range>("24H");
    const series = useMemo(() => buildSeries(range), [range]);
    const [walletConnected, setWalletConnected] = useState(false);
    const [walletAddress, setWalletAddress] = useState("");
    const disconnectWallet = async () => {
        try {
            const providerFactory = (window as any).CasperWalletProvider;

            if (providerFactory) {
                const provider =
                    typeof providerFactory === "function"
                        ? providerFactory(window)
                        : providerFactory;

                if (provider.disconnect) {
                    await provider.disconnect();
                }

                if (provider.requestDisconnect) {
                    await provider.requestDisconnect();
                }
            }
        } catch (err) {
            console.error(err);
        }

        setWalletConnected(false);
        setWalletAddress("");
    };
    const connectWallet = async () => {
        try {
            const providerFactory = window.CasperWalletProvider;

            if (!providerFactory) {
                alert("Wallet no encontrada");
                return;
            }

            const provider =
                typeof providerFactory === "function"
                    ? providerFactory(window)
                    : providerFactory;

            console.log("provider:", provider);

            await provider.requestConnection();

            const publicKey =
                await provider.getActivePublicKey?.() ||
                await provider.requestActivePublicKey?.();

            if (!publicKey) {
                alert("No pude obtener public key");
                return;
            }

            setWalletAddress(String(publicKey));
            setWalletConnected(true);

            console.log("Connected:", publicKey);

        } catch (err) {
            console.error("Wallet error:", err);
        }
    };
    const [nextCycle, setNextCycle] = useState(42);
    const [lang, setLang] = useState<Lang>("en");
    const t = dict[lang];

    useEffect(() => {
        const id = setInterval(() => {
            setNextCycle((s) => (s <= 1 ? 60 : s - 1));
        }, 1000);
        return () => clearInterval(id);
    }, []);

    const truncatedWallet = "0x4a92…8f2b";

    return (
        <LangContext.Provider value={{ lang, t }}>
            <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans selection:bg-brand/30 pb-16">
                <nav className="border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-sm sticky top-0 z-30">
                    <div className="mx-auto max-w-7xl px-6 h-14 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="size-6 bg-brand rounded-sm flex items-center justify-center">
                                <div className="size-2 bg-zinc-950 rounded-full" />
                            </div>
                            <span className="font-medium text-zinc-100 tracking-tight">Casper Autopilot</span>
                            <div className="h-4 w-px bg-zinc-800 mx-2" />
                            <div className="flex items-center gap-2">
                                <div className="size-2 rounded-full bg-emerald-500 animate-pulse-soft" />
                                <span className="text-xs font-mono uppercase tracking-wider text-emerald-500/80">
                                    {t.agentActive}
                                </span>
                            </div>
                            <div className="hidden md:flex items-center gap-2 pl-3 ml-1 border-l border-zinc-800">
                                <span className="text-[10px] uppercase tracking-widest text-zinc-500">
                                    {t.nextCycle}
                                </span>
                                <span className="text-xs font-mono text-zinc-200 tabular-nums">
                                    {String(Math.floor(nextCycle / 60)).padStart(2, "0")}:
                                    {String(nextCycle % 60).padStart(2, "0")}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex flex-col items-end">
                                <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">
                                    {t.testnetNode}
                                </span>
                                <span className="text-xs font-mono text-zinc-300">casper-test-03</span>
                            </div>
                            <div className="inline-flex items-center rounded-lg border border-zinc-800 bg-zinc-900/40 p-0.5">
                                {(["en", "es"] as const).map((l) => (
                                    <button
                                        key={l}
                                        onClick={() => setLang(l)}
                                        className={`px-2 py-1 text-[10px] font-mono uppercase tracking-wider rounded-md transition-colors ${lang === l ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
                                            }`}
                                        aria-pressed={lang === l}
                                    >
                                        {l}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-4">
                                {walletConnected ? (
                                    <ProfileMenu
                                        walletAddress={walletAddress}
                                        onDisconnect={disconnectWallet}
                                    />
                                ) : (
                                    <WalletConnect
                                        connectWallet={t.connectWallet}
                                        onConnected={(address) => {
                                            setWalletAddress(address);
                                            setWalletConnected(true);
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                <main className="mx-auto max-w-7xl px-6 py-10">
                    <h1 className="sr-only">Casper Autopilot Dashboard</h1>

                    {/* Hero */}
                    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        <div className="md:col-span-2 p-6 rounded-xl bg-zinc-900/50 border border-zinc-800 flex flex-col justify-between">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-xs font-medium uppercase tracking-widest text-zinc-500 mb-4">
                                        Total Vault Balance
                                    </h2>
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-5xl font-medium text-zinc-100 tracking-tight leading-none tabular-nums">
                                            1,240,482.12
                                        </span>
                                        <span className="text-xl font-mono text-brand">CSPR</span>
                                    </div>
                                    <p className="mt-2 text-sm text-zinc-500 font-mono">≈ $42,176.38 USD</p>
                                    <div className="mt-3 flex items-center gap-4 text-xs font-mono">
                                        <div className="flex items-center gap-2">
                                            <span className="size-1.5 rounded-full bg-brand" />
                                            <span className="text-zinc-500">CSPR</span>
                                            <span className="text-zinc-200">982,140.00</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="size-1.5 rounded-full bg-emerald-400" />
                                            <span className="text-zinc-500">sCSPR</span>
                                            <span className="text-zinc-200">258,342.12</span>
                                        </div>
                                    </div>
                                </div>
                                <RangePicker value={range} onChange={setRange} />
                            </div>

                            <div className="mt-6 h-40">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={series} margin={{ top: 10, right: 4, left: -16, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="bal" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#ff2d2d" stopOpacity={0.45} />
                                                <stop offset="100%" stopColor="#ff2d2d" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid stroke="#18181b" vertical={false} />
                                        <XAxis
                                            dataKey="label"
                                            stroke="#52525b"
                                            tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }}
                                            tickLine={false}
                                            axisLine={false}
                                            interval="preserveStartEnd"
                                        />
                                        <YAxis
                                            stroke="#52525b"
                                            tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                                            width={48}
                                        />
                                        <Tooltip content={<ChartTooltip unit=" CSPR" />} cursor={{ stroke: "#3f3f46" }} />
                                        <Area
                                            type="monotone"
                                            dataKey="balance"
                                            stroke="#ff2d2d"
                                            strokeWidth={1.8}
                                            fill="url(#bal)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="mt-4 flex gap-8 border-t border-zinc-800 pt-5">
                                <div>
                                    <span className="block text-[10px] uppercase text-zinc-500 mb-1">{range} {t.rangeChange}</span>
                                    <span className="text-sm font-mono text-emerald-400">+4.2%</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] uppercase text-zinc-500 mb-1">{t.activePositions}</span>
                                    <span className="text-sm font-mono text-zinc-200">06</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] uppercase text-zinc-500 mb-1">{t.totalDeploys}</span>
                                    <span className="text-sm font-mono text-zinc-200">1,402</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 rounded-xl bg-brand/5 border border-brand/20">
                            <h2 className="text-xs font-medium uppercase tracking-widest text-brand mb-4">
                                {t.agentStrategy}
                            </h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-zinc-300">{t.apyThreshold}</span>
                                    <span className="text-sm font-mono text-brand">&gt;12.5%</span>
                                </div>
                                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                                    <div className="w-3/4 h-full bg-brand" />
                                </div>
                                <p className="text-xs text-zinc-400 leading-relaxed text-pretty pt-2">
                                    {t.strategyDesc}
                                </p>
                                <button className="w-full mt-2 py-2 px-3 bg-brand text-zinc-950 text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity">
                                    {t.updateStrategy}
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* On-chain telemetry trends */}
                    <section className="mb-12">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-sm font-medium text-zinc-100">{t.onchainTelemetry}</h3>
                                <p className="text-[10px] font-mono text-zinc-500 mt-0.5">
                                    {t.telemetrySub} · {range} {t.window}
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="rounded-xl border border-zinc-900 bg-zinc-900/30 p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] uppercase tracking-widest text-zinc-500">
                                        {t.gasPrice}
                                    </span>
                                    <span className="text-xs font-mono text-zinc-200">1.2 gwei</span>
                                </div>
                                <div className="h-28">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={series} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
                                            <CartesianGrid stroke="#18181b" vertical={false} />
                                            <XAxis
                                                dataKey="label"
                                                stroke="#52525b"
                                                tick={{ fontSize: 9, fontFamily: "JetBrains Mono" }}
                                                tickLine={false}
                                                axisLine={false}
                                                interval="preserveStartEnd"
                                            />
                                            <YAxis
                                                stroke="#52525b"
                                                tick={{ fontSize: 9, fontFamily: "JetBrains Mono" }}
                                                tickLine={false}
                                                axisLine={false}
                                                width={36}
                                            />
                                            <Tooltip content={<ChartTooltip unit=" gwei" />} cursor={{ stroke: "#3f3f46" }} />
                                            <Line
                                                type="monotone"
                                                dataKey="gas"
                                                stroke="#10b981"
                                                strokeWidth={1.5}
                                                dot={false}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="rounded-xl border border-zinc-900 bg-zinc-900/30 p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] uppercase tracking-widest text-zinc-500">
                                        {t.nodeLatency}
                                    </span>
                                    <span className="text-xs font-mono text-zinc-200">42 ms</span>
                                </div>
                                <div className="h-28">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={series} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
                                            <CartesianGrid stroke="#18181b" vertical={false} />
                                            <XAxis
                                                dataKey="label"
                                                stroke="#52525b"
                                                tick={{ fontSize: 9, fontFamily: "JetBrains Mono" }}
                                                tickLine={false}
                                                axisLine={false}
                                                interval="preserveStartEnd"
                                            />
                                            <YAxis
                                                stroke="#52525b"
                                                tick={{ fontSize: 9, fontFamily: "JetBrains Mono" }}
                                                tickLine={false}
                                                axisLine={false}
                                                width={36}
                                            />
                                            <Tooltip content={<ChartTooltip unit=" ms" />} cursor={{ stroke: "#3f3f46" }} />
                                            <Line
                                                type="monotone"
                                                dataKey="latency"
                                                stroke="#ff2d2d"
                                                strokeWidth={1.5}
                                                dot={false}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Scanner + Decisions */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        <div className="lg:col-span-7 space-y-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-zinc-100">{t.opportunityScanner}</h3>
                                <span className="text-[10px] font-mono text-zinc-500">{t.clickPool}</span>
                            </div>

                            <div className="overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-zinc-900 bg-zinc-900/30">
                                            <th className="px-4 py-3 font-medium text-zinc-500 text-xs uppercase">{t.poolName}</th>
                                            <th className="px-4 py-3 font-medium text-zinc-500 text-xs uppercase">APY</th>
                                            <th className="px-4 py-3 font-medium text-zinc-500 text-xs uppercase">TVL</th>
                                            <th className="px-4 py-3 font-medium text-zinc-500 text-xs uppercase text-right">
                                                {t.status}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-900/50">
                                        {pools.map((p) => (
                                            <tr
                                                key={p.pair}
                                                onClick={() => setSelectedPool(p)}
                                                className={`cursor-pointer transition-colors ${selectedPool?.pair === p.pair
                                                    ? "bg-zinc-900/60"
                                                    : "hover:bg-zinc-900/40"
                                                    }`}
                                            >
                                                <td className="px-4 py-4 font-medium text-zinc-200">{p.pair}</td>
                                                <td
                                                    className={`px-4 py-4 font-mono ${p.muted ? "text-zinc-400" : "text-emerald-400"
                                                        }`}
                                                >
                                                    {p.apy}
                                                </td>
                                                <td className="px-4 py-4 font-mono text-zinc-400 text-xs">{p.tvl}</td>
                                                <td className="px-4 py-4 text-right">
                                                    <StatusBadge status={p.status} tone={p.tone} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="p-4 rounded-xl bg-zinc-900/20 border border-zinc-900 flex items-center gap-4">
                                <div className="shrink-0 size-8 rounded-full bg-zinc-800 flex items-center justify-center">
                                    <Info className="size-4 text-zinc-500" />
                                </div>
                                <p className="text-xs text-zinc-500 text-pretty">
                                    {t.scannerHint}
                                </p>
                            </div>
                        </div>

                        <div className="lg:col-span-5">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-sm font-medium text-zinc-100">{t.reasoningFeed}</h3>
                                <span className="text-[10px] font-mono text-zinc-500">{t.expandDrill}</span>
                            </div>

                            <div className="space-y-6 relative">
                                <div className="absolute left-[11px] top-2 bottom-2 w-px bg-zinc-900" />
                                {decisions.map((d) => (
                                    <DecisionRow key={d.id} d={d} />
                                ))}
                            </div>

                            <button className="w-full mt-10 py-3 border border-zinc-900 text-xs font-medium uppercase tracking-widest text-zinc-500 rounded-lg hover:text-zinc-300 hover:border-zinc-700 transition-colors">
                                {t.viewAudit}
                            </button>
                        </div>
                    </div>
                </main>

                <footer className="fixed bottom-0 left-0 right-0 border-t border-zinc-900 bg-zinc-950/80 backdrop-blur-md z-30">
                    <div className="mx-auto max-w-7xl px-6 h-10 flex items-center justify-between text-[10px] font-mono text-zinc-600">
                        <div className="flex gap-6">
                            <span>LATENCY: 42ms</span>
                            <span>GAS PRICE: 1.2 GWEI</span>
                            <span>EPOCH: 4812</span>
                        </div>
                        <div className="flex gap-4">
                            <span className="text-emerald-500/60">{t.connected}</span>
                            <span>v0.12.4-BETA</span>
                        </div>
                    </div>
                </footer>

                <PoolDetailSheet pool={selectedPool} onClose={() => setSelectedPool(null)} />
            </div>
        </LangContext.Provider>
    );
}
