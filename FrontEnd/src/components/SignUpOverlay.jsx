import Input from "./Input";
import { useEffect, useRef, useState } from "react";

function SignUpOverlay() {
        const imageObj = [
        {
            key:0,
            url: "",
            text: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Velit quas labore sit magni, ipsa quidem veniam eveniet! Dolorem aperiam aliquid, et quisquam architecto sequi ab incidunt, ut velit, dolor necessitatibus.",
        },
        {
            key:1,
            url: "",
            text: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Velit quas labore sit magni, ipsa quideut velit, dolor necessitatibus.",
        },
        {
            key:2,
            url: "",
            text: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Velit quas labore sit magni, ipsa quideut velit, dolor necessitatibus dffughdfjkgjk jhgjkdfhgjk duidjkg hdfjgh dfuklgdjkg h.",
        },
    ];

    const ScrollRef = useRef(null);
    const [image,setImage]=useState(imageObj[0]);

    useEffect(() => {
        const scrollInterval = setInterval(() => {
            setImage((prev)=>imageObj[(prev.key+1)%imageObj.length]);
        }, 2000); 

        return () => clearInterval(scrollInterval);
    }, []);

    return (
        <div className="grid grid-cols-2 p-5 bg-white w-[50%] gap-4">
            <div className="flex flex-col items-center">
                <h1>Get Started for Free</h1>
                <div className="w-full  flex" ref={ScrollRef}>
                    <div className="flex min-w-full h-full flex-col transition-all duration-200 ease-in-out">
                        <img src={image.url}  />
                        <p>
                            {image.text}
                        </p>
                    </div>
                </div>
            </div>
            <div>
                <Input Label="Email" Type="email" />
                <Input Label="Password" Type="password" togglePassword={true} />
                <Input Label="Password" Type="password" togglePassword={true} />
            </div>
        </div>
    )
}

export default SignUpOverlay;
