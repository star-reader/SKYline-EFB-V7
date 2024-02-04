interface Props {
    d: NavLink
}

export default ({d}: Props) => {
    //TODO 显示航班总体概览：人数、油量、机型等
    return (
        <div className="relative w-full flex justify-around items-center flex-wrap text-white">
            <div className="relative mt-2 w-[48%] flex justify-between items-center">
                <div className="relative w-[48%] font-bold text-left select-none">航向</div>
                <div className="relative w-[48%] text-center">{d.heading.toFixed()}°</div>
            </div>  
            <div className="relative mt-2 w-[48%] flex justify-between items-center">
                <div className="relative w-[48%] font-bold text-left select-none">应答机</div>
                <div className="relative w-[48%] text-center">{d.transponder}</div>
            </div>
            <div className="relative mt-2 w-[48%] flex justify-between items-center">
                <div className="relative w-[48%] font-bold text-left select-none">地速</div>
                <div className="relative w-[48%] text-center">{d.groundspeed} knots</div>
            </div>  
            <div className="relative mt-2 w-[48%] flex justify-between items-center">
                <div className="relative w-[48%] font-bold text-left select-none">飞行高度</div>
                <div className="relative w-[48%] text-center">{d.altitude}ft</div>
            </div>
            <div className="relative mt-2 w-[48%] flex justify-between items-center">
                <div className="relative w-[48%] font-bold text-left select-none">倾角</div>
                <div className="relative w-[48%] text-center">{d.bank.toFixed(2)}°</div>
            </div>  
            <div className="relative mt-2 w-[48%] flex justify-between items-center">
                <div className="relative w-[48%] font-bold text-left select-none">仰角</div>
                <div className="relative w-[48%] text-center">{d.pitch.toFixed(2)}°</div>
            </div>
            {/* <div className="relative mt-2 w-[48%] flex justify-between items-center">
                <div className="relative w-[48%] font-bold text-left select-none">纬度</div>
                <div className="relative w-[48%] text-center">{d.groundspeed}</div>
            </div>  
            <div className="relative mt-2 w-[48%] flex justify-between items-center">
                <div className="relative w-[48%] font-bold text-left select-none">经度</div>
                <div className="relative w-[48%] text-center">{d.altitude}</div>
            </div> */}
            {/* <div className="relative mt-2 w-[48%] flex justify-between items-center">
                <div className="relative w-[48%] font-bold text-left select-none">起飞机场</div>
                <div className="relative w-[48%] text-center">{d.departure}</div>
            </div>  
            <div className="relative mt-2 w-[48%] flex justify-between items-center">
                <div className="relative w-[48%] font-bold text-left select-none">落地机场</div>
                <div className="relative w-[48%] text-center">{d.arrival}</div>
            </div> */}
        </div>
    )
}