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

export const testsavepassword = async (req, res) => {
    try {
        const user = await User.create({
            username: "testuser1",
            email: "test@test1.com",
            password: "password123",
        });

        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message });
    }
};


export const getallusers = async (req, res) => {

    try {
        const users = await User.find().select("+password");

        res.status(200).json({
            count: users.length,
            users,
        })
    } catch (error) {

        res.status(500).json({
            message: "failed to fetch users",
            error: error.message,
        })

    }
}


export const validatepassword = async (req, res) => {

    try {


        const { email, password } = req.body;

        const user = await User.findOne({ email }).select("+password");


        if (!user) {

            return res.status(401).json({
                message: "Invalide email or password"
            })


        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {

            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        // 4️⃣ Success
        res.status(200).json({
            message: "User and password matched",
        });


    } catch (error) {

        res.status(500).json({
            message: "Server error",
            error: error.message,
        });

    }
}