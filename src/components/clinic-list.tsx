// components/clinic-list.tsx
'use client';

import { ChevronRight, MapPin, Star, Stethoscope, Loader2 } from 'lucide-react';
import FilterClinic from '@/app/(owner)/dashboard/nearby-clinic/filter-clinic';
import { Clinic, Service } from '@/libs/api/nearbyClinic';

interface ClinicListProps {
  clinics: Clinic[];
  filteredClinics: Clinic[];
  setFilteredClinics: React.Dispatch<React.SetStateAction<Clinic[]>>;
  loading: boolean;
  error: string | null;
  selectedClinic: Clinic | null;
  onSelectClinic: (clinic: Clinic) => void;
  mobileHidden?: boolean;
}

function formatServiceLabel(service: Service): string {
  return service.name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, s => s.toUpperCase())
    .trim();
}

function parseAddress(address: Clinic['address']): string {
  if (!address) return '';
  return [address.street, address.city, address.state].filter(Boolean).join(', ');
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
        bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col
        ${mobileHidden ? 'hidden' : 'flex'} lg:flex
      `}
    >
      {/* Filter */}
      <div className="p-3 border-b border-gray-100 flex-shrink-0">
        <FilterClinic clinics={clinics} setFilteredClinics={setFilteredClinics} />
      </div>

      {/* Clinic cards */}
      <div
        className="overflow-y-auto divide-y divide-gray-50 flex-1"
        style={{ maxHeight: 'calc(100vh - 240px)' }}
      >
        {loading && (
          <div className="flex justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--acc-clr)' }} />
          </div>
        )}

        {error && (
          <p className="text-red-500 text-sm text-center py-6 px-4">{error}</p>
        )}

        {!loading && filteredClinics.map(clinic => {
          const isSelected = selectedClinic?._id === clinic._id;
          const services   = clinic.servicesProvided ?? [];
          const hasRating  = clinic.rating && clinic.rating.count > 0;

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
              {/* Avatar */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-50 to-green-100 flex-shrink-0 flex items-center justify-center border border-gray-100">
                <Stethoscope className="w-5 h-5" style={{ color: 'var(--acc-clr)' }} />
              </div>

              <div className="flex-1 min-w-0">
                {/* Name + rating */}
                <div className="flex items-center justify-between gap-2">
                  <p
                    className="text-sm font-bold truncate sec-ff"
                    style={{ color: isSelected ? 'var(--acc-clr)' : 'var(--sec-clr)' }}
                  >
                    {clinic.clinicName}
                  </p>
                  {hasRating ? (
                    <span className="flex items-center gap-0.5 text-xs font-semibold text-amber-500 flex-shrink-0">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {clinic.rating!.average} ({clinic.rating!.count})
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-300 flex-shrink-0">No reviews</span>
                  )}
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
                  {services.slice(0, 3).map(service => (
                    <span
                      key={service._id}
                      className="text-[10px] font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full uppercase tracking-wide"
                    >
                      {formatServiceLabel(service)}
                    </span>
                  ))}
                  {services.length > 3 && (
                    <span className="text-[10px] font-semibold bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
                      +{services.length - 3} more
                    </span>
                  )}
                </div>
              </div>

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