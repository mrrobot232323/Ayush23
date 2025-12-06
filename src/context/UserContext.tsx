import React, { createContext, useContext, useState } from 'react';

export type UserProfile = {
    name: string;
    dob: string;
    age: number | null;
    gender: string;
    styles: string[];
    occupation: string;
    recentTrip: any | null; // For Step 5
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
    recentTrip: null,
    lookingFor: '',
    prompts: [],
    photos: [],
    location: '',
};

type UserContextType = {
    profile: UserProfile;
    updateProfile: (updates: Partial<UserProfile>) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [profile, setProfile] = useState<UserProfile>(defaultProfile);

    const updateProfile = (updates: Partial<UserProfile>) => {
        setProfile(prev => ({ ...prev, ...updates }));
    };

    return (
        <UserContext.Provider value={{ profile, updateProfile }}>
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
