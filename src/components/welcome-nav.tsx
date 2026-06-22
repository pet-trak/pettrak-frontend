// components/welcome-nav.tsx

'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { getUserProfile } from '@/libs/api/user';
import { User, PawPrint, Calendar, Activity, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function WelcomeNav() {
    const { profile, setProfile, token } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [petCount, setPetCount] = useState(0);

    useEffect(() => {
        async function loadProfile() {
            // If we have a token but no profile, fetch it
            if (token && !profile) {
                try {
                    const userProfile = await getUserProfile();
                    // setProfile expects both profile and token
                    setProfile(userProfile, token);
                    setPetCount(userProfile.pets?.length || 0);
                } catch (error) {
                    console.error('Failed to load profile:', error);
                } finally {
                    setLoading(false);
                }
            } else if (profile) {
                // Profile already exists in store
                setPetCount(profile.pets?.length || 0);
                setLoading(false);
            } else {
                // No token and no profile
                setLoading(false);
            }
        }

        loadProfile();
    }, [profile, setProfile, token]);

    if (loading) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 lg:p-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-200 animate-pulse"></div>
                    <div className="flex-1">
                        <div className="h-5 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    }

    // If no profile or token, show a limited version
    if (!profile || !token) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 lg:p-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                        <h1 className="text-lg lg:text-xl font-bold text-sec-clr sec-ff">
                            Welcome Back! 👋
                        </h1>
                        <p className="text-sm text-gray-500 pry-ff mt-0.5">
                            Please login to view your pets.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const fullname = profile.fullname || 'Pet Owner';
    const firstName = fullname.split(' ')[0] || 'Pet Owner';

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center border border-green-100 flex-shrink-0">
                        <User className="w-6 h-6 text-acc-clr" />
                    </div>

                    {/* Welcome Text */}
                    <div>
                        <h1 className="text-lg lg:text-xl font-bold text-sec-clr sec-ff">
                            Welcome back, {firstName}!
                        </h1>
                        <p className="text-sm text-gray-500 pry-ff mt-0.5">
                            Here&apos;s what&apos;s happening to your pets today.
                        </p>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="flex items-center gap-3">
                    {/* Pet Count */}
                    <div className="flex items-center gap-2 bg-green-50 rounded-xl px-3 py-2 border border-green-100">
                        <PawPrint className="w-4 h-4 text-acc-clr" />
                        <span className="text-sm font-bold text-sec-clr sec-ff">
                            {petCount} {petCount === 1 ? 'Pet' : 'Pets'}
                        </span>
                    </div>

                    {/* View All Link - Hidden on mobile */}
                    <Link 
                        href="/dashboard/profile"
                        className="hidden sm:flex items-center gap-1 text-sm font-semibold text-acc-clr hover:text-green-600 transition-colors sec-ff"
                    >
                        View All
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* Quick Stats Row - Mobile only */}
            <div className="flex items-center gap-3 mt-4 sm:hidden">
                <Link 
                    href="/dashboard/pets"
                    className="flex items-center gap-1.5 text-xs font-semibold text-acc-clr hover:text-green-600 transition-colors sec-ff"
                >
                    View All Pets
                    <ChevronRight className="w-3.5 h-3.5" />
                </Link>
                <span className="text-gray-300">|</span>
                <Link 
                    href="/dashboard/appointments"
                    className="flex items-center gap-1.5 text-xs font-semibold text-acc-clr hover:text-green-600 transition-colors sec-ff"
                >
                    <Calendar className="w-3.5 h-3.5" />
                    Appointments
                </Link>
                <span className="text-gray-300">|</span>
                <Link 
                    href="/dashboard/records"
                    className="flex items-center gap-1.5 text-xs font-semibold text-acc-clr hover:text-green-600 transition-colors sec-ff"
                >
                    <Activity className="w-3.5 h-3.5" />
                    Records
                </Link>
            </div>
        </div>
    );
}