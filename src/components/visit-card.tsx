// components/visit-card.tsx

'use client';

import { useEffect, useState } from 'react';
import { getUserVisits, UserVisit } from '@/libs/api/user-visits';
import { useAuthStore } from '@/store/auth';
import { toast } from 'sonner';
import { 
    Calendar, 
    Clock, 
    Activity, 
    ChevronRight, 
    Loader2,
    PawPrint,
    Weight,
    Thermometer,
    Heart,
    CheckCircle,
    Circle,
    Syringe,
    Minus
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import dayjs from 'dayjs';

const STATUS_STYLES: Record<string, { dot: string; badge: string; label: string; icon: React.ElementType }> = {
    'in-progress': {
        dot: 'bg-yellow-400',
        badge: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
        label: 'In Progress',
        icon: Activity
    },
    'completed': {
        dot: 'bg-green-500',
        badge: 'bg-green-50 text-green-700 border border-green-200',
        label: 'Completed',
        icon: CheckCircle
    },
    'cancelled': {
        dot: 'bg-red-400',
        badge: 'bg-red-50 text-red-700 border border-red-200',
        label: 'Cancelled',
        icon: Minus
    }
};

const PAYMENT_STYLES: Record<string, { badge: string; icon: React.ElementType }> = {
    'unpaid': {
        badge: 'bg-red-50 text-red-700 border border-red-200',
        icon: Circle
    },
    'paid': {
        badge: 'bg-green-50 text-green-700 border border-green-200',
        icon: CheckCircle
    }
};

export default function VisitCard() {
    const { profile } = useAuthStore();
    const [visits, setVisits] = useState<UserVisit[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadVisits() {
            if (!profile || profile.type !== 'owner') {
                setLoading(false);
                return;
            }

            try {
                const data = await getUserVisits();
                // Sort by createdAt descending (most recent first)
                const sorted = data.sort((a, b) => 
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                setVisits(sorted);
            } catch (error) {
                toast.error(error instanceof Error ? error.message : 'Failed to load visits');
            } finally {
                setLoading(false);
            }
        }

        loadVisits();
    }, [profile]);

    if (!profile || profile.type !== 'owner') {
        return null;
    }

    // Only show the 3 most recent visits
    const recentVisits = visits.slice(0, 3);

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 lg:px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                        <Activity className="w-4 h-4 text-blue-600" />
                    </div>
                    <h2 className="text-sm font-bold text-sec-clr sec-ff">Recent Visits</h2>
                </div>
                <Link 
                    href="/dashboard/records" 
                    className="text-xs font-semibold text-acc-clr hover:text-green-600 transition-colors flex items-center gap-1 sec-ff"
                >
                    View All
                    <ChevronRight className="w-3.5 h-3.5" />
                </Link>
            </div>

            {/* Content */}
            <div className="p-4 lg:p-6">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-5 h-5 text-acc-clr animate-spin" />
                    </div>
                ) : recentVisits.length === 0 ? (
                    <div className="flex flex-col items-center py-8">
                        <Syringe className="w-10 h-10 text-gray-200 mb-3" />
                        <p className="text-sm text-gray-400 sec-ff">No recent visits</p>
                        <p className="text-xs text-gray-300 mt-1 pry-ff">Your visit history will appear here</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {recentVisits.map((visit) => {
                            const status = STATUS_STYLES[visit.status] || STATUS_STYLES['completed'];
                            const payment = PAYMENT_STYLES[visit.paymentStatus] || PAYMENT_STYLES['unpaid'];
                            const isInProgress = visit.status === 'in-progress';
                            const StatusIcon = status.icon;
                            const PaymentIcon = payment.icon;

                            return (
                                <Link 
                                    key={visit._id} 
                                    href={`/dashboard/records/${visit._id}`}
                                    className={`block rounded-xl border transition-all duration-200 hover:shadow-md ${
                                        isInProgress 
                                            ? 'border-yellow-200 bg-yellow-50/30 hover:bg-yellow-50/50' 
                                            : 'border-gray-100 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="p-3 lg:p-4">
                                        <div className="flex items-start gap-3">
                                            {/* Pet Photo */}
                                            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl overflow-hidden bg-gray-100 border border-gray-100 shrink-0 flex items-center justify-center">
                                                {visit.pet?.photo ? (
                                                    <Image 
                                                        width={48} 
                                                        height={48} 
                                                        src={visit.pet.photo} 
                                                        alt={visit.pet.name} 
                                                        className="w-full h-full object-cover" 
                                                    />
                                                ) : (
                                                    <PawPrint className="w-5 h-5 lg:w-6 lg:h-6 text-gray-400" />
                                                )}
                                            </div>

                                            {/* Visit Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold text-sec-clr sec-ff truncate">
                                                            {visit.pet?.name || 'Unknown Pet'}
                                                        </p>
                                                        <p className="text-xs text-gray-500 pry-ff truncate">
                                                            {visit.pet?.species || 'Pet'} · {visit.pet?.breed || '—'}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        {/* Status Badge */}
                                                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full sec-ff ${status.badge}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                                                            {status.label}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Visit Details */}
                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                                                    {/* Date */}
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3 text-gray-300" />
                                                        <span className="text-[10px] text-gray-500 pry-ff">
                                                            {dayjs(visit.createdAt).format('DD MMM YYYY')}
                                                        </span>
                                                    </div>

                                                    {/* Time */}
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3 text-gray-300" />
                                                        <span className="text-[10px] text-gray-500 pry-ff">
                                                            {dayjs(visit.createdAt).format('hh:mm A')}
                                                        </span>
                                                    </div>

                                                    {/* Payment Status */}
                                                    <span className={`inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full sec-ff ${payment.badge}`}>
                                                        <PaymentIcon className="w-2.5 h-2.5" />
                                                        {visit.paymentStatus.charAt(0).toUpperCase() + visit.paymentStatus.slice(1)}
                                                    </span>
                                                </div>

                                                {/* Vitals Preview */}
                                                {visit.vitals && (
                                                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-500 pry-ff">
                                                        <span className="flex items-center gap-0.5">
                                                            <Weight className="w-3 h-3" />
                                                            {visit.vitals.weight}kg
                                                        </span>
                                                        <span className="flex items-center gap-0.5">
                                                            <Thermometer className="w-3 h-3" />
                                                            {visit.vitals.temp}°F
                                                        </span>
                                                        <span className="flex items-center gap-0.5">
                                                            <Heart className="w-3 h-3" />
                                                            {visit.vitals.pulse} bpm
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Billing */}
                                                {visit.billing && visit.billing.total > 0 && (
                                                    <div className="mt-1.5">
                                                        <span className="text-xs font-bold text-sec-clr sec-ff">
                                                            ₦{visit.billing.total.toLocaleString()}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}

                        {/* Show all visits link if there are more than 3 */}
                        {visits.length > 3 && (
                            <Link 
                                href="/dashboard/records"
                                className="block text-center text-xs font-semibold text-acc-clr hover:text-green-600 transition-colors py-2 sec-ff"
                            >
                                View all {visits.length} visits →
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}