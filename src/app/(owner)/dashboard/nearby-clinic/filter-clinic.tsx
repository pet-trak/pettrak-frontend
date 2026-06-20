// app/(owner)/dashboard/nearby-clinic/filter-clinic.tsx
'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Clinic, Service } from '@/libs/api/nearbyClinic';

interface FilterClinicProps {
    clinics: Clinic[];
    setFilteredClinics: React.Dispatch<React.SetStateAction<Clinic[]>>;
}

export default function FilterClinic({ clinics, setFilteredClinics }: FilterClinicProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        
        if (!term.trim()) {
            setFilteredClinics(clinics);
            return;
        }

        const filtered = clinics.filter((clinic) => {
            const matchesName = clinic.clinicName.toLowerCase().includes(term.toLowerCase());
            
            // Check if any service matches (handling both string and object)
            const matchesService = clinic.servicesProvided.some((service) => {
                const serviceName = typeof service === 'string' ? service : service.name;
                return serviceName.toLowerCase().includes(term.toLowerCase());
            });
            
            return matchesName || matchesService;
        });

        setFilteredClinics(filtered);
    };

    return (
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
                type="text"
                placeholder="Search clinics or services..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 text-sm text-gray-700 rounded-xl focus:outline-none focus:border-(--acc-clr) focus:ring-1 focus:ring-(--acc-clr) placeholder:text-gray-400"
            />
            {searchTerm && (
                <button
                    onClick={() => handleSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
            )}
        </div>
    );
}