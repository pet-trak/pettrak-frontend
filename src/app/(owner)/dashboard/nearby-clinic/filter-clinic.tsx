// src/app/(owner)/dashboard/nearby-clinic/filter-clinic.tsx

'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Clinic } from '@/libs/api/nearbyClinic';

interface FilterClinicProps {
    clinics: Clinic[];
    setFilteredClinics: React.Dispatch<React.SetStateAction<Clinic[]>>;
}

export default function FilterClinic({
    clinics,
    setFilteredClinics,
}: FilterClinicProps) {
    const [query, setQuery] = useState('');

    useEffect(() => {
        if (!query.trim()) {
            setFilteredClinics(clinics);
            return;
        }

        const lowerQuery = query.toLowerCase();

        const filtered = clinics.filter((clinic) => {
            const nameMatch =
                clinic.clinicName?.toLowerCase().includes(lowerQuery);

            const serviceMatch =
                clinic.servicesProvided?.some((service) =>
                    service.toLowerCase().includes(lowerQuery)
                );

            const addressString =
                typeof clinic.address === 'string'
                    ? clinic.address
                    : JSON.stringify(clinic.address ?? '');

            const addressMatch =
                addressString.toLowerCase().includes(lowerQuery);

            return nameMatch || serviceMatch || addressMatch;
        });

        setFilteredClinics(filtered);
    }, [query, clinics, setFilteredClinics]);

    return (
        <div className="relative mb-6">
            <input
                type="text"
                placeholder="Search clinics by name, service, country, state, or city..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-10 py-2 rounded-xl border border-gray-300
                   focus:outline-none focus:ring-2
                   focus:ring-[var(--acc-clr)]"
                style={{ fontFamily: 'var(--sec-ff)' }}
            />

            <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                color="var(--acc-clr)"
            />
        </div>
    );
}