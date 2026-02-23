"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Database, Filter } from "lucide-react";
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";

const COLORS = ['#6366f1', '#ec4899', '#facc15', '#10b981', '#8b5cf6'];

export default function InsightsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("http://localhost:8000/api/data-insights")
            .then((res) => res.json())
            .then((data) => {
                setData(data.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="w-full h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (!data) return null;

    // Format Gender Churn Data
    const genderData = Object.entries(data.charts.churn_by_gender).map(([gender, rate]) => ({
        name: gender,
        rate: Number(rate) * 100
    }));

    return (
        <div className="p-8 max-w-7xl mx-auto w-full">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-3">
                        <Database className="w-8 h-8 text-indigo-400" /> Exploratory <span className="gradient-text">Data Analysis</span>
                    </h1>
                    <p className="text-slate-400 mt-2">
                        Dataset demographics and key correlations with churn.
                    </p>
                </div>
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-sm text-slate-300 flex items-center gap-2">
                    <Filter className="w-4 h-4" /> Dataset: 9,998 rows (Cleaned)
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Gender Churn Rate */}
                <div className="glass-card rounded-2xl p-6 border border-slate-700/50">
                    <h3 className="text-lg font-bold text-slate-200 mb-6">Churn Rate by Gender</h3>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={genderData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" tickFormatter={(val) => `${val}%`} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                                    formatter={(val: number) => [`${val.toFixed(1)}%`, 'Churn Rate']}
                                />
                                <Bar dataKey="rate" fill="#ec4899" radius={[4, 4, 0, 0]}>
                                    {genderData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Data Quality Report */}
                <div className="glass-card rounded-2xl p-6 border border-slate-700/50 flex flex-col">
                    <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-fuchsia-400" /> Data Quality Report
                    </h3>

                    <div className="flex-1 space-y-4">
                        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-slate-300">Missing Values</span>
                                <span className="text-xs px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">0% (Cleaned)</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }}></div>
                            </div>
                        </div>

                        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-slate-300">Class Imbalance (Churned vs Retained)</span>
                                <span className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">28.7% / 71.3%</span>
                            </div>
                            <div className="h-1.5 w-full flex rounded-full overflow-hidden bg-slate-800">
                                <div className="h-full bg-indigo-500" style={{ width: '71.3%' }}></div>
                                <div className="h-full bg-red-500" style={{ width: '28.7%' }}></div>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">Addressed via Stratified Sampling during Training.</p>
                        </div>

                        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50 mt-auto">
                            <p className="text-sm text-slate-300 leading-relaxed">
                                <strong className="text-indigo-400">Preprocessing Note:</strong> The attributes <code className="text-xs bg-slate-800 px-1 py-0.5 rounded text-fuchsia-300">City</code> and <code className="text-xs bg-slate-800 px-1 py-0.5 rounded text-fuchsia-300">Social_Score_missing</code> were dropped during pipeline creation to reduce high cardinality noise and prevent multicollinearity.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
