import React from "react"

interface Props {
    children: React.ReactNode,
    index: number,
    isActive: boolean,
    handleClick: Function,
    isDevHidden?: boolean
}

export default ({children, index, isActive, handleClick, isDevHidden}: Props) => {
    return (
        <div onClick={() => handleClick(index)} 
        className="relative rounded-md p-[6px] mt-[10px] left-[-5px] w-[42px] 
        duration-300 hover:bg-[#27324a] text-center cursor-pointer"
        style={{'display': isDevHidden ? 'none' : 'block'}}
        aria-details={isActive ? 'active' : 'inactive'}
        >{children}</div>
    )
}