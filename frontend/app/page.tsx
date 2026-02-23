import DashboardClient from "@/components/DashboardClient";

export default function Home() {
    return (
        <div className="p-8 max-w-7xl mx-auto w-full">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-slate-100">
                    Churn Analysis <span className="gradient-text">Dashboard</span>
                </h1>
                <p className="text-slate-400 mt-2">
                    Overview of customer retention metrics and machine learning data insights.
                </p>
            </div>

            <DashboardClient />
        </div>
    );
}
