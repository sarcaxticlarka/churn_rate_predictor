import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Predictive Insights | E-Commerce Churn",
    description: "Modern machine learning application for e-commerce churn prediction",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <body className={`${inter.className} bg-slate-900 text-slate-50 antialiased min-h-screen flex`}>
                <Sidebar />
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </body>
        </html>
    );
}
