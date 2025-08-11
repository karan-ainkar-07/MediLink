import { useState } from "react";
import SignUpOverlay from "../components/SignUpOverlay";
function LandingPage()
{
    const [isSignUpActive,setIsSignUpActive]=useState(true);
    return(
        <div className="min-h-screen bg-black">
            <header>
                <div>

                </div>
                <div>
                    <button>
                        SignUp
                    </button>
                    |
                    <button>
                        Login
                    </button>
                </div>
            </header>
            <div>
                {isSignUpActive && (
                    <SignUpOverlay/>
                )}
            </div>
            <footer>

            </footer>
        </div>
    )
}
export default LandingPage;