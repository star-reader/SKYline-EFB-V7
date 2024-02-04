interface Props {
    d: TrafficData
}

export default ({d}: Props) => {
    //TODO 显示航班总体概览：人数、油量、机型等
    return (
        <div className="relative w-full flex justify-around items-center flex-wrap text-white">
            <div className="relative mt-2 w-[110px] flex justify-between items-center">
                <div className="relative font-bold select-none w-[160px]">呼号</div>
                <div className="relative">{d.callsign}</div>
            </div>  
            <div className="relative mt-2 w-[48%] flex justify-between items-center">
                <div className="relative w-[48%] font-bold text-left select-none">飞行员</div>
                <div className="relative w-[48%] text-center">{d.cid}</div>
            </div>  
            <div className="relative mt-2 w-[48%] flex justify-between items-center">
                <div className="relative w-[48%] font-bold text-left select-none">航向</div>
                <div className="relative w-[48%] text-center">{d.heading.toFixed()}°</div>
            </div>  
            <div className="relative mt-2 w-[48%] flex justify-between items-center">
                <div className="relative w-[48%] font-bold text-left select-none">应答机</div>
                <div className="relative w-[48%] text-center">{d.squawk}</div>
            </div>
            <div className="relative mt-2 w-[48%] flex justify-between items-center">
                <div className="relative w-[48%] font-bold text-left select-none">地速</div>
                <div className="relative w-[48%] text-center">{d.speed} knots</div>
            </div>  
            <div className="relative mt-2 w-[48%] flex justify-between items-center">
                <div className="relative w-[48%] font-bold text-left select-none">飞行高度</div>
                <div className="relative w-[48%] text-center">{d.altitude}ft</div>
            </div>
            <div className="relative mt-2 w-[48%] flex justify-between items-center">
                <div className="relative w-[48%] font-bold text-left select-none">起飞机场</div>
                <div className="relative w-[48%] text-center">{d.departure}</div>
            </div>  
            <div className="relative mt-2 w-[48%] flex justify-between items-center">
                <div className="relative w-[48%] font-bold text-left select-none">落地机场</div>
                <div className="relative w-[48%] text-center">{d.arrival}</div>
            </div>
        </div>
    )
}