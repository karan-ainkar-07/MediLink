import {app} from './app.js'
import cors from "cors"
// Re-load dotenv to make sure it is available for PORT if needed

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}))
// Define the port, defaulting to 8080 if not specified in .env
const port = 5000;

// Start the server
app.listen(port, () => {
    console.log(`Server is running successfully on port: ${port}`);
});