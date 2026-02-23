"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, TrendingUp, CheckCircle, Crosshair } from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

export default function MetricsPage() {
    const [data, setData] = useState<{ metrics: any; best_model: string; feature_importances: any } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/metrics`)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch data");
                return res.json();
            })
            .then((data) => {
                setData(data.results);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center p-8 text-center text-slate-400 flex-col">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
                <p className="animate-pulse">Training models and evaluating metrics. This may take a few seconds...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="p-8">
                <div className="w-full p-6 glass-card border border-red-500/30 rounded-xl text-center text-red-400">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-500/80" />
                    <h3 className="text-lg font-semibold text-red-300">Failed to load metrics data</h3>
                    <p className="text-sm mt-1 opacity-80">{error}</p>
                </div>
            </div>
        );
    }

    const { metrics, best_model, feature_importances } = data;

    // Format chart data for model comparison
    const comparisonData = [
        {
            name: "Logistic Regression",
            Accuracy: metrics["Logistic Regression"].Accuracy * 100,
            F1_Score: metrics["Logistic Regression"].F1_Score * 100,
            Precision: metrics["Logistic Regression"].Precision * 100,
            Recall: metrics["Logistic Regression"].Recall * 100,
        },
        {
            name: "Decision Tree",
            Accuracy: metrics["Decision Tree"].Accuracy * 100,
            F1_Score: metrics["Decision Tree"].F1_Score * 100,
            Precision: metrics["Decision Tree"].Precision * 100,
            Recall: metrics["Decision Tree"].Recall * 100,
        },
        {
            name: "Random Forest",
            Accuracy: metrics["Random Forest"].Accuracy * 100,
            F1_Score: metrics["Random Forest"].F1_Score * 100,
            Precision: metrics["Random Forest"].Precision * 100,
            Recall: metrics["Random Forest"].Recall * 100,
        }
    ];

    // Format Feature Importance chart
    const importanceData = Object.entries(feature_importances)
        .map(([feature, importance]) => ({
            name: feature.replace(/_/g, " "),
            importance: Number(importance)
        }))
        .sort((a, b) => b.importance - a.importance)
        .slice(0, 10);

    return (
        <div className="p-8 max-w-7xl mx-auto w-full">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-slate-100">
                    Model <span className="gradient-text">Evaluation Metrics</span>
                </h1>
                <p className="text-slate-400 mt-2">
                    Comparison of Machine Learning models trained on the e-commerce customer dataset.
                </p>
            </div>

            {/* Best Model Header */}
            <div className="glass-card rounded-2xl p-6 border border-emerald-500/40 bg-emerald-500/5 mb-8 flex flex-col md:flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-sm text-emerald-400 font-bold tracking-widest uppercase mb-1">Selected Primary Model</p>
                        <h2 className="text-3xl font-bold text-slate-100">{best_model}</h2>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-6 md:mt-0">
                    <div className="bg-slate-900/50 rounded-xl py-3 px-6 border border-slate-700/50 text-center">
                        <p className="text-sm text-slate-400 font-semibold mb-1">Accuracy</p>
                        <p className="text-2xl font-bold text-slate-100">{(metrics[best_model].Accuracy * 100).toFixed(1)}%</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-xl py-3 px-6 border border-slate-700/50 text-center">
                        <p className="text-sm text-slate-400 font-semibold mb-1">F1 Score</p>
                        <p className="text-2xl font-bold text-slate-100">{(metrics[best_model].F1_Score * 100).toFixed(1)}%</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
                {/* Radar/Bar Comparison */}
                <div className="glass-card rounded-2xl p-6 border border-slate-700/50">
                    <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
                        <Crosshair className="w-5 h-5 text-indigo-400" /> Algorithm Comparison
                    </h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={comparisonData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', borderColor: 'rgba(99, 102, 241, 0.3)', borderRadius: '8px' }}
                                    itemStyle={{ color: '#f8fafc' }}
                                />
                                <Legend iconType="circle" />
                                <Bar dataKey="Accuracy" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="F1_Score" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Recall" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Feature Importance */}
                <div className="glass-card rounded-2xl p-6 border border-slate-700/50">
                    <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-400" /> Feature Importance (Top 10)
                    </h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={importanceData} margin={{ top: 10, right: 30, left: 60, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
                                <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} width={120} />
                                <Tooltip
                                    formatter={(value: any) => typeof value === 'number' ? value.toFixed(4) : value}
                                    contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', borderColor: 'rgba(16, 185, 129, 0.3)', borderRadius: '8px' }}
                                />
                                <Bar dataKey="importance" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Detailed Metrics Table */}
            <div className="glass-card rounded-2xl overflow-hidden border border-slate-700/50">
                <div className="p-6 border-b border-slate-700/50">
                    <h3 className="text-lg font-bold text-slate-200">Detailed Classification & Regression Metrics</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-900/80 text-slate-400">
                            <tr>
                                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Model Name</th>
                                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Accuracy</th>
                                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Precision</th>
                                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Recall</th>
                                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-indigo-400">F1 Score</th>
                                <th className="px-6 py-4 font-semibold uppercase tracking-wider">R² (Linear)</th>
                                <th className="px-6 py-4 font-semibold uppercase tracking-wider">MSE</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {['Logistic Regression', 'Decision Tree', 'Random Forest'].map((modelName) => (
                                <tr key={modelName} className={`hover:bg-slate-800/30 transition-colors ${best_model === modelName ? 'bg-indigo-500/5' : ''}`}>
                                    <td className="px-6 py-4 font-medium text-slate-200 flex items-center gap-2">
                                        {best_model === modelName && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
                                        {modelName}
                                    </td>
                                    <td className="px-6 py-4">{(metrics[modelName].Accuracy * 100).toFixed(2)}%</td>
                                    <td className="px-6 py-4">{(metrics[modelName].Precision * 100).toFixed(2)}%</td>
                                    <td className="px-6 py-4">{(metrics[modelName].Recall * 100).toFixed(2)}%</td>
                                    <td className="px-6 py-4 font-bold text-indigo-400">{(metrics[modelName].F1_Score * 100).toFixed(2)}%</td>
                                    <td className="px-6 py-4 font-mono text-slate-400">{metrics[modelName].R2_Score.toFixed(4)}</td>
                                    <td className="px-6 py-4 font-mono text-slate-400">{metrics[modelName].MSE.toFixed(4)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
