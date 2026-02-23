"use client";

import { useState } from "react";
import { BrainCircuit, AlertCircle, CheckCircle } from "lucide-react";

export default function PredictPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ prediction: number; probability: number } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        Age: "33",
        Age_Group: "25-34",
        Gender: "Female",
        Country: "Germany",
        Membership_Years: "2.5",
        Login_Frequency: "10",
        Session_Duration_Avg: "15.5",
        Pages_Per_Session: "5.0",
        Cart_Abandonment_Rate: "45.0",
        Wishlist_Items: "3",
        Total_Purchases: "12.0",
        Average_Order_Value: "105.5",
        Days_Since_Last_Purchase: "14",
        Discount_Usage_Rate: "25.0",
        Returns_Rate: "5.0",
        Email_Open_Rate: "20.0",
        Customer_Service_Calls: "2",
        Product_Reviews_Written: "1",
        Social_Media_Engagement_Score: "30.0",
        Payment_Method_Diversity: "2",
        Lifetime_Value: "1200.0",
        Credit_Balance: "500",
        Signup_Quarter: "Q2"
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        // Convert string inputs to proper types
        const apiData = {
            Age: parseFloat(formData.Age),
            Age_Group: formData.Age_Group,
            Gender: formData.Gender,
            Country: formData.Country,
            Membership_Years: parseFloat(formData.Membership_Years),
            Login_Frequency: parseInt(formData.Login_Frequency),
            Session_Duration_Avg: parseFloat(formData.Session_Duration_Avg),
            Pages_Per_Session: parseFloat(formData.Pages_Per_Session),
            Cart_Abandonment_Rate: parseFloat(formData.Cart_Abandonment_Rate),
            Wishlist_Items: parseInt(formData.Wishlist_Items),
            Total_Purchases: parseFloat(formData.Total_Purchases),
            Average_Order_Value: parseFloat(formData.Average_Order_Value),
            Days_Since_Last_Purchase: parseInt(formData.Days_Since_Last_Purchase),
            Discount_Usage_Rate: parseFloat(formData.Discount_Usage_Rate),
            Returns_Rate: parseFloat(formData.Returns_Rate),
            Email_Open_Rate: parseFloat(formData.Email_Open_Rate),
            Customer_Service_Calls: parseInt(formData.Customer_Service_Calls),
            Product_Reviews_Written: parseInt(formData.Product_Reviews_Written),
            Social_Media_Engagement_Score: parseFloat(formData.Social_Media_Engagement_Score),
            Payment_Method_Diversity: parseInt(formData.Payment_Method_Diversity),
            Lifetime_Value: parseFloat(formData.Lifetime_Value),
            Credit_Balance: parseInt(formData.Credit_Balance),
            Signup_Quarter: formData.Signup_Quarter
        };

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/predict`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(apiData)
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.detail || "Prediction failed");

            setResult({
                prediction: data.prediction,
                probability: data.probability
            });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const InputField = ({ label, name, type = "number", step = "any" }: any) => (
        <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</label>
            <input
                type={type}
                name={name}
                step={step}
                value={(formData as any)[name]}
                onChange={handleChange}
                required
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
            />
        </div>
    );

    const SelectField = ({ label, name, options }: any) => (
        <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</label>
            <select
                name={name}
                value={(formData as any)[name]}
                onChange={handleChange}
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium appearance-none"
            >
                {options.map((opt: string) => (
                    <option key={opt} value={opt} className="bg-slate-800">{opt}</option>
                ))}
            </select>
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto w-full">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-3">
                    Predict <span className="gradient-text">Churn</span>
                </h1>
                <p className="text-slate-400 mt-2">
                    Enter customer metrics below to get a real-time churn prediction from the Random Forest model.
                </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="xl:col-span-2 glass-card rounded-2xl p-6 border border-slate-700/50">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Demographics */}
                            <div className="space-y-4">
                                <h3 className="flex items-center gap-2 text-indigo-400 font-bold border-b border-indigo-500/20 pb-2">
                                    Demographics
                                </h3>
                                <InputField label="Age" name="Age" />
                                <SelectField label="Age Group" name="Age_Group" options={["18-24", "25-34", "35-44", "45-54", "55-64", "65+"]} />
                                <SelectField label="Gender" name="Gender" options={["Male", "Female", "Other"]} />
                                <SelectField label="Country" name="Country" options={["USA", "UK", "Canada", "Germany", "France", "Australia", "India", "Japan"]} />
                                <InputField label="Membership Years" name="Membership_Years" />
                                <SelectField label="Signup Quarter" name="Signup_Quarter" options={["Q1", "Q2", "Q3", "Q4"]} />
                            </div>

                            {/* Engagement */}
                            <div className="space-y-4">
                                <h3 className="flex items-center gap-2 text-indigo-400 font-bold border-b border-indigo-500/20 pb-2">
                                    Engagement
                                </h3>
                                <InputField label="Login Frequency" name="Login_Frequency" />
                                <InputField label="Avg Session (min)" name="Session_Duration_Avg" />
                                <InputField label="Pages/Session" name="Pages_Per_Session" />
                                <InputField label="Wishlist Items" name="Wishlist_Items" />
                                <InputField label="Email Open Rate (%)" name="Email_Open_Rate" />
                                <InputField label="Social Score" name="Social_Media_Engagement_Score" />
                            </div>

                            {/* Purchase History */}
                            <div className="space-y-4">
                                <h3 className="flex items-center gap-2 text-indigo-400 font-bold border-b border-indigo-500/20 pb-2">
                                    Transactions
                                </h3>
                                <InputField label="Total Purchases" name="Total_Purchases" />
                                <InputField label="Avg Order Value ($)" name="Average_Order_Value" />
                                <InputField label="Days Since Purchase" name="Days_Since_Last_Purchase" />
                                <InputField label="Cart Abandon Rate (%)" name="Cart_Abandonment_Rate" />
                                <InputField label="Lifetime Value ($)" name="Lifetime_Value" />
                                <InputField label="Discount Usage (%)" name="Discount_Usage_Rate" />
                                <InputField label="Returns Rate (%)" name="Returns_Rate" />
                            </div>

                            {/* Other Services */}
                            <div className="space-y-4 md:col-span-2 lg:col-span-3">
                                <h3 className="flex items-center gap-2 text-indigo-400 font-bold border-b border-indigo-500/20 pb-2">
                                    Service & Payments
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                    <InputField label="Customer Service Calls" name="Customer_Service_Calls" />
                                    <InputField label="Product Reviews" name="Product_Reviews_Written" />
                                    <InputField label="Payment Methods" name="Payment_Method_Diversity" />
                                    <InputField label="Credit Balance" name="Credit_Balance" />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-700/50 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all flex items-center justify-center gap-2 min-w-[200px]"
                            >
                                {loading ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                ) : (
                                    <>
                                        <BrainCircuit className="w-5 h-5" />
                                        Generate Prediction
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Results Section */}
                <div className="xl:col-span-1">
                    <div className="glass-card rounded-2xl p-6 border border-slate-700/50 sticky top-6">
                        <h3 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
                            Analysis Results
                        </h3>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3 mb-6">
                                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-200">{error}</p>
                            </div>
                        )}

                        {!result && !error && !loading && (
                            <div className="text-center py-12 px-4 border-2 border-dashed border-slate-700/50 rounded-xl">
                                <BrainCircuit className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                                <p className="text-slate-400 text-sm">Fill the form and submit to see the model prediction here.</p>
                            </div>
                        )}

                        {loading && (
                            <div className="text-center py-12 px-4">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                                <p className="text-slate-300 font-medium animate-pulse">Analyzing 23 features...</p>
                            </div>
                        )}

                        {result && !loading && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className={`rounded-xl p-6 text-center ${result.prediction === 1
                                    ? "bg-red-500/10 border border-red-500/30"
                                    : "bg-emerald-500/10 border border-emerald-500/30"
                                    }`}>
                                    <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${result.prediction === 1 ? "bg-red-500/20" : "bg-emerald-500/20"
                                        }`}>
                                        {result.prediction === 1
                                            ? <AlertCircle className="w-8 h-8 text-red-500" />
                                            : <CheckCircle className="w-8 h-8 text-emerald-500" />
                                        }
                                    </div>

                                    <h4 className="text-xl font-bold mb-1">
                                        {result.prediction === 1 ? (
                                            <span className="text-red-400">High Churn Risk</span>
                                        ) : (
                                            <span className="text-emerald-400">Likely to Retain</span>
                                        )}
                                    </h4>
                                    <p className="text-slate-400 text-sm mb-6">
                                        Based on the Random Forest execution path
                                    </p>

                                    <div className="bg-slate-900/50 rounded-lg p-4 text-left">
                                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">Churn Probability</p>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-bold text-xl text-slate-200">{(result.probability * 100).toFixed(1)}%</span>
                                        </div>
                                        {/* Progress bar */}
                                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${result.probability > 0.5 ? 'bg-red-500' : 'bg-emerald-500'
                                                    }`}
                                                style={{ width: `${result.probability * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 bg-slate-800/40 rounded-lg p-4 border border-slate-700/50 text-sm text-slate-300">
                                    <p className="flex gap-2">
                                        <span className="text-indigo-400 font-bold">&gt;</span>
                                        Action: {result.prediction === 1
                                            ? "Trigger retention campaign sequence (#C-302). Offer 15% discount."
                                            : "No immediate action required. Maintain standard communications."
                                        }
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
