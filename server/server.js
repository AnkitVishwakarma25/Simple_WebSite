
import config from "./src/config/configenv.js";

import app from "./src/app.js"
import connectDB from "./src/config/db.js";

const PORT = config.PORT;

connectDB();


app.listen(PORT, () => {
    console.log("Server running on port 5000");
});