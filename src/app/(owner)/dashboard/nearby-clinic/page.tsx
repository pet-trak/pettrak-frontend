// src/app/(owner)/dashboard/nearby-clinic/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { fetchClinics, Clinic, Service } from '@/libs/api/nearbyClinic';
import Spinner from '@/components/ui/spinner';
import { MapPin, Clock, Stethoscope, ArrowRight } from 'lucide-react';
import FilterClinic from './filter-clinic';
import Link from 'next/link';

function formatServiceLabel(service: Service): string {
  return service.name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, s => s.toUpperCase())
    .trim();
}

export default function NearbyClinicsPage() {
  const [allClinics, setAllClinics]           = useState<Clinic[]>([]);
  const [filteredClinics, setFilteredClinics] = useState<Clinic[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState<string | null>(null);

  useEffect(() => {
    fetchClinics()
      .then(data => {
        setAllClinics(data);
        setFilteredClinics(data);
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to fetch clinics'))
      .finally(() => setLoading(false));
  }, []);

  const parseAddress = (a: Clinic['address']) =>
    [a.street, a.city, a.state, a.country].filter(Boolean).join(', ');

  return (
    <section className="p-6 max-w-7xl mx-auto">
      <h1
        className="text-3xl font-bold mb-6"
        style={{ fontFamily: 'var(--pry-ff)', color: 'var(--sec-clr)' }}
      >
        Nearby Clinics
      </h1>

      <FilterClinic
        clinics={allClinics}
        setFilteredClinics={setFilteredClinics}
      />

      {loading && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}

      {error && <p className="text-red-500 text-center">{error}</p>}

      {!loading && filteredClinics.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {filteredClinics.map(clinic => (
            <Link
              href={`/dashboard/nearby-clinic/${clinic._id}`}
              key={clinic._id}
              className="block"
            >
              <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition">
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-semibold text-xl uppercase">{clinic.clinicName}</h2>
                    {clinic.rating && clinic.rating.count > 0 && (
                      <span className="shrink-0 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        ★ {clinic.rating.average} ({clinic.rating.count})
                      </span>
                    )}
                  </div>

                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin size={16} className="mt-0.5 shrink-0" />
                    <span>{parseAddress(clinic.address)}</span>
                  </div>

                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <Clock size={16} className="mt-0.5 shrink-0" />
                    <span>
                      {clinic.daysOpen.join(', ')} ({clinic.startingTime} – {clinic.closingTime})
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {clinic.servicesProvided.length > 0 ? (
                      clinic.servicesProvided.map(service => (
                        <span
                          key={service._id}
                          style={{ backgroundColor: '#dcfce7', color: '#15803d' }}
                          className="text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1"
                        >
                          <Stethoscope size={12} />
                          {formatServiceLabel(service)}
                          {service.price > 0 && (
                            <span className="text-[9px] text-green-700 ml-0.5">
                              ₦{service.price.toLocaleString()}
                            </span>
                          )}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400 italic">No services listed</span>
                    )}
                  </div>

                  <button
                    className="mt-4 w-full text-white py-2 rounded-xl font-semibold flex justify-center items-center gap-2"
                    style={{ backgroundColor: 'var(--acc-clr)' }}
                  >
                    View Clinic Services <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && !error && filteredClinics.length === 0 && (
        <p className="text-gray-500 text-center mt-8">No clinics available.</p>
      )}
    </section>
  );
}