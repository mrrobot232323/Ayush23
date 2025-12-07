const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
    "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const FALLBACK_KEY = "WX8_msnzxP1_ixo3iIplxVuau4kjXNKLUjezbvs-tm0";
const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY || FALLBACK_KEY;

// helper: Wikipedia summary
async function fetchWikiSummary(name) {
    const q = name.replace(/ /g, "_");
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q)}`;
    try {
        const res = await fetch(url, { headers: { "User-Agent": "meetMiles-script/1.0" } });
        if (!res.ok) return null;
        const json = await res.json();
        return {
            title: json.title || name,
            description: json.extract || json.description || "",
            wiki_thumbnail: json.thumbnail?.source || null,
            wiki_url: json.content_urls?.desktop?.page || null
        };
    } catch (err) {
        console.error("wiki error", name, err.message);
        return null;
    }
}

// helper: Unsplash search
async function searchUnsplash(query, perPage = 6) {
    if (!UNSPLASH_KEY) {
        console.log("No UNSPLASH_KEY found");
        return null;
    }
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape&client_id=${UNSPLASH_KEY}`;
    try {
        const res = await fetch(url);
        if (!res.ok) {
            console.error("Unsplash error", res.status, await res.text());
            return null;
        }
        const j = await res.json();
        return (j.results || []).map(r => ({
            id: r.id,
            url: r.urls?.regular || r.urls?.full || null,
            thumb: r.urls?.thumb || null,
            author: r.user?.name || null,
            author_link: r.user?.links?.html || null
        }));
    } catch (err) {
        console.error("unsplash fetch error", err.message);
        return null;
    }
}

async function build() {
    console.log("STARTING BUILD...");
    console.log("Key length:", UNSPLASH_KEY ? UNSPLASH_KEY.length : 0);

    const out = [];
    for (const state of STATES) {
        console.log("Processing:", state);

        const wiki = await fetchWikiSummary(state);
        const unsplash = await searchUnsplash(state + " travel landscape", 8);

        const hero = (unsplash && unsplash[0] && unsplash[0].url) || wiki?.wiki_thumbnail || null;
        const gallery = (unsplash || []).slice(0, 6).map(i => i.url).filter(Boolean);

        const item = {
            state,
            description: wiki?.description || "",
            image: hero,
            gallery,
            wiki_url: wiki?.wiki_url || null,
            wikipedia: wiki,
            created_at: new Date().toISOString()
        };

        out.push(item);

        // throttle to respect Unsplash rate limits
        await new Promise(r => setTimeout(r, 1000));
    }

    // ensure data directory exists
    const dataDir = path.join(__dirname, "../assets/data");
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

    const outFile = path.join(dataDir, "indiaStates.json");
    fs.writeFileSync(outFile, JSON.stringify(out, null, 2), "utf8");
    console.log("WROTE", outFile, "(", out.length, "items )");
}

build().catch(err => { console.error("FATAL:", err); process.exit(1); });
