"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Activity, BarChart3, Settings, BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Predict Churn", href: "/predict", icon: BrainCircuit },
    { name: "Model Metrics", href: "/metrics", icon: Activity },
    { name: "Data Insights", href: "/insights", icon: BarChart3 },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 border-r border-slate-800 glass-card matrix-bg flex flex-col h-screen sticky top-0 hidden md:flex">
            <div className="p-6 border-b border-slate-800/60">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center tech-border">
                        <BrainCircuit className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <span className="font-bold text-lg tracking-tight gradient-text block leading-none pt-1">ChurnGuard</span>
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">MLOps Terminal</span>
                    </div>
                </Link>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                <div className="text-xs font-semibold text-slate-500 tracking-wider uppercase mb-4 ml-2 mt-4">
                    Menu
                </div>
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group text-sm font-medium",
                                isActive
                                    ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                            )}
                        >
                            <Icon className={cn(
                                "w-4 h-4 transition-colors",
                                isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"
                            )} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800/60">
                <div className="glass-card rounded-xl p-4 flex items-center gap-3 tech-border relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl -mr-8 -mt-8 animate-pulse"></div>
                    <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center flex-shrink-0 z-10">
                        <span className="text-xs font-mono font-bold text-emerald-400">RF</span>
                    </div>
                    <div className="overflow-hidden z-10 col-span-1">
                        <p className="text-sm font-mono font-medium text-slate-200 truncate">Random Forest</p>
                        <p className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> INFERENCE UP
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
