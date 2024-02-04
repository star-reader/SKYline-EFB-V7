import getUTCString from "../../utils/getUTCString"

interface Props {
    ofp: OFP
}

export default ({ofp}: Props) => {
    //TODO 显示航班总体概览：人数、油量、机型等
    return (
        <div className="relative w-full flex justify-around items-center flex-wrap text-white">
            <div className="relative mt-2 w-[110px] flex justify-between items-center">
                <div className="relative font-bold select-none w-[160px]">航班号</div>
                <div className="relative">{ofp.general.flightNumber}</div>
            </div>  
            <div className="relative mt-2 w-[48%] flex justify-between items-center">
                <div className="relative w-[48%] font-bold text-left select-none">签派时间</div>
                <div className="relative w-[50%] text-center">{getUTCString().split(' ')[1]} UTC</div>
            </div>  
            <div className="relative mt-2 w-[48%] flex justify-between items-center">
                <div className="relative w-[48%] font-bold text-left select-none">起飞机场</div>
                <div className="relative w-[48%] text-center">{ofp.general.departure}</div>
            </div>  
            <div className="relative mt-2 w-[48%] flex justify-between items-center">
                <div className="relative w-[48%] font-bold text-left select-none">落地机场</div>
                <div className="relative w-[48%] text-center">{ofp.general.arrival}</div>
            </div>
            <div className="relative mt-2 w-[48%] flex justify-between items-center">
                <div className="relative w-[48%] font-bold text-left select-none">乘客数量</div>
                <div className="relative w-[48%] text-center">{ofp.weight.passenger_number}</div>
            </div>  
            <div className="relative mt-2 w-[48%] flex justify-between items-center">
                <div className="relative w-[48%] font-bold text-left select-none">货物重量</div>
                <div className="relative w-[48%] text-center">{ofp.weight.cargo}kg</div>
            </div>
            <div className="relative mt-2 w-[48%] flex justify-between items-center">
                <div className="relative w-[48%] font-bold text-left select-none">航路距离</div>
                <div className="relative w-[48%] text-center">{ofp.general.ground_dist} nm</div>
            </div>  
            <div className="relative mt-2 w-[48%] flex justify-between items-center">
                <div className="relative w-[48%] font-bold text-left select-none">经济指数</div>
                <div className="relative w-[48%] text-center">{ofp.general.ci}</div>
            </div>
            <div className="relative mt-2 w-[48%] flex justify-between items-center">
                <div className="relative w-[48%] font-bold text-left select-none">携带燃油</div>
                <div className="relative w-[48%] text-center">{ofp.plannedFuel.block_fuel}kg</div>
            </div>  
            <div className="relative mt-2 w-[48%] flex justify-between items-center">
                <div className="relative w-[48%] font-bold text-left select-none">备用燃油</div>
                <div className="relative w-[48%] text-center">{ofp.plannedFuel.finnal_rev}</div>
            </div>
            <div className="relative mt-2 w-[48%] flex justify-between items-center">
                <div className="relative w-[48%] font-bold text-left select-none">最大起飞重量</div>
                <div className="relative w-[48%] text-center">{ofp.weight.take_off_weight}kg</div>
            </div>  
            <div className="relative mt-2 w-[48%] flex justify-between items-center">
                <div className="relative w-[48%] font-bold text-left select-none">最大着陆重量</div>
                <div className="relative w-[48%] text-center">{ofp.weight.landing_max_weight}kg</div>
            </div>
            <div className="relative mt-2 w-[48%] flex justify-between items-center">
                <div className="relative w-[48%] font-bold text-left select-none">预计ZFW</div>
                <div className="relative w-[48%] text-center">{ofp.weight.ZFW}</div>
            </div>
            <div className="relative mt-2 w-[48%] flex justify-between items-center">
                <div className="relative w-[48%] font-bold text-left select-none">配载重量</div>
                <div className="relative w-[48%] text-center">{ofp.weight.payload}kg</div>
            </div>
        </div>
    )
}