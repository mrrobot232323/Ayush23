import { Session } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// FIXED: Updated Trip type to handle both Old (place/vibe) and New (destination/tripType) formats
export type Trip = {
    id?: string;
    destination: string;
    place?: string;       // Added for compatibility
    tripType?: string;
    vibe?: string;        // Added for compatibility
    startDate?: string;
    endDate?: string;
    image?: string;
};

export type UserProfile = {
    name: string;
    dob: string;
    age: number | null;
    gender: string;
    styles: string[];
    occupation: string;
    company: string;
    college: string;
    recentTrip: Trip | null;
    trips: Trip[];
    lookingFor: string;
    prompts: any[];
    photos: string[];
    location: string;
    interestedIn: string[];
    email?: string;
    // UI Specific / Optional fields
    verified?: boolean;
    distanceKm?: number;
    pronouns?: string;
    bio?: string;
    badges?: string[];
};

const defaultProfile: UserProfile = {
    name: '',
    dob: '',
    age: null,
    gender: '',
    styles: [],
    occupation: '',
    company: '',
    college: '',
    recentTrip: null,
    trips: [],
    lookingFor: '',
    prompts: [],
    photos: [],
    location: '',
    interestedIn: [],
    email: '',
};

type UserContextType = {
    profile: UserProfile;
    updateProfile: (updates: Partial<UserProfile>) => void;
    addTrip: (trip: Trip) => void;
    editTrip: (trip: Trip) => void;
    deleteTrip: (id: string) => void;
    viewedProfile: UserProfile | null; // Changed from 'any' to 'UserProfile | null' for safety
    setViewedProfile: (p: any) => void;
    session: Session | null;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

// FIXED: Helper to Safely Map DB snake_case to CamelCase
const mapDbToProfile = (dbProfile: any): Partial<UserProfile> => {

    // 1. Handle Prompts (DB might return Object or Array)
    let safePrompts = [];
    if (Array.isArray(dbProfile.prompts)) {
        safePrompts = dbProfile.prompts;
    } else if (dbProfile.prompts && typeof dbProfile.prompts === 'object') {
        // If it's a single object (e.g. {bio: "..."}), wrap it
        safePrompts = [dbProfile.prompts];
    }

    // 2. Handle Trip Logic (Normalize 'place' -> 'destination')
    const normalizeTrip = (rawTrip: any): Trip | null => {
        if (!rawTrip) return null;
        return {
            id: rawTrip.id || 'temp-id',
            destination: rawTrip.destination || rawTrip.place || '', // Fallback to 'place' if destination missing
            place: rawTrip.place,
            tripType: rawTrip.tripType || rawTrip.vibe || '',      // Fallback to 'vibe'
            vibe: rawTrip.vibe,
            startDate: rawTrip.startDate || rawTrip.date || '',    // Fallback to 'date'
            endDate: rawTrip.endDate || '',
            image: rawTrip.image || ''
        };
    };

    const safeRecentTrip = normalizeTrip(dbProfile.recent_trip);
    const safeTrips = Array.isArray(dbProfile.trips) ? dbProfile.trips.map(normalizeTrip).filter(Boolean) : [];

    return {
        name: dbProfile.name || '',
        dob: dbProfile.dob || '',
        age: dbProfile.age || null,
        gender: dbProfile.gender || '',
        styles: Array.isArray(dbProfile.styles) ? dbProfile.styles : [], // Ensure array
        occupation: dbProfile.occupation || '',
        company: dbProfile.company || '',
        college: dbProfile.college || '',
        lookingFor: dbProfile.looking_for || '',

        prompts: safePrompts,
        photos: (function () {
            const raw = dbProfile.photos;
            if (Array.isArray(raw)) return raw;
            if (typeof raw === 'string') {
                try {
                    let clean = raw.trim();
                    // Handle Postgres {url,url} format
                    if (clean.startsWith('{') && clean.endsWith('}')) {
                        clean = '[' + clean.substring(1, clean.length - 1) + ']';
                    }
                    const parsed = JSON.parse(clean);
                    return Array.isArray(parsed) ? parsed : [];
                } catch (e) {
                    return raw.length > 5 ? [raw] : [];
                }
            }
            return [];
        })(),
        location: dbProfile.location || '',
        recentTrip: safeRecentTrip,
        trips: safeTrips as Trip[],
        interestedIn: dbProfile.prompts?.interested_in || [],
        email: dbProfile.email || '',
    };
};

// Helper to map CamelCase to DB snake_case
const mapProfileToDb = (profile: Partial<UserProfile>) => {
    const dbProfile: any = {};
    if (profile.name !== undefined) dbProfile.name = profile.name;
    if (profile.dob !== undefined) dbProfile.dob = profile.dob;
    if (profile.age !== undefined) dbProfile.age = profile.age;
    if (profile.gender !== undefined) dbProfile.gender = profile.gender;
    if (profile.styles !== undefined) dbProfile.styles = profile.styles;
    if (profile.occupation !== undefined) dbProfile.occupation = profile.occupation;
    if (profile.company !== undefined) dbProfile.company = profile.company;
    if (profile.college !== undefined) dbProfile.college = profile.college;
    if (profile.lookingFor !== undefined) dbProfile.looking_for = profile.lookingFor;
    if (profile.prompts !== undefined) dbProfile.prompts = profile.prompts;
    if (profile.photos !== undefined) dbProfile.photos = profile.photos;
    if (profile.location !== undefined) dbProfile.location = profile.location;
    if (profile.recentTrip !== undefined) dbProfile.recent_trip = profile.recentTrip;
    if (profile.trips !== undefined) dbProfile.trips = profile.trips;
    return dbProfile;
};

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [profile, setProfile] = useState<UserProfile>(defaultProfile);
    const [viewedProfile, setViewedProfile] = useState<UserProfile | null>(null);
    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session }, error }) => {
            if (error) {
                console.log("Session error:", error.message);
                // Handle invalid refresh token by signing out
                if (error.message.includes("Refresh Token")) {
                    supabase.auth.signOut();
                    setSession(null);
                    return;
                }
            }
            setSession(session);
            if (session?.user) {
                fetchProfile(session.user.id);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setProfile(defaultProfile);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
            if (error) {
                console.log('Error fetching profile:', error);
                return;
            }
            if (data) {
                setProfile(prev => ({ ...prev, ...mapDbToProfile(data) }));
            }
        } catch (e) {
            console.log('Error in fetchProfile:', e);
        }
    };

    const updateProfile = async (updates: Partial<UserProfile>) => {
        setProfile(prev => {
            const newProfile = { ...prev, ...updates };

            if (session?.user) {
                const dbUpdates = mapProfileToDb(updates);
                if (updates.interestedIn) {
                    const currentPrompts = Array.isArray(prev.prompts) ? {} : (prev.prompts || {});
                    dbUpdates.prompts = {
                        ...currentPrompts,
                        ...dbUpdates.prompts,
                        interested_in: updates.interestedIn
                    };
                }
                supabase.from('profiles').update(dbUpdates).eq('id', session.user.id).then(({ error }) => {
                    if (error) console.error('Error updating profile:', error);
                });
            }
            return newProfile;
        });
    };

    const addTrip = (trip: Trip) => {
        setProfile(prev => {
            const newTrips = [trip, ...prev.trips];
            const newProfile = { ...prev, trips: newTrips, recentTrip: trip };
            if (session?.user) {
                supabase.from('profiles').update({ trips: newTrips, recent_trip: trip }).eq('id', session.user.id).then(({ error }) => {
                    if (error) console.error(error);
                });
            }
            return newProfile;
        });
    };

    const editTrip = (updatedTrip: Trip) => {
        setProfile(prev => {
            const updatedTrips = prev.trips.map(t => t.id === updatedTrip.id ? updatedTrip : t);
            const isRecent = prev.recentTrip?.id === updatedTrip.id;
            const newRecent = isRecent ? updatedTrip : prev.recentTrip;

            const newProfile = { ...prev, trips: updatedTrips, recentTrip: newRecent };

            if (session?.user) {
                supabase.from('profiles').update({ trips: updatedTrips, recent_trip: newRecent }).eq('id', session.user.id).then(({ error }) => {
                    if (error) console.error(error);
                });
            }
            return newProfile;
        });
    };

    const deleteTrip = (id: string) => {
        setProfile(prev => {
            const updatedTrips = prev.trips.filter(t => t.id !== id);
            const isRecent = prev.recentTrip?.id === id;
            const newRecent = isRecent ? (updatedTrips.length > 0 ? updatedTrips[0] : null) : prev.recentTrip;

            const newProfile = { ...prev, trips: updatedTrips, recentTrip: newRecent };

            if (session?.user) {
                supabase.from('profiles').update({ trips: updatedTrips, recent_trip: newRecent }).eq('id', session.user.id).then(({ error }) => {
                    if (error) console.error(error);
                });
            }
            return newProfile;
        });
    };

    return (
        <UserContext.Provider value={{ profile, updateProfile, addTrip, editTrip, deleteTrip, viewedProfile, setViewedProfile, session }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};