import { useState } from "react";
import { Search } from "lucide-react";
import AuthUI from "../components/Auth";

function LandingPage()
{
    const [isSignUpActive,setIsSignUpActive]=useState(false);
    return(
        <div className="min-h-screen bg-[#dce9ff]">
            {/* Nav Panel */}
            <header className="flex justify-around bg-[#2080fe] text-white text-shadow-2xs p-3">
                <div>
                    Logo
                </div>
                <div className="relative ">
                    <input placeholder="Search..." className="h-[100%] w-80 bg-white rounded-lg text-black p-2 "/>
                    <button className="bg-blue-900 h-[100%] w-10 rounded-br-lg rounded-tr-lg absolute right-0">
                        <Search className=" font-extrabold absolute top-2   right-2">
                        </Search>
                    </button>
                </div>
                <div className="grid grid-cols-2  text-xl font-semibold ">
                    <button onClick={()=>setIsSignUpActive(true)}>
                        SignUp
                    </button>
                    <button onClick={()=>setIsSignUpActive(true)}>
                        Login
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div>
                <div>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Iste non veniam sequi quibusdam? Vitae fugiat dolore, atque animi nesciunt consectetur quos quis dignissimos provident. Accusantium nihil voluptatibus et aut quaerat!
                </div>
            </div>

            {/* Overlay */}
            <div className="flex justify-center items-center">
                {isSignUpActive && (
                  <AuthUI onClose={()=>setIsSignUpActive(false)}/>
                )}
            </div>

            {/* Foot Note */}
            <footer>

            </footer>
        </div>
    )
}
export default LandingPage;