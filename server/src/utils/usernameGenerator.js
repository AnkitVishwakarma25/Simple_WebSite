

const adjectives = [
    "real",
    "its",
    "official",
    "the",
    "hey",
    "iam",
    "dev",
    "vibes",
    "codes",
    "motivation",
    "million",
    "new"
];


export const generateUsernameSuggestions = (
    base, count = 10
) => {

    const suggestions = new Set();

    while (suggestions.size < count) {
        const adj =
            adjectives[Math.floor(Math.random() * adjectives.length)];
        const num = Math.floor(Math.random() * 100);

        const patterns = [
            `${base}`,
            `${base}${num}`,
            `${adj}${base}`,
            `${base}_${adj}`,
            `${base}.${adj}`,
            `${base}_${num}`,
        ];

        patterns.forEach((p) => suggestions.add(p));
    }

    return Array.from(suggestions).slice(0, count);


}

