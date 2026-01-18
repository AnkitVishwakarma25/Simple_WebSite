
import User from "../models/User.js"

import { generateUsernameSuggestions } from "../utils/usernameGenerator.js"

export const usernameSuggestions = async (req, res) => {

    let { base, email } = req.query;

    // Fallback: extract base from email
    if (!base && email) {
        base = email.split("@")[0];
    }

    if (!base) {
        return res.status(400).json({
            message: "Base username required",
        });
    }

    base = base.toLowerCase().replace(/[^a-z0-9]/g, "");

    const generated = generateUsernameSuggestions(base, 20);

    // Check availability
    const existingUsers = await User.find(
        { username: { $in: generated } },
        { username: 1 }
    );

    const taken = new Set(existingUsers.map((u) => u.username));

    const available = generated.filter(
        (u) => !taken.has(u)
    );

    res.json({
        base,
        suggestions: available.slice(0, 6),
    });


}