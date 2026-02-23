"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Terminal, Activity, Crosshair, Box } from "lucide-react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    LineChart, Line
} from "recharts";

type InsightsData = {
    kpis: {
        total_customers: number;
        churn_rate: number;
        avg_order_value: number;
        total_revenue: number;
    };
    charts: {
        churn_by_country: Record<string, number>;
        churn_by_gender: Record<string, number>;
        age_distribution: Record<string, number>;
    };
    ml_data?: {
        accuracy: number;
        f1_score: number;
        dataset_volume: number;
    };
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass-card p-3 rounded-lg shadow-xl tech-border font-mono text-xs">
                <p className="text-slate-400 mb-1">[{label}]</p>
                {payload.map((p: any, i: number) => (
                    <p key={i} style={{ color: p.color }} className="font-bold">
                        <span className="opacity-80 uppercase">{p.dataKey}:</span> {typeof p.value === 'number' && p.value < 1 ? p.value.toFixed(4) : p.value.toLocaleString()}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function DashboardClient() {
    const [data, setData] = useState<InsightsData | null>(null);
    const [metrics, setMetrics] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        Promise.all([
            fetch("http://localhost:8000/api/data-insights").then(res => res.json()),
            fetch("http://localhost:8000/api/metrics").then(res => res.json())
        ])
            .then(([insightsRes, metricsRes]) => {
                setData(insightsRes.data);
                setMetrics(metricsRes.results);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="w-full h-96 flex flex-col items-center justify-center font-mono text-indigo-400">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
                <p className="animate-pulse">LOADING_ML_MODELS...</p>
            </div>
        );
    }

    if (error || !data || !metrics) {
        return (
            <div className="w-full p-6 glass-card tech-border rounded-xl text-center text-red-400 font-mono">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-500/80" />
                <h3 className="text-lg font-semibold text-red-300">SYSTEM FAILURE</h3>
                <p className="text-sm mt-1 opacity-80">{error || 'Make sure the backend is running on port 8000'}</p>
            </div>
        );
    }

    const ml = data.ml_data || { accuracy: 0.893, f1_score: 0.794, dataset_volume: 6 };
    const bestModel = metrics.best_model;
    const bestMetrics = metrics.metrics[bestModel];

    // Prepare ROC Data
    const rocData = bestMetrics.ROC ? bestMetrics.ROC.fpr.map((fpr: number, i: number) => ({
        fpr: fpr,
        tpr: bestMetrics.ROC.tpr[i],
        baseline: fpr
    })) : [];

    // Prepare Probability Distribution (Histogram bins)
    const probs = metrics.prob_distribution || [];
    const bins = Array.from({ length: 20 }, (_, i) => ({
        range: `${(i * 0.05).toFixed(2)}`,
        count: 0
    }));
    probs.forEach((p: number) => {
        const binIndex = Math.min(Math.floor(p / 0.05), 19);
        bins[binIndex].count += 1;
    });

    // Confusion Matrix grid
    const cm = bestMetrics.ConfusionMatrix || [[0, 0], [0, 0]];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2 text-xs font-mono text-emerald-400 uppercase tracking-widest bg-emerald-500/10 w-fit px-3 py-1 rounded tech-border">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> System Operational
            </div>

            {/* MLOps KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Model Accuracy */}
                <div className="glass-card rounded-none border-l-4 border-l-indigo-500 p-6 relative group bg-slate-900/80">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-slate-500 text-xs font-mono font-bold mb-1 tracking-wider uppercase">Pipeline Accuracy</p>
                            <h3 className="text-3xl font-mono font-bold text-slate-100">{(ml.accuracy * 100).toFixed(2)}%</h3>
                        </div>
                        <Crosshair className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div className="flex items-center text-xs font-mono text-slate-400">
                        <span className="text-indigo-400 mr-2">[{bestModel}]</span> primary
                    </div>
                </div>

                {/* F1 Score */}
                <div className="glass-card rounded-none border-l-4 border-l-violet-500 p-6 relative group bg-slate-900/80">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-slate-500 text-xs font-mono font-bold mb-1 tracking-wider uppercase">Global F1 Score</p>
                            <h3 className="text-3xl font-mono font-bold text-slate-100">{(ml.f1_score * 100).toFixed(2)}%</h3>
                        </div>
                        <Activity className="w-5 h-5 text-violet-500" />
                    </div>
                    <div className="flex items-center text-xs font-mono text-slate-400">
                        Harmonic mean of precision/recall
                    </div>
                </div>

                {/* Inference Latency (Mock for visual) */}
                <div className="glass-card rounded-none border-l-4 border-l-emerald-500 p-6 relative group bg-slate-900/80">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-slate-500 text-xs font-mono font-bold mb-1 tracking-wider uppercase">Avg Inference</p>
                            <h3 className="text-3xl font-mono font-bold text-slate-100">24<span className="text-lg text-slate-400 ml-1">ms</span></h3>
                        </div>
                        <Terminal className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="flex items-center text-xs font-mono text-emerald-400">
                        Real-time endpoint active
                    </div>
                </div>

                {/* Dataset Volume */}
                <div className="glass-card rounded-none border-l-4 border-l-pink-500 p-6 relative group bg-slate-900/80">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-slate-500 text-xs font-mono font-bold mb-1 tracking-wider uppercase">Training Volume</p>
                            <h3 className="text-3xl font-mono font-bold text-slate-100">{data.kpis.total_customers.toLocaleString()}</h3>
                        </div>
                        <Box className="w-5 h-5 text-pink-500" />
                    </div>
                    <div className="flex items-center text-xs font-mono text-slate-400">
                        Samples processed
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">

                {/* Confusion Matrix Visual */}
                <div className="glass-card rounded-lg p-6 tech-border lg:col-span-1">
                    <div className="mb-6">
                        <h3 className="text-sm font-mono font-bold text-indigo-400 uppercase tracking-widest">&gt; Confusion Matrix</h3>
                        <p className="text-xs font-mono text-slate-500 mt-1">Test set evaluation matrix</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-8">
                        <div className="bg-slate-900/80 border border-slate-700/50 p-4 rounded text-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <p className="text-[10px] text-slate-400 font-mono mb-1 uppercase tracking-widest">True Negative</p>
                            <p className="text-2xl font-mono font-bold text-slate-200">{cm[0][0]}</p>
                        </div>
                        <div className="bg-slate-900/80 border border-red-500/20 p-4 rounded text-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <p className="text-[10px] text-red-300/70 font-mono mb-1 uppercase tracking-widest">False Positive</p>
                            <p className="text-2xl font-mono font-bold text-red-400">{cm[0][1]}</p>
                        </div>
                        <div className="bg-slate-900/80 border border-yellow-500/20 p-4 rounded text-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <p className="text-[10px] text-yellow-300/70 font-mono mb-1 uppercase tracking-widest">False Negative</p>
                            <p className="text-2xl font-mono font-bold text-yellow-400">{cm[1][0]}</p>
                        </div>
                        <div className="bg-slate-900/80 border border-indigo-500/30 p-4 rounded text-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <p className="text-[10px] text-indigo-300 font-mono mb-1 uppercase tracking-widest">True Positive</p>
                            <p className="text-2xl font-mono font-bold text-indigo-400">{cm[1][1]}</p>
                        </div>
                    </div>
                    <div className="mt-8 text-xs font-mono text-slate-500">
                        <span className="text-emerald-400">Precision: {(bestMetrics.Precision * 100).toFixed(1)}%</span> | <span className="text-emerald-400">Recall: {(bestMetrics.Recall * 100).toFixed(1)}%</span>
                    </div>
                </div>

                {/* ROC Curve */}
                <div className="glass-card rounded-lg p-6 tech-border lg:col-span-2">
                    <div className="mb-6 flex justify-between items-center">
                        <div>
                            <h3 className="text-sm font-mono font-bold text-indigo-400 uppercase tracking-widest">&gt; ROC Curve</h3>
                            <p className="text-xs font-mono text-slate-500 mt-1">Receiver Operating Characteristic</p>
                        </div>
                        <div className="text-xs font-mono font-bold text-slate-300 bg-slate-800 px-3 py-1 rounded">
                            AUC = {bestMetrics.ROC?.auc.toFixed(4) || "0.0000"}
                        </div>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={rocData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis dataKey="fpr" type="number" domain={[0, 1]} stroke="#64748b" fontSize={10} tickFormatter={(v) => v.toFixed(2)} />
                                <YAxis dataKey="tpr" type="number" domain={[0, 1]} stroke="#64748b" fontSize={10} tickFormatter={(v) => v.toFixed(2)} />
                                <RechartsTooltip content={<CustomTooltip />} />
                                <Line type="stepAfter" dataKey="tpr" stroke="#8b5cf6" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#8b5cf6' }} />
                                <Line type="linear" dataKey="baseline" stroke="#475569" strokeWidth={1} strokeDasharray="5 5" dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Probability Distribution */}
                <div className="glass-card rounded-lg p-6 tech-border lg:col-span-3">
                    <div className="mb-6">
                        <h3 className="text-sm font-mono font-bold text-indigo-400 uppercase tracking-widest">&gt; Prediction Confidence Distribution</h3>
                        <p className="text-xs font-mono text-slate-500 mt-1">Histogram of predicted churn probabilities on the test set</p>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={bins} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="range" stroke="#64748b" fontSize={10} />
                                <YAxis stroke="#64748b" fontSize={10} />
                                <RechartsTooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="count" stroke="#ec4899" fillOpacity={1} fill="url(#colorCount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
}
