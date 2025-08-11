import { createBrowserRouter,RouterProvider } from "react-router-dom"
import LandingPage from "./pages/LandingPage";
function App() {
    const route=createBrowserRouter([
            {
                path:"/",
                element:<LandingPage/>
            },
        ])
    return (
        <RouterProvider router={route}/>
    )
}

export default App
