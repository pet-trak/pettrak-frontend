// Dashboard.tsx
"use client";
import PetCard from "@/components/pet-card";
import GetAppointments from "@/components/appointments/getAppointment"


export default function Dashboard() {
    return (
        <main className="min-h-screen px-4 md:px-6 py-6">

            {/* Main Grid */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left / Main content */}
                <div className="lg:col-span-8 space-y-6">
                    <PetCard />
                    <GetAppointments />
                </div>

                {/* Right rail
                <aside className="lg:col-span-4 space-y-6">
                    <HealthAlerts />
                </aside> */}
            </section>
        </main>
    );
}