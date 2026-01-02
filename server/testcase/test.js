import User from "../src/models/User.js";

export const checking = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email }).select("-password");

        if (!user) {
            return res.status(404).json({ message: "Email not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}