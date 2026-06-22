// Dashboard.tsx
"use client";
import PetCard from "@/components/pet-card";
import GetAppointments from "@/components/appointments/getAppointment";
import VisitCard from "@/components/visit-card";
import WelcomeNav from "@/components/welcome-nav";

export default function Dashboard() {
    return (
        <main className="min-h-screen px-2 sm:px-4 md:px-6 ">
            {/* Welcome Section */}
            <div className="mb-6">
                <WelcomeNav />
            </div>

            {/* Full width Pet Card */}
            <div className="mb-6">
                <PetCard />
            </div>

            {/* Two column layout for appointments and visits */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GetAppointments />
                <VisitCard />
            </div>
        </main>
    );
}