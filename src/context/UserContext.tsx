import React, { createContext, useContext, useState } from 'react';

export type Trip = {
    id: string;
    destination: string;
    tripType: string;
    startDate: string;
    endDate: string;
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
    recentTrip: Trip | null; // Kept for easy access to the "main" trip
    trips: Trip[]; // History of all trips
    lookingFor: string;
    prompts: any[];
    photos: string[];
    location: string;
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
};

type UserContextType = {
    profile: UserProfile;
    updateProfile: (updates: Partial<UserProfile>) => void;
    addTrip: (trip: Trip) => void;
    editTrip: (trip: Trip) => void;
    deleteTrip: (id: string) => void;
    viewedProfile: any;
    setViewedProfile: (p: any) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [profile, setProfile] = useState<UserProfile>(defaultProfile);
    const [viewedProfile, setViewedProfile] = useState<any>(null);

    const updateProfile = (updates: Partial<UserProfile>) => {
        setProfile(prev => ({ ...prev, ...updates }));
    };

    const addTrip = (trip: Trip) => {
        setProfile(prev => ({
            ...prev,
            trips: [trip, ...prev.trips], // Add new trip to the beginning
            recentTrip: trip, // Auto-set as recent
        }));
    };

    const editTrip = (updatedTrip: Trip) => {
        setProfile(prev => {
            const updatedTrips = prev.trips.map(t => t.id === updatedTrip.id ? updatedTrip : t);
            const isRecent = prev.recentTrip?.id === updatedTrip.id;
            return {
                ...prev,
                trips: updatedTrips,
                recentTrip: isRecent ? updatedTrip : prev.recentTrip,
            };
        });
    };

    const deleteTrip = (id: string) => {
        setProfile(prev => {
            const updatedTrips = prev.trips.filter(t => t.id !== id);
            const isRecent = prev.recentTrip?.id === id;
            return {
                ...prev,
                trips: updatedTrips,
                recentTrip: isRecent ? (updatedTrips.length > 0 ? updatedTrips[0] : null) : prev.recentTrip,
            };
        });
    };

    return (
        <UserContext.Provider value={{ profile, updateProfile, addTrip, editTrip, deleteTrip, viewedProfile, setViewedProfile }}>
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
