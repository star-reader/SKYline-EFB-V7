import React from "react"

interface Props {
    children: React.ReactNode,
    intro: string
}

export default ({children, intro}: Props) => {
    return (
        <div className="relative mt-[6px] w-[48%] min-w-[280px] mb-[25px] phone:w-[90%]">
            <div className="img-preview-area">
                {children}
            </div>
            <div className="relative fs-[20px] text-white text-center mt-[6px] mb-[6px]">{intro}</div>
        </div>
    )
    
}