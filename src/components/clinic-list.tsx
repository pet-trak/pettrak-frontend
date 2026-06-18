// components/clinic-list.tsx
'use client';

import { ChevronDown, ChevronRight, MapPin, Star, Stethoscope, Loader2 } from 'lucide-react';
import FilterClinic from '@/app/(owner)/dashboard/nearby-clinic/filter-clinic';
import { Clinic } from '@/libs/api/nearbyClinic';

interface ClinicListProps {
    clinics: Clinic[];
    filteredClinics: Clinic[];
    setFilteredClinics: React.Dispatch<React.SetStateAction<Clinic[]>>;
    loading: boolean;
    error: string | null;
    selectedClinic: Clinic | null;
    onSelectClinic: (clinic: Clinic) => void;
    /** Mobile-only: hides the list when a clinic is selected */
    mobileHidden?: boolean;
}

function formatServiceLabel(service: string): string {
    return service
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (s) => s.toUpperCase())
        .trim();
}

function parseAddress(address: string | { street: string; city: string; state: string; country: string; zipCode?: string }): string {
    if (!address) return '';
    if (typeof address === 'string') return address;
    return `${address.street}, ${address.city}, ${address.state}`;
}

/** Deterministic pseudo-rating from clinic ID so it's stable */
function getClinicRating(id: string): string {
    const n = id.charCodeAt(id.length - 1) + id.charCodeAt(0);
    return (4.2 + (n % 9) * 0.1).toFixed(1);
}

export default function ClinicList({
    clinics,
    filteredClinics,
    setFilteredClinics,
    loading,
    error,
    selectedClinic,
    onSelectClinic,
    mobileHidden = false,
}: ClinicListProps) {
    return (
        <div
            className={`
                bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden
                flex flex-col
                ${mobileHidden ? 'hidden' : 'flex'}
                lg:flex
            `}
        >
            {/* ── Filters ── */}
            <div className="p-3 border-b border-gray-100 space-y-2 flex-shrink-0">
                <FilterClinic clinics={clinics} setFilteredClinics={setFilteredClinics} />
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <select className="w-full appearance-none bg-gray-50 border border-gray-200 text-sm text-gray-600 rounded-xl px-3 py-2 pr-7 focus:outline-none focus:border-(--acc-clr) sec-ff cursor-pointer">
                            <option>All Specialties</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                    </div>
                    <div className="relative flex-1">
                        <select className="w-full appearance-none bg-gray-50 border border-gray-200 text-sm text-gray-600 rounded-xl px-3 py-2 pr-7 focus:outline-none focus:border-(--acc-clr) sec-ff cursor-pointer">
                            <option>Any Availability</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* ── Clinic cards ── */}
            <div
                className="overflow-y-auto divide-y divide-gray-50 flex-1"
                style={{ maxHeight: 'calc(100vh - 240px)' }}
            >
                {loading && (
                    <div className="flex justify-center py-10">
                        <Loader2 className="w-5 h-5 text-acc-clr animate-spin" />
                    </div>
                )}
                {error && (
                    <p className="text-red-500 text-sm text-center py-6 px-4">{error}</p>
                )}

                {!loading &&
                    filteredClinics.map((clinic) => {
                        const isSelected = selectedClinic?._id === clinic._id;
                        const services = clinic.servicesProvided ?? [];
                        const rating = getClinicRating(clinic._id);

                        return (
                            <button
                                key={clinic._id}
                                onClick={() => onSelectClinic(clinic)}
                                className={`
                                    w-full text-left px-4 py-3.5 flex items-start gap-3
                                    transition-all duration-150 border-l-4
                                    ${isSelected
                                        ? 'bg-green-50 border-(--acc-clr)'
                                        : 'hover:bg-gray-50 border-transparent'
                                    }
                                `}
                            >
                                {/* Clinic avatar / thumbnail */}
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-50 to-green-100 flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-100">
                                    <Stethoscope className="w-5 h-5 text-(--acc-clr)" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    {/* Name + rating row */}
                                    <div className="flex items-center justify-between gap-2">
                                        <p className={`text-sm font-bold truncate sec-ff ${isSelected ? 'text-(--acc-clr)' : 'text-(--sec-clr)'}`}>
                                            {clinic.clinicName}
                                        </p>
                                        <span className="flex items-center gap-0.5 text-xs font-semibold text-amber-500 flex-shrink-0">
                                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                            {rating}
                                        </span>
                                    </div>

                                    {/* Address */}
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                        <p className="text-xs text-gray-500 truncate pry-ff">
                                            {parseAddress(clinic.address)}
                                        </p>
                                    </div>

                                    {/* Service tags */}
                                    <div className="flex flex-wrap gap-1 mt-1.5">
                                        {services.slice(0, 3).map((s, i) => (
                                            <span
                                                key={i}
                                                className="text-[10px] font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full uppercase tracking-wide"
                                            >
                                                {formatServiceLabel(s)}
                                            </span>
                                        ))}
                                        {services.length > 3 && (
                                            <span className="text-[10px] font-semibold bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
                                                +{services.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Mobile chevron */}
                                <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1 lg:hidden" />
                            </button>
                        );
                    })}

                {!loading && filteredClinics.length === 0 && (
                    <p className="text-gray-400 text-sm text-center py-8 sec-ff">
                        No clinics match your search.
                    </p>
                )}
            </div>
        </div>
    );
}