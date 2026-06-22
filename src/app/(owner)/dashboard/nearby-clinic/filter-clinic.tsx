// app/(owner)/dashboard/nearby-clinic/filter-clinic.tsx
'use client';

import { useState, useCallback, useRef } from 'react';
import { Search, X, SlidersHorizontal, ChevronDown, AlertCircle } from 'lucide-react';
import { searchClinics, Clinic, SearchClinicsParams } from '@/libs/api/nearbyClinic';

const SERVICES = [
  { key: 'consultation',       label: 'Consultation' },
  { key: 'vaccination',        label: 'Vaccination' },
  { key: 'surgery',            label: 'Surgery' },
  { key: 'minorSurgery',       label: 'Minor Surgery' },
  { key: 'majorSurgery',       label: 'Major Surgery' },
  { key: 'emergency',          label: 'Emergency' },
  { key: 'diagnostics',        label: 'Diagnostics' },
  { key: 'laboratoryTest',     label: 'Laboratory Test' },
  { key: 'xRay',               label: 'X-Ray' },
  { key: 'ultrasound',         label: 'Ultrasound' },
  { key: 'dentalCare',         label: 'Dental Care' },
  { key: 'grooming',           label: 'Grooming' },
  { key: 'boarding',           label: 'Boarding' },
  { key: 'deworming',          label: 'Deworming' },
  { key: 'spayNeuter',         label: 'Spay / Neuter' },
  { key: 'homeVisit',          label: 'Home Visit' },
  { key: 'teleConsultation',   label: 'Tele-Consultation' },
  { key: 'euthanasia',         label: 'Euthanasia' },
  { key: 'livestockVisit',     label: 'Livestock Visit' },
];

const ANIMALS = [
  'Dog', 'Cat', 'Bird', 'Rabbit', 'Horse',
  'Cattle', 'Goat', 'Sheep', 'Pig', 'Fish',
];

interface FilterClinicProps {
  clinics: Clinic[];
  setFilteredClinics: React.Dispatch<React.SetStateAction<Clinic[]>>;
}

export default function FilterClinic({ clinics, setFilteredClinics }: FilterClinicProps) {
  const [search, setSearch]                     = useState('');
  const [street, setStreet]                     = useState('');
  const [city, setCity]                         = useState('');
  const [state, setState]                       = useState('');
  const [country, setCountry]                   = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedAnimals, setSelectedAnimals]   = useState<string[]>([]);
  const [showFilters, setShowFilters]           = useState(false);
  const [loading, setLoading]                   = useState(false);
  const [error, setError]                       = useState<string | null>(null);
  const [notFoundLocally, setNotFoundLocally]   = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasFilters =
    search.trim() || street.trim() || city.trim() || state.trim() ||
    country.trim() || selectedServices.length > 0 || selectedAnimals.length > 0;

  const runSearch = useCallback(async (params: SearchClinicsParams) => {
    const isEmpty =
      !params.search?.trim() && !params.street?.trim() && !params.city?.trim() &&
      !params.state?.trim()  && !params.country?.trim() &&
      !params.services?.trim() && !params.animals?.trim();

    if (isEmpty) {
      setNotFoundLocally(false);
      setFilteredClinics(clinics);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await searchClinics(params);
      setFilteredClinics(result.clinics);
      setNotFoundLocally(result.notFoundLocally);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }, [clinics, setFilteredClinics]);

  const scheduleSearch = (overrides: Partial<SearchClinicsParams> = {}) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      runSearch({
        search:   overrides.search   ?? search,
        street:   overrides.street   ?? street,
        city:     overrides.city     ?? city,
        state:    overrides.state    ?? state,
        country:  overrides.country  ?? country,
        services: overrides.services ?? selectedServices.join(','),
        animals:  overrides.animals  ?? selectedAnimals.join(','),
      });
    }, 400);
  };

  const handleSearchInput = (val: string) => {
    setSearch(val);
    scheduleSearch({ search: val });
  };

  const handleLocationInput = (
    field: 'street' | 'city' | 'state' | 'country',
    val: string
  ) => {
    const setters = { street: setStreet, city: setCity, state: setState, country: setCountry };
    setters[field](val);
    scheduleSearch({ [field]: val });
  };

  const toggleService = (key: string) => {
    const updated = selectedServices.includes(key)
      ? selectedServices.filter(s => s !== key)
      : [...selectedServices, key];
    setSelectedServices(updated);
    scheduleSearch({ services: updated.join(',') });
  };

  const toggleAnimal = (animal: string) => {
    const lower = animal.toLowerCase();
    const updated = selectedAnimals.includes(lower)
      ? selectedAnimals.filter(a => a !== lower)
      : [...selectedAnimals, lower];
    setSelectedAnimals(updated);
    scheduleSearch({ animals: updated.join(',') });
  };

  const clearAll = () => {
    setSearch('');
    setStreet('');
    setCity('');
    setState('');
    setCountry('');
    setSelectedServices([]);
    setSelectedAnimals([]);
    setNotFoundLocally(false);
    setError(null);
    setFilteredClinics(clinics);
  };

  const activeChipCount = selectedServices.length + selectedAnimals.length;

  return (
    <div className="flex flex-col gap-2">

      {/* Search bar + filter toggle */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Service, clinic name, animal..."
            value={search}
            onChange={e => handleSearchInput(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 text-sm text-gray-700 rounded-xl focus:outline-none focus:border-(--acc-clr) focus:ring-1 focus:ring-(--acc-clr) placeholder:text-gray-400"
          />
          {search && (
            <button
              onClick={() => handleSearchInput('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(p => !p)}
          className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 transition shrink-0"
        >
          <SlidersHorizontal size={14} />
          <ChevronDown
            size={13}
            className={`transition-transform ${showFilters ? 'rotate-180' : ''}`}
          />
          {activeChipCount > 0 && (
            <span
              className="text-[10px] text-white rounded-full w-4 h-4 flex items-center justify-center"
              style={{ backgroundColor: 'var(--acc-clr)' }}
            >
              {activeChipCount}
            </span>
          )}
        </button>

        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-gray-400 hover:text-gray-700 transition shrink-0"
          >
            Clear
          </button>
        )}
      </div>

      {/* Expandable filters panel */}
      {showFilters && (
        <div className="border border-gray-200 rounded-2xl p-3 bg-gray-50 flex flex-col gap-4">

          {/* Location */}
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
              Location
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { field: 'street',  placeholder: 'Street'  },
                  { field: 'city',    placeholder: 'City'    },
                  { field: 'state',   placeholder: 'State'   },
                  { field: 'country', placeholder: 'Country' },
                ] as const
              ).map(({ field, placeholder }) => (
                <input
                  key={field}
                  type="text"
                  placeholder={placeholder}
                  value={{ street, city, state, country }[field]}
                  onChange={e => handleLocationInput(field, e.target.value)}
                  className="px-3 py-1.5 bg-white border border-gray-200 text-sm text-gray-700 rounded-xl focus:outline-none focus:border-(--acc-clr) focus:ring-1 focus:ring-(--acc-clr) placeholder:text-gray-400"
                />
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
              Services
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SERVICES.map(({ key, label }) => {
                const active = selectedServices.includes(key);
                return (
                  <button
                    key={key}
                    onClick={() => toggleService(key)}
                    className="text-[11px] px-2.5 py-1 rounded-full border transition font-medium"
                    style={
                      active
                        ? { backgroundColor: 'var(--acc-clr)', color: '#fff', borderColor: 'var(--acc-clr)' }
                        : { backgroundColor: '#fff', color: '#6b7280', borderColor: '#e5e7eb' }
                    }
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Animals */}
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
              Animals Handled
            </p>
            <div className="flex flex-wrap gap-1.5">
              {ANIMALS.map(animal => {
                const active = selectedAnimals.includes(animal.toLowerCase());
                return (
                  <button
                    key={animal}
                    onClick={() => toggleAnimal(animal)}
                    className="text-[11px] px-2.5 py-1 rounded-full border transition font-medium"
                    style={
                      active
                        ? { backgroundColor: 'var(--acc-clr)', color: '#fff', borderColor: 'var(--acc-clr)' }
                        : { backgroundColor: '#fff', color: '#6b7280', borderColor: '#e5e7eb' }
                    }
                  >
                    {animal}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Status */}
      {loading && (
        <p className="text-xs text-gray-400 animate-pulse px-1">Searching...</p>
      )}
      {error && (
        <p className="text-xs text-red-500 px-1">{error}</p>
      )}
      {notFoundLocally && !loading && (
        <div className="flex items-start gap-2 px-3 py-2 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 text-xs">
          <AlertCircle size={13} className="mt-0.5 shrink-0" />
          <span>
            No clinics in your specified location offer this service — showing best matches by rating.
          </span>
        </div>
      )}
    </div>
  );
}