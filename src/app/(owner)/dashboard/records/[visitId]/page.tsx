'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getUserVisits, UserVisit } from '@/libs/api/user-visits';
import { useAuthStore } from '@/store/auth';
import { toast } from 'sonner';
import {
    ArrowLeft, Calendar, Clock, Activity, PawPrint,
    Weight, Thermometer, Heart, CheckCircle, Circle,
    Loader2, User, Stethoscope, FileText, CreditCard,
    AlertCircle, Sparkles,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import dayjs from 'dayjs';

const STATUS_STYLES: Record<string, { dot: string; badge: string; label: string }> = {
    'in-progress': {
        dot: 'bg-yellow-400',
        badge: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
        label: 'In Progress'
    },
    'completed': {
        dot: 'bg-green-500',
        badge: 'bg-green-50 text-green-700 border border-green-200',
        label: 'Completed'
    },
    'cancelled': {
        dot: 'bg-red-400',
        badge: 'bg-red-50 text-red-700 border border-red-200',
        label: 'Cancelled'
    }
};

const PAYMENT_STYLES: Record<string, { badge: string; label: string }> = {
    'unpaid': {
        badge: 'bg-red-50 text-red-700 border border-red-200',
        label: 'Unpaid'
    },
    'paid': {
        badge: 'bg-green-50 text-green-700 border border-green-200',
        label: 'Paid'
    }
};

export default function VisitDetailPage() {
    const { profile } = useAuthStore();
    const params = useParams();
    const router = useRouter();
    const [visit, setVisit] = useState<UserVisit | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const visitId = params?.visitId as string;

    useEffect(() => {
        async function loadVisit() {
            if (!profile || profile.type !== 'owner') {
                setLoading(false);
                return;
            }

            if (!visitId) {
                setError('Visit ID not found');
                setLoading(false);
                return;
            }

            try {
                const visits = await getUserVisits();
                const foundVisit = visits.find(v => v._id === visitId);
                if (foundVisit) {
                    setVisit(foundVisit);
                } else {
                    setError('Visit not found');
                }
            } catch (error) {
                setError(error instanceof Error ? error.message : 'Failed to load visit details');
                toast.error('Failed to load visit details');
            } finally {
                setLoading(false);
            }
        }

        loadVisit();
    }, [profile, visitId]);

    if (!profile || profile.type !== 'owner') {
        return (
            <div className="min-h-screen px-4 py-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                    <div className="flex flex-col items-center">
                        <User className="w-12 h-12 text-gray-200 mb-3" />
                        <p className="text-gray-400 font-semibold">Access Restricted</p>
                        <p className="text-gray-300 text-sm mt-1">Please login as a pet owner.</p>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen px-4 py-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 text-acc-clr animate-spin" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !visit) {
        return (
            <div className="min-h-screen px-4 py-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                    <div className="flex flex-col items-center">
                        <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
                        <p className="text-gray-600 font-semibold">{error || 'Visit not found'}</p>
                        <Link
                            href="/dashboard/records"
                            className="mt-4 text-sm font-semibold text-acc-clr hover:text-green-600 transition-colors flex items-center gap-1"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Records
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const status = STATUS_STYLES[visit.status] || STATUS_STYLES['completed'];
    const payment = PAYMENT_STYLES[visit.paymentStatus] || PAYMENT_STYLES['unpaid'];

    return (
        <div className="min-h-screen px-4 py-6">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Back Button */}
                <Link
                    href="/dashboard/records"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-acc-clr transition-colors sec-ff"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Records
                </Link>

                {/* Header Card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 shrink-0">
                                    {visit.pet?.photo ? (
                                        <Image
                                            width={64}
                                            height={64}
                                            src={visit.pet.photo}
                                            alt={visit.pet.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <PawPrint className="w-8 h-8 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-sec-clr sec-ff">
                                        {visit.pet?.name || 'Unknown Pet'}
                                    </h1>
                                    <p className="text-sm text-gray-500 pry-ff">
                                        {visit.pet?.species || 'Pet'} · {visit.pet?.breed || '—'}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg sec-ff ${status.badge}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                                            {status.label}
                                        </span>
                                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg sec-ff ${payment.badge}`}>
                                            {visit.paymentStatus === 'paid' ? (
                                                <CheckCircle className="w-3.5 h-3.5" />
                                            ) : (
                                                <Circle className="w-3.5 h-3.5" />
                                            )}
                                            {payment.label}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Date & Time */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
                                <Calendar className="w-5 h-5 text-acc-clr" />
                                <div>
                                    <p className="text-xs text-gray-400 sec-ff">Date</p>
                                    <p className="text-sm font-semibold text-sec-clr sec-ff">
                                        {dayjs(visit.createdAt).format('DD MMMM YYYY')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
                                <Clock className="w-5 h-5 text-acc-clr" />
                                <div>
                                    <p className="text-xs text-gray-400 sec-ff">Time</p>
                                    <p className="text-sm font-semibold text-sec-clr sec-ff">
                                        {dayjs(visit.createdAt).format('hh:mm A')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Vitals */}
                        {visit.vitals && (
                            <div>
                                <h3 className="text-sm font-bold text-sec-clr sec-ff mb-3 flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-acc-clr" />
                                    Vitals
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
                                        <Weight className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                                        <p className="text-xs text-gray-400 sec-ff">Weight</p>
                                        <p className="text-sm font-bold text-sec-clr sec-ff">{visit.vitals.weight} kg</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
                                        <Thermometer className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                                        <p className="text-xs text-gray-400 sec-ff">Temperature</p>
                                        <p className="text-sm font-bold text-sec-clr sec-ff">{visit.vitals.temp}°C</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
                                        <Heart className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                                        <p className="text-xs text-gray-400 sec-ff">Pulse</p>
                                        <p className="text-sm font-bold text-sec-clr sec-ff">{visit.vitals.pulse} bpm</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
                                        <Activity className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                                        <p className="text-xs text-gray-400 sec-ff">Respiration</p>
                                        <p className="text-sm font-bold text-sec-clr sec-ff">{visit.vitals.respiration} rpm</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Billing */}
                        {visit.billing && visit.billing.total > 0 && (
                            <div>
                                <h3 className="text-sm font-bold text-sec-clr sec-ff mb-3 flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-acc-clr" />
                                    Billing
                                </h3>
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 sec-ff">Total Amount</span>
                                        <span className="text-lg font-bold text-sec-clr sec-ff">
                                            ₦{visit.billing.total.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Appointment Type */}
                        {visit.appointmentType && (
                            <div>
                                <h3 className="text-sm font-bold text-sec-clr sec-ff mb-2 flex items-center gap-2">
                                    <Stethoscope className="w-4 h-4 text-acc-clr" />
                                    Appointment Type
                                </h3>
                                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                    <p className="text-sm text-gray-700 sec-ff">{visit.appointmentType}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Discharge Summary */}
                {visit.dischargeSummary && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-linear-to-r from-green-50 to-emerald-50">
                            <div className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-acc-clr" />
                                <h3 className="text-sm font-bold text-sec-clr sec-ff">Discharge Summary</h3>
                                {visit.soapGeneratedByAI && (
                                    <span className="flex items-center gap-1 text-[10px] font-semibold bg-violet-600 text-white px-1.5 py-0.5 rounded-full ml-auto">
                                        <Sparkles size={10} />
                                        AI Generated
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Greeting */}
                            <p className="text-sm text-gray-700 sec-ff leading-relaxed">
                                {visit.dischargeSummary.greeting}
                            </p>

                            {/* Visit Summary */}
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 sec-ff">
                                    What Happened
                                </p>
                                <p className="text-sm text-gray-700 sec-ff leading-relaxed">
                                    {visit.dischargeSummary.visitSummary}
                                </p>
                            </div>

                            {/* Diagnosis */}
                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1.5 sec-ff">
                                    Diagnosis
                                </p>
                                <p className="text-sm text-gray-700 sec-ff">
                                    {visit.dischargeSummary.diagnosis}
                                </p>
                            </div>

                            {/* Home Care Instructions */}
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 sec-ff">
                                    Home Care Instructions
                                </p>
                                <ul className="space-y-2">
                                    {visit.dischargeSummary.homeCareinstructions.map((instruction, i) => (
                                        <li key={i} className="flex items-start gap-2.5">
                                            <CheckCircle className="w-4 h-4 text-acc-clr shrink-0 mt-0.5" />
                                            <p className="text-sm text-gray-700 sec-ff leading-relaxed">
                                                {instruction}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* When to Return */}
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 sec-ff">
                                    When to Return
                                </p>
                                <ul className="space-y-2">
                                    {visit.dischargeSummary.returnConditions.map((condition, i) => (
                                        <li key={i} className="flex items-start gap-2.5">
                                            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                            <p className="text-sm text-gray-700 sec-ff leading-relaxed">
                                                {condition}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Closing */}
                            <div className="pt-4 border-t border-gray-100">
                                <p className="text-sm text-gray-500 sec-ff italic">
                                    {visit.dischargeSummary.closing}
                                </p>
                            </div>

                            {/* Generated at */}
                            {visit.dischargeSummaryGeneratedAt && (
                                <p className="text-xs text-gray-300 sec-ff">
                                    Generated {dayjs(visit.dischargeSummaryGeneratedAt).format('DD MMM YYYY · hh:mm A')}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                    {visit.paymentStatus === 'unpaid' && visit.billing?.total > 0 && (
                        <button
                            onClick={() => router.push(`/dashboard/records/${visitId}/payment`)}
                            className="flex-1 bg-acc-clr hover:bg-green-600 text-white py-3 rounded-xl font-bold text-sm transition-colors sec-ff"
                        >
                            Pay Now · ₦{visit.billing.total.toLocaleString()}
                        </button>
                    )}
                    <Link
                        href="/dashboard/records"
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold text-sm text-center transition-colors sec-ff"
                    >
                        View All Records
                    </Link>
                </div>

            </div>
        </div>
    );
}