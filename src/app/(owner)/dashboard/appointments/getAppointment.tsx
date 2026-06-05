// src/app/(owner)/dashboard/appointments/getAppointment.tsx

'use client';

import { useEffect, useState } from "react";
import { getAppointments } from "@/libs/api/appointment";
import { useAuthStore } from "@/store/auth";
import { toast } from "sonner";
import dayjs from "dayjs";
import {
  Calendar, Heart, Info,
  User, MoreVertical, MapPin,
  Trash2, 
} from "lucide-react";
import Spinner from "@/components/ui/spinner";
import Link from "next/link";
import Image from "next/image";
import type { Appointment } from "@/libs/api/appointment";

const VIEW_TABS = ["overview", "today", "upcoming", "all plans"] as const;

const STATUS_STYLES: Record<string, { dot: string; badge: string }> = {
  pending: { dot: "bg-yellow-400", badge: "bg-yellow-50 text-yellow-700 border border-yellow-200" },
  confirmed: { dot: "bg-green-500", badge: "bg-green-50 text-green-700 border border-green-200" },
  completed: { dot: "bg-blue-400", badge: "bg-blue-50 text-blue-700 border border-blue-200" },
  cancelled: { dot: "bg-red-400", badge: "bg-red-50 text-red-700 border border-red-200" },
};

export default function UserAppointmentsPage() {
  const { profile } = useAuthStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState<typeof VIEW_TABS[number]>("overview");
  const [loading, setLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      // Check if user is authenticated and is an owner
      if (!profile) {
        toast.error("Please login to view your appointments");
        setLoading(false);
        return;
      }
      
      if (profile.type !== 'owner') {
        toast.error("Only pet owners can view appointments");
        setLoading(false);
        return;
      }
      
      try {
        const data = await getAppointments();
        setAppointments(data);
      } catch (err) {
        console.error("Failed to load appointments:", err);
        toast.error(err instanceof Error ? err.message : "An error occurred while loading appointments");
      } finally {
        setLoading(false);
      }
    }
    
    load();
  }, [profile]);

  useEffect(() => {
    const now = dayjs();
    if (activeTab === "today") {
      setFilteredAppointments(appointments.filter(a => dayjs(a.date).isSame(now, "day")));
    } else if (activeTab === "upcoming") {
      setFilteredAppointments(appointments.filter(a => dayjs(a.date).isAfter(now, "day")));
    } else if (activeTab === "overview") {
      setFilteredAppointments(appointments.filter(a => a.status === "pending" || a.status === "confirmed"));
    } else {
      setFilteredAppointments(appointments);
    }
  }, [activeTab, appointments]);

  // Show nothing while checking (will show loading or error state)
  // If no profile or not owner, show access restricted message
  if (!profile || profile.type !== 'owner') {
    return (
      <main className="p-4 sm:p-6 max-w-full mx-auto sec-ff">
        <div className="flex flex-col items-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <User className="w-12 h-12 text-gray-200 mb-3" />
          <p className="text-gray-400 font-semibold sec-ff text-sm">Access Restricted</p>
          <p className="text-gray-300 text-xs mt-1 pry-ff">Please login as a pet owner to view appointments.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="p-4 sm:p-6 max-w-full mx-auto sec-ff">
      {/* Page header */}
      <div className="mb-5">
        <h1 className="text-xl sm:text-2xl font-bold text-(--sec-clr) pry-ff">Appointments</h1>
        <p className="text-gray-400 text-sm mt-1 sec-ff">Manage your upcoming and past pet appointments.</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit flex-wrap">
        {VIEW_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer sec-ff capitalize
                            ${activeTab === tab
                ? "bg-white text-(--sec-clr) shadow-sm"
                : "text-gray-500 hover:text-gray-700"
              }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredAppointments.length === 0 && (
        <div className="flex flex-col items-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <Calendar className="w-12 h-12 text-gray-200 mb-3" />
          <p className="text-gray-400 font-semibold sec-ff text-sm">No appointments found</p>
          <p className="text-gray-300 text-xs mt-1 pry-ff">Try a different filter or book a new appointment.</p>
        </div>
      )}

      {/* ── Desktop: Table layout ── */}
      {!loading && filteredAppointments.length > 0 && (
        <>
          {/* Table — md+ */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-4">
            {/* Table header */}
            <div className="grid grid-cols-[auto_1fr_1fr_auto_auto] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100">
              {["Pet", "Vet Service", "Date & Time", "Status", "Actions"].map(h => (
                <span key={h} className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide sec-ff">{h}</span>
              ))}
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-50">
              {filteredAppointments.map(a => {
                const status = STATUS_STYLES[a.status] ?? { dot: "bg-gray-300", badge: "bg-gray-50 text-gray-500 border border-gray-200" };
                return (
                  <Link key={a._id} href={`/dashboard/appointments/${a._id}`} className="block group">
                    <div className="grid grid-cols-[auto_1fr_1fr_auto_auto] gap-4 items-center px-5 py-3.5 hover:bg-gray-50 transition-colors duration-150">
                      {/* Pet */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-green-50 border border-gray-100 flex-shrink-0">
                          {a.pet?.photo ? (
                            <Image width={40} height={40} src={a.pet.photo} alt={a.pet.name || 'Pet'} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Heart className="w-4 h-4 text-(--acc-clr)" />
                            </div>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-(--sec-clr) sec-ff whitespace-nowrap">{a.pet?.name ?? 'Unknown'}</span>
                      </div>

                      {/* Vet Service */}
                      <div>
                        <p className="text-sm font-semibold text-(--sec-clr) sec-ff capitalize">{a.type || 'General Checkup'}</p>
                        {a.clinic?.clinicName && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            <p className="text-xs text-gray-400 pry-ff truncate">{a.clinic.clinicName}</p>
                          </div>
                        )}
                      </div>

                      {/* Date & Time */}
                      <div>
                        <p className="text-sm font-semibold text-(--sec-clr) sec-ff">{dayjs(a.date).format("DD MMM YYYY")}</p>
                        <div className="flex items-center gap-1 mt-0.5 justify-center">
                          <p className="text-xs text-gray-400 pry-ff">{a.time}</p>
                        </div>
                      </div>

                      {/* Status */}
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg sec-ff whitespace-nowrap ${status.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                      </span>

                      {/* Actions */}
                      <div className="relative flex items-center gap-1.5">
                        <button
                          className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            setOpenDropdown(openDropdown === a._id ? null : a._id);
                          }}
                        >
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        </button>

                        {openDropdown === a._id && (
                          <>
                            {/* backdrop to close on outside click */}
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setOpenDropdown(null)}
                            />
                            <div className="absolute right-0 top-9 z-20 bg-white border border-gray-100 rounded-xl shadow-lg w-36 py-1 overflow-hidden">
                              <button
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors sec-ff"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setOpenDropdown(null);
                                  toast.error('Delete coming soon!');
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* ── Mobile: Card grid ── */}
          <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {filteredAppointments.map(a => {
              const status = STATUS_STYLES[a.status] ?? { dot: "bg-gray-300", badge: "bg-gray-50 text-gray-500 border border-gray-200" };
              return (
                <Link key={a._id} href={`/dashboard/appointments/${a._id}`} className="block group">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
                    {/* Pet image strip */}
                    <div className="relative h-28 bg-green-50">
                      {a.pet?.photo ? (
                        <Image
                          src={a.pet.photo} width={400} height={112}
                          alt={a.pet.name || 'Pet'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Heart className="w-12 h-12 text-(--acc-clr)/20" />
                        </div>
                      )}
                      {/* Status badge */}
                      <div className="absolute top-2 right-2">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full sec-ff ${status.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                          {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                        </span>
                      </div>
                      {/* Date chip */}
                      <div className="absolute bottom-2 left-2">
                        <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
                          <Calendar className="w-3 h-3 text-(--acc-clr)" />
                          <span className="text-xs font-semibold text-(--sec-clr) sec-ff">{dayjs(a.date).format("MMM D")}</span>
                          <span className="text-xs text-gray-400">· {a.time}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3">
                      {/* Pet + owner */}
                      <div className="flex items-start gap-2 mb-2.5">
                        <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-(--acc-clr)" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-gray-400 pry-ff">Owner</p>
                          <p className="text-sm font-bold text-(--sec-clr) sec-ff truncate">{a.owner?.fullname ?? 'Unknown'}</p>
                          <p className="text-xs text-gray-500 sec-ff truncate">{a.pet?.name} · {a.pet?.breed ?? 'Mixed'}</p>
                        </div>
                      </div>

                      {/* Service */}
                      <div className="bg-gray-50 rounded-xl px-3 py-2 mb-3 border border-gray-100">
                        <p className="text-[10px] text-gray-400 pry-ff">Service</p>
                        <p className="text-xs font-semibold text-(--sec-clr) capitalize sec-ff">{a.type || 'General Checkup'}</p>
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-2">
                        <button
                          className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
                          onClick={(e) => { e.preventDefault(); toast.info('More info coming soon!'); }}
                        >
                          <Info className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
}