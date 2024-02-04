import { useEffect , useState } from 'react'
import pubsub from 'pubsub-js'
import getRandom from '../../utils/getRandom'

interface Props{
    procedure: SIDSTARS[],
    selectionType: 'sid' | 'star',
    route: OriginalRouteItem[],
    runway: Runway | undefined
}

export default ({procedure, selectionType, route, runway}: Props) => {
    const [isShow, setIsShow] = useState(false)
    const [recommended, setRecommended] = useState<SIDSTARS[]>([])
    const [otherRunway, setOtherRunway] = useState<SIDSTARS[]>([])
    const [otherEndPoint, setOtherEndPoint] = useState<SIDSTARS[]>([])
    const [others, setOthers] = useState<SIDSTARS[]>([])

    useEffect(() => {
        pubsub.subscribe('start-procedure-selection',(_, type: string) => {
            if (type === selectionType){
                setIsShow(true)
                setRecommended([])
                setOtherEndPoint([])
                setOtherRunway([])
                setOtherEndPoint([])
                setOthers([])
                const _rec: SIDSTARS[] = []
                const _oRwy: SIDSTARS[] = []
                const _oEp: SIDSTARS[] = []
                const _oth: SIDSTARS[] = []
                for (let i = 0; i < procedure.length; i++){
                    const d = procedure[i]
                    if (getStartOrEndPoint().includes(d.endPoint) && (d.runway === 'ALL' || d.runway === runway?.ident)){
                        _rec.push(d)
                    }else if (getStartOrEndPoint().includes(d.endPoint)){
                        _oRwy.push(d)
                    }else if ((d.runway === 'ALL' && getStartOrEndPoint().includes(d.endPoint)) || d.runway === runway?.ident){
                        _oEp.push(d)
                    }else{
                        _oth.push(d)
                    }
                }
                setRecommended(_rec)
                setOtherRunway(_oRwy)
                setOtherEndPoint(_oEp)
                setOthers(_oth)
            }else{
                setIsShow(false)
            }
        })
    })

    const handleSelect = (d: SIDSTARS) => {
        pubsub.publish('select-procedure-'+ selectionType, d)
        setIsShow(false)
    }

    const handleClose = () => {
        setIsShow(false)
    }

    const getStartOrEndPoint = () => {
        const r: string[] = []
        route.map(i => {
            r.push(i.ident)
        })
        if (selectionType === 'sid'){
            return r.slice(1, 4)
        }else{
            return r.slice(r.length-4,r.length-1)
        }
    }

    return (
        isShow &&
        <>
        <div className="fixed w-full h-full left-0 top-0 duration-500 z-[40] bg-[rgba(0,0,0,0.25)]">
            <div className="absolute w-[340px] h-[380px] rounded-sm bg-[rgb(44,60,87)]
            small:w-[88%] small:left-[6%]"
            style={{left: 'calc(50% - 170px)', top:'calc(50% - 200px)', 
            animation: 'loadingPopUp 0.3s'}}>
                <div className="relative text-[20px] text-center text-white leading-5 mt-3 mb-3
                select-none">{selectionType === 'sid' ? '离场' : '进场'}程序选择</div>
                <div className="relative text-[14px] text-center text-white mb-3 mt-1 flex justify-around select-none">
                    <div className="relative w-[23%]">{selectionType === 'sid' ? '起飞' : '着陆'}机场</div>
                    <div className="relative w-[23%]">程序名称</div>
                    <div className="relative w-[23%]">适用跑道</div>
                    <div className="relative w-[23%]">过渡点</div>
                </div>
                <div className="relative w-full h-[270px] mt-2 overflow-x-hidden overflow-y-auto">
                    <div className="relative w-full text-white text-15px text-center leading-5
                    pt-1 pb-1 bg-[rgb(53,84,114)] select-none">
                        <span className='mr-2 font-bold text-[15px]'>推荐{selectionType === 'sid' ? '离场' : '进场'}场程序</span>
                        <span className='text-[14px] text-white leading-4'>所选跑道、{selectionType === 'sid' ? '离' : '进'}场点均相同</span>
                    </div>
                    {
                        recommended.map(d => {
                            return (
                                <div key={getRandom(16)} onClick={() => handleSelect(d)} className="relative h-[35px] pt-1 pb-1 text-[14px] text-center text-white\
                                flex justify-around items-center duration-300 select-none cursor-pointer hover:bg-[rgb(60,96,131)]">
                                    <div className="relative w-[23%]">{d.airport}</div>
                                    <div className="relative w-[23%]">{d.procedure}</div>
                                    <div className="relative w-[23%] text-green-400">{d.runway}</div>
                                    <div className="relative w-[23%] text-green-400">{d.endPoint}</div>
                                </div>
                            )
                        })
                    }
                    <div className="relative w-full text-white mr-2 text-15px text-center leading-5
                    pt-1 pb-1 bg-[rgb(53,84,114)] select-none">
                        <span className='mr-2 font-bold text-[15px]'>其他程序</span>
                        <span className='text-[14px] text-white leading-4'>{selectionType === 'sid' ? '离' : '进'}场点相同但跑道不同</span>
                    </div>
                    {
                        otherRunway.map(d => {
                            return (
                                <div key={getRandom(16)} onClick={() => handleSelect(d)} className="relative h-[35px] pt-1 pb-1 text-[14px] text-center text-white\
                                flex justify-around items-center duration-300 select-none cursor-pointer hover:bg-[rgb(60,96,131)]">
                                    <div className="relative w-[23%]">{d.airport}</div>
                                    <div className="relative w-[23%]">{d.procedure}</div>
                                    <div className="relative w-[23%] text-orange-400">{d.runway}</div>
                                    <div className="relative w-[23%] text-green-400">{d.endPoint}</div>
                                </div>
                            )
                        })
                    }
                    <div className="relative w-full text-white mr-2 text-15px text-center leading-5
                    pt-1 pb-1 bg-[rgb(53,84,114)] select-none">
                        <span className='mr-2 font-bold text-[15px]'>其他程序</span>
                        <span className='text-[14px] text-white leading-4'>所选相同跑道、{selectionType === 'sid' ? '离' : '进'}场点不同</span>
                    </div>
                    {
                        otherEndPoint.map(d => {
                            return (
                                <div key={getRandom(16)} onClick={() => handleSelect(d)} className="relative h-[35px] pt-1 pb-1 text-[14px] text-center text-white\
                                flex justify-around items-center duration-300 select-none cursor-pointer hover:bg-[rgb(60,96,131)]">
                                    <div className="relative w-[23%]">{d.airport}</div>
                                    <div className="relative w-[23%]">{d.procedure}</div>
                                    <div className="relative w-[23%] text-green-400">{d.runway}</div>
                                    <div className="relative w-[23%] text-orange-400">{d.endPoint}</div>
                                </div>
                            )
                        })
                    }
                    <div className="relative w-full text-white mr-2 text-15px text-center leading-5
                    pt-1 pb-1 bg-[rgb(53,84,114)] select-none">
                        <span className='mr-2 font-bold text-[15px]'>其他程序</span>
                        <span className='text-[14px] text-white leading-4'>所选跑道与{selectionType === 'sid' ? '离' : '进'}场点均不同</span>
                    </div>
                    {
                        others.map(d => {
                            return (
                                <div key={getRandom(16)} onClick={() => handleSelect(d)} className="relative h-[35px] pt-1 pb-1 text-[14px] text-center text-white\
                                flex justify-around items-center duration-300 select-none cursor-pointer hover:bg-[rgb(60,96,131)]">
                                    <div className="relative w-[23%]">{d.airport}</div>
                                    <div className="relative w-[23%]">{d.procedure}</div>
                                    <div className="relative w-[23%] text-orange-400">{d.runway}</div>
                                    <div className="relative w-[23%] text-orange-400">{d.endPoint}</div>
                                </div>
                            )
                        })
                    }
                </div>
                <div className="relative w-full rounded h-[34px] leading-[34px] bg-orange-600 cursor-pointer
                select-none text-center text-white text-[15px] hover:bg-orange-700"
                onClick={handleClose}>取消选择</div>
            </div>
        </div>
        </>
    )
}