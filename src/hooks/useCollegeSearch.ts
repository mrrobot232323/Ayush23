import { useEffect, useState } from "react";

export const useCollegeSearch = (query: string) => {
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!query || query.length < 2) {
            setResults([]);
            setLoading(false);
            return;
        }

        const timer = setTimeout(() => {
            let active = true;
            setLoading(true);

            const fetchData = async () => {
                try {
                    const url = `https://universities.hipolabs.com/search?name=${encodeURIComponent(query)}&country=India`;
                    const res = await fetch(url);
                    const data = await res.json();

                    if (active) setResults(data);
                } catch (err) {
                    console.log("College search error:", err);
                } finally {
                    if (active) setLoading(false);
                }
            };

            fetchData();

            return () => {
                active = false;
            };
        }, 500);

        return () => clearTimeout(timer);
    }, [query]);

    return { results, loading };
};
