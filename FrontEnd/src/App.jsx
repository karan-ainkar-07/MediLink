import { createBrowserRouter,RouterProvider } from "react-router-dom"
function App() {
    const router=createBrowserRouter(
        [
            {
                path:"/",
                element:<LandingPage/>
            }
        ]
    )
}

export default App
