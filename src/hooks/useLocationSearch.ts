import { useCallback, useRef, useState } from "react";

export interface LocationResult {
    place_id: number;
    display_name: string;
    address: {
        city?: string;
        town?: string;
        village?: string;
        state?: string;
        state_district?: string;
        county?: string;
        country?: string;
        country_code?: string;
        [key: string]: any;
    };
    lat: string;
    lon: string;
}

export const useLocationSearch = () => {
    const [results, setResults] = useState<LocationResult[]>([]);
    const [loading, setLoading] = useState(false);
    const debounceTimer = useRef<any>(null);

    const searchPlaces = useCallback((query: string) => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        if (!query || query.length < 2) {
            setResults([]);
            setLoading(false);
            return;
        }

        debounceTimer.current = setTimeout(async () => {
            setLoading(true);
            try {
                // Using OpenStreetMap Nominatim for smart fuzzy search
                // User-Agent is required by OSM policy
                const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=10&accept-language=en`;

                const response = await fetch(url, {
                    headers: {
                        "User-Agent": "MeetMilesApp/1.0"
                    }
                });

                const data = await response.json();

                if (Array.isArray(data)) {
                    setResults(data);
                } else {
                    setResults([]);
                }
            } catch (err) {
                console.error("Location search error:", err);
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 600); // 600ms debounce
    }, []);

    return { results, loading, searchPlaces };
};
