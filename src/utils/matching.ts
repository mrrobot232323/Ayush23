
export function matchProfiles(user: any, others: any[]) {
    return others
        .map((p) => {
            let score = 0;

            // Ensure objects exist to prevent crashes
            const uTrip = user.recent_trip || user.recentTrip || {};
            const pTrip = p.recent_trip || {};

            // 1. Destination match (High Priority: +50)
            // Support both 'place' and 'destination' properties
            const pPlace = (pTrip.place || pTrip.destination || "").trim().toLowerCase();
            const uPlace = (uTrip.place || uTrip.destination || "").trim().toLowerCase();

            if (pPlace && uPlace && pPlace === uPlace) {
                score += 50;
            }

            // 2. Vibe match (+25)
            if (pTrip.vibe && uTrip.vibe && pTrip.vibe === uTrip.vibe) {
                score += 25;
            }

            // 3. Location / Region match (+15)
            if (p.location && user.location && p.location === user.location) {
                score += 15;
            }

            // 4. Style/Interests Match (+5 per common style)
            const pStyles = Array.isArray(p.styles) ? p.styles : [];
            const uStyles = Array.isArray(user.styles) ? user.styles : [];

            const commonStyles = pStyles.filter((style: string) =>
                uStyles.includes(style)
            );
            score += (commonStyles.length * 5);

            // 5. Age similarity (+10 if within 3 years)
            if (p.age && user.age && Math.abs(p.age - user.age) <= 3) {
                score += 10;
            }

            return { ...p, score };
        })
        // Sort descending (highest score first)
        .sort((a, b) => b.score - a.score);
}