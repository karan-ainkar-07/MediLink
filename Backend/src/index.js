import {app} from './app.js'
import dotenv from "dotenv";

await dotenv.config(); 

const port = process.env.PORT;

app.listen(port, () => {
    console.log(`Server is running successfully on port: ${port}`);
});