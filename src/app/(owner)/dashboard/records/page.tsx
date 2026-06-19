// src/app/(owner)/dashboard/records/page.tsx

"use client";

import { useEffect, useState } from "react";
import { getUserVisits, UserVisit } from "@/libs/api/user-visits";
import {
    ChevronLeft, ChevronRight, Heart, Search,
    SlidersHorizontal, Thermometer, Weight, Activity, Zap, X, Loader2
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const FILTER_TABS = ["All Records", "Completed", "Upcoming", "Verified"];
const PER_PAGE = 8;

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

interface VisitDetailContentProps {
    selectedVisit: UserVisit;
    onPay: (visitId: string) => void;
    onClose?: () => void;
}

function VisitDetailContent({ selectedVisit, onPay }: VisitDetailContentProps) {
    return (
        <div className="rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-600">
                    #{selectedVisit._id.slice(0, 8).toUpperCase()}
                </span>
                <span className={`text-[10px] font-bold capitalize px-2 py-0.5 rounded-full ${
                    selectedVisit.status === "completed" ? "bg-emerald-50 text-emerald-600" :
                    selectedVisit.status === "in-progress" ? "bg-blue-50 text-blue-600" :
                    "bg-red-50 text-red-500"
                }`}>{selectedVisit.status}</span>
            </div>

            {[
                { label: "Date", value: formatDate(selectedVisit.createdAt) },
                { label: "Type", value: selectedVisit.appointmentType ?? '—' },
                { label: "Weight", value: `${selectedVisit.vitals.weight} kg` },
                { label: "Temperature", value: `${selectedVisit.vitals.temp} °C` },
                { label: "Pulse", value: `${selectedVisit.vitals.pulse} bpm` },
                { label: "Respiration", value: `${selectedVisit.vitals.respiration} brpm` },
            ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between px-4 py-2.5 border-t border-slate-50">
                    <span className="text-[11px] text-slate-400">{label}</span>
                    <span className="text-[11px] font-semibold text-slate-700 capitalize">{value}</span>
                </div>
            ))}

            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50">
                <span className="text-[11px] font-bold text-slate-600">Total Bill</span>
                <span className="text-[13px] font-extrabold text-emerald-600">
                    ₦{selectedVisit.billing.total.toLocaleString()}
                </span>
            </div>

            <div className="px-4 py-3 border-t border-slate-50">
                <span className={`text-[10px] font-bold capitalize px-2.5 py-1 rounded-full border ${
                    selectedVisit.paymentStatus === "paid"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-yellow-50 text-yellow-700 border-yellow-200"
                }`}>{selectedVisit.paymentStatus}</span>
            </div>

            {selectedVisit.paymentStatus !== "paid" && selectedVisit.status === "completed" && (
                <div className="px-4 pb-4">
                    <button
                        onClick={() => onPay(selectedVisit._id)}
                        className="w-full rounded-xl bg-emerald-500 text-white text-[13px] font-bold py-2.5 hover:bg-emerald-600 transition-colors shadow shadow-emerald-100">
                        Pay ₦{selectedVisit.billing.total.toLocaleString()}
                    </button>
                </div>
            )}
        </div>
    );
}

export default function RecordsPage() {
    const [visits, setVisits] = useState<UserVisit[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState("All Records");
    const [selectedVisit, setSelectedVisit] = useState<UserVisit | null>(null);
    const [page, setPage] = useState(1);
    const [showDetail, setShowDetail] = useState(false);
    const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "last-week" | "last-month">("newest");
    const [showSortMenu, setShowSortMenu] = useState(false);
    const router = useRouter();

    useEffect(() => {
        getUserVisits()
            .then((data) => {
                setVisits(data);
                if (data.length > 0) setSelectedVisit(data[0]);
            })
            .catch((err) => setError(err?.message || "Failed to load visits"))
            .finally(() => setLoading(false));
    }, []);

    // Derives from selectedVisit so vitals update on row click
    const latest = selectedVisit ?? visits[0] ?? null;

    const filtered = visits
        .filter((v) => {
            if (activeFilter === "Completed") return v.status === "completed";
            if (activeFilter === "Upcoming") return v.status === "in-progress";
            return true;
        })
        .filter((v) => {
            const now = new Date();
            if (sortOrder === "last-week") {
                const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
                return new Date(v.createdAt) >= weekAgo;
            }
            if (sortOrder === "last-month") {
                const monthAgo = new Date(now); monthAgo.setMonth(now.getMonth() - 1);
                return new Date(v.createdAt) >= monthAgo;
            }
            return true;
        })
        .sort((a, b) => {
            if (sortOrder === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

    const totalPages = Math.ceil(filtered.length / PER_PAGE);
    const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    const handleSelectVisit = (visit: UserVisit) => {
        setSelectedVisit(visit);
        setShowDetail(true);
    };

    const handlePay = (visitId: string) => {
        router.push(`/dashboard/records/${visitId}/payment`);
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen text-sec-clr text-sm">
            <Loader2 className="animate-spin h-4 w-4" />
        </div>
    );

    if (error) return (
        <div className="flex items-center justify-center min-h-screen text-red-400 text-sm">
            {error}
        </div>
    );

    if (!visits.length) return (
        <div className="flex items-center justify-center min-h-screen text-slate-400 text-sm sec-ff">
            No visits found.
        </div>
    );

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-[#f8f9fb] sec-ff relative">

            {/* ── Main Content ── */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden mb-20">

                {/* Header */}
                <header className="bg-white border-b border-slate-100 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Medical Records:</p>
                        <h1 className="text-base sm:text-[22px] font-black text-slate-800 leading-tight">
                            {latest?.pet?.name ?? "—"}
                        </h1>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 w-32 sm:w-52">
                        <Search size={13} className="text-slate-400 flex-shrink-0" />
                        <input
                            className="bg-transparent text-[13px] text-slate-600 placeholder:text-slate-400 outline-none flex-1 min-w-0"
                            placeholder="Search..."
                        />
                    </div>
                </header>

                <div className="flex-1 overflow-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5">

                    {/* Latest Vitals */}
                    {latest && (
                        <section>
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Latest Vitals</p>
                                <p className="text-[11px] text-slate-400 hidden sm:block">
                                    Last updated: {formatDate(latest.createdAt)}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                                {[
                                    { label: "Weight", value: latest.vitals.weight, unit: "kg", icon: <Weight size={13} />, sub: latest.vitals.weight > 30 ? "Above avg" : "Normal range", subGreen: latest.vitals.weight <= 30 },
                                    { label: "Heart Rate", value: latest.vitals.pulse, unit: "bpm", icon: <Activity size={13} />, sub: latest.vitals.pulse > 120 ? "Elevated" : "Normal", subGreen: latest.vitals.pulse <= 120 },
                                    { label: "Temperature", value: latest.vitals.temp, unit: "°C", icon: <Thermometer size={13} />, sub: latest.vitals.temp > 39.5 ? "High" : "Normal Range", subGreen: latest.vitals.temp <= 39.5 },
                                    { label: "Respiration", value: latest.vitals.respiration, unit: "brpm", icon: <Zap size={13} />, sub: latest.vitals.respiration > 30 ? "Elevated" : "Normal", subGreen: latest.vitals.respiration <= 30 },
                                ].map((v) => (
                                    <div key={v.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm px-3 sm:px-5 py-3 sm:py-4">
                                        <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                                            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500">{v.label}</span>
                                            <span className="text-slate-400">{v.icon}</span>
                                        </div>
                                        <p className="text-lg sm:text-2xl font-black text-slate-800 leading-none">
                                            {v.value}
                                            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 ml-1">{v.unit}</span>
                                        </p>
                                        <p className={`text-[10px] sm:text-[11px] font-semibold mt-1 sm:mt-1.5 ${v.subGreen ? "text-emerald-500" : "text-amber-500"}`}>
                                            {v.sub}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Records Table */}
                    <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

                        {/* Filters bar */}
                        <div className="px-3 sm:px-6 pt-3 sm:pt-5 pb-3 sm:pb-4 border-b border-slate-50">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar pb-1 flex-1">
                                    {FILTER_TABS.map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => { setActiveFilter(tab); setPage(1); }}
                                            className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-[13px] font-semibold transition-colors whitespace-nowrap flex-shrink-0 ${
                                                activeFilter === tab
                                                    ? "bg-emerald-500 text-white shadow shadow-emerald-200"
                                                    : "text-slate-500 hover:bg-slate-50"
                                            }`}>
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                                <div className="relative flex-shrink-0">
                                    <button
                                        onClick={() => setShowSortMenu(s => !s)}
                                        className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-50 border border-slate-100 px-2 sm:px-2.5 py-2 rounded-xl hover:bg-slate-100 transition-colors"
                                    >
                                        <SlidersHorizontal size={12} />
                                        <span className="hidden sm:inline capitalize">
                                            {sortOrder === "newest" ? "Newest First" :
                                             sortOrder === "oldest" ? "Oldest First" :
                                             sortOrder === "last-week" ? "Last Week" : "Last Month"}
                                        </span>
                                    </button>

                                    {showSortMenu && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
                                            <div className="absolute right-0 top-9 z-[100] bg-white border border-slate-100 rounded-xl shadow-lg w-36 py-1 overflow-hidden">
                                                {([
                                                    { value: "newest", label: "Newest First" },
                                                    { value: "last-week", label: "Last Week" },
                                                    { value: "last-month", label: "Last Month" },
                                                    { value: "oldest", label: "Oldest First" },
                                                ] as const).map(({ value, label }) => (
                                                    <button
                                                        key={value}
                                                        onClick={() => { setSortOrder(value); setShowSortMenu(false); setPage(1); }}
                                                        className={`w-full text-left px-3 py-2 text-[12px] font-semibold transition-colors sec-ff
                                                            ${sortOrder === value ? "text-emerald-600 bg-emerald-50" : "text-slate-600 hover:bg-slate-50"}`}
                                                    >
                                                        {label}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Table header — sm+ */}
                        <div className="hidden sm:grid grid-cols-[160px_1fr_1fr] lg:grid-cols-[200px_1fr_1fr] gap-4 px-4 sm:px-6 py-3 bg-slate-50/60">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Date &amp; Type</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pet / Status</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Summary</p>
                        </div>

                        {/* Rows */}
                        {paginated.map((visit) => (
                            <button
                                key={visit._id}
                                onClick={() => handleSelectVisit(visit)}
                                className={`w-full text-left border-b border-slate-50 last:border-0 hover:bg-emerald-50/30 transition-colors ${
                                    selectedVisit?._id === visit._id ? "bg-emerald-50/50" : ""
                                } flex flex-col gap-2 px-3 py-3 sm:grid sm:grid-cols-[160px_1fr_1fr] lg:grid-cols-[200px_1fr_1fr] sm:gap-4 sm:px-6 sm:py-4`}>

                                {/* Date + status */}
                                <div className="flex sm:block items-center gap-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[12px] sm:text-[13px] font-semibold text-slate-700">{formatDate(visit.createdAt)}</p>
                                        <p className="text-[10px] sm:text-[11px] text-slate-400 capitalize mt-0.5">
                                            {visit.appointmentType ?? '—'}
                                        </p>
                                    </div>
                                    <span className={`inline-flex items-center gap-1 sm:mt-1 text-[10px] font-bold capitalize px-2 py-0.5 rounded-full flex-shrink-0 ${
                                        visit.status === "completed" ? "bg-emerald-50 text-emerald-600" :
                                        visit.status === "in-progress" ? "bg-blue-50 text-blue-600" :
                                        "bg-red-50 text-red-500"
                                    }`}>
                                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                        {visit.status}
                                    </span>
                                </div>

                                {/* Pet info */}
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-emerald-100 to-green-200 flex items-center justify-center">
                                        {visit.pet?.photo
                                            ? <Image src={visit.pet.photo} alt={visit.pet.name} width={32} height={32} className="w-full h-full object-cover" />
                                            : <Heart size={12} className="text-emerald-400" />}
                                    </div>
                                    <div>
                                        <p className="text-[12px] sm:text-[13px] font-semibold text-slate-700">{visit.pet?.name ?? "—"}</p>
                                        <p className="text-[10px] sm:text-[11px] text-slate-400 capitalize">{visit.pet?.breed}</p>
                                    </div>
                                </div>

                                {/* Vitals summary */}
                                <p className="text-[11px] sm:text-[12px] text-slate-500 truncate sm:self-center">
                                    Wt: {visit.vitals.weight}kg · {visit.vitals.temp}°C · {visit.vitals.pulse}bpm
                                </p>
                            </button>
                        ))}

                        {/* Pagination */}
                        <div className="px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-t border-slate-50">
                            <p className="text-[11px] text-slate-400">
                                {paginated.length} of {filtered.length} records
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="w-8 h-8 rounded-lg border border-slate-100 bg-white flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 transition-colors">
                                    <ChevronLeft size={13} className="text-slate-500" />
                                </button>
                                <span className="text-[11px] text-slate-400">{page}/{totalPages}</span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages || totalPages === 0}
                                    className="w-8 h-8 rounded-lg border border-slate-100 bg-white flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 transition-colors">
                                    <ChevronRight size={13} className="text-slate-500" />
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {/* ── Right Panel — lg+ only ── */}
            <aside className="hidden lg:flex w-[280px] flex-shrink-0 border-l border-slate-100 bg-white px-5 py-7 flex-col gap-6 overflow-auto">
                <section>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Pet Summary</p>
                    {latest?.pet ? (
                        <div className="flex flex-col items-center text-center gap-3">
                            <div className="w-[88px] h-[88px] rounded-full overflow-hidden border-4 border-emerald-100 shadow-md bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                                {latest.pet.photo
                                    ? <Image src={latest.pet.photo} alt={latest.pet.name} width={88} height={88} className="w-full h-full object-cover" />
                                    : <Heart size={28} className="text-amber-400" />}
                            </div>
                            <div>
                                <p className="text-lg font-black text-slate-800">{latest.pet.name}</p>
                                <p className="text-[12px] text-slate-400">{latest.pet.breed} • {latest.pet.age} yrs</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 rounded-full bg-slate-100 text-[9px] font-black text-slate-600 uppercase tracking-widest">{latest.pet.gender}</span>
                                <span className="px-3 py-1 rounded-full bg-slate-100 text-[9px] font-black text-slate-600 uppercase tracking-widest">{latest.pet.species}</span>
                            </div>
                        </div>
                    ) : (
                        <p className="text-[12px] text-slate-400 text-center">No pet data</p>
                    )}
                </section>

                {selectedVisit && (
                    <section className="flex-1 overflow-auto space-y-3">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Visit Detail</p>
                        <VisitDetailContent selectedVisit={selectedVisit} onPay={handlePay} />
                    </section>
                )}
            </aside>

            {/* ── Mobile/Tablet Detail Bottom Sheet ── */}
            {showDetail && selectedVisit && (
                <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
                    <div
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                        onClick={() => setShowDetail(false)}
                    />
                    <div className="relative bg-white rounded-t-3xl px-4 sm:px-5 pt-6 pb-8 max-h-[88vh] overflow-auto shadow-2xl">
                        <div className="w-10 h-1 rounded-full bg-slate-200 mx-auto absolute left-1/2 -translate-x-1/2 top-3" />

                        <div className="flex items-center justify-between mb-4">
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Visit Detail</p>
                            <button
                                onClick={() => setShowDetail(false)}
                                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
                                <X size={13} className="text-slate-500" />
                            </button>
                        </div>

                        {/* Pet summary strip */}
                        {selectedVisit.pet && (
                            <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 rounded-2xl">
                                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-emerald-100 bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center flex-shrink-0">
                                    {selectedVisit.pet.photo
                                        ? <Image src={selectedVisit.pet.photo} alt={selectedVisit.pet.name} width={40} height={40} className="w-full h-full object-cover" />
                                        : <Heart size={16} className="text-amber-400" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-black text-slate-800 truncate">{selectedVisit.pet.name}</p>
                                    <p className="text-[11px] text-slate-400">{selectedVisit.pet.breed} • {selectedVisit.pet.age} yrs</p>
                                </div>
                                <div className="flex gap-1.5 flex-shrink-0">
                                    <span className="px-2 py-0.5 rounded-full bg-slate-200 text-[9px] font-black text-slate-600 uppercase">{selectedVisit.pet.gender}</span>
                                    <span className="px-2 py-0.5 rounded-full bg-slate-200 text-[9px] font-black text-slate-600 uppercase">{selectedVisit.pet.species}</span>
                                </div>
                            </div>
                        )}

                        <VisitDetailContent
                            selectedVisit={selectedVisit}
                            onPay={handlePay}
                            onClose={() => setShowDetail(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}