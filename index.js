const express = require("express");
const cors = require("cors");
const router = require("./routes/routes.js")

const app = express();
app.use(cors());
app.use("/", router);

app.listen(process.env.PORT || 5000, () => {
    console.log("Server is running.")
})