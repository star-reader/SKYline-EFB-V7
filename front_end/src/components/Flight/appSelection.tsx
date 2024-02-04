import { useEffect , useState } from 'react'
import pubsub from 'pubsub-js'
import getRandom from '../../utils/getRandom'

interface Props{
    procedure: APPS[],
    runway: string
}

export default ({procedure}: Props) => {
    const [isShow, setIsShow] = useState(false)

    useEffect(() => {
        pubsub.subscribe('start-app-selection',() => {
            setIsShow(true)
        })
    }, [])

    const handleSelect = (d: APPS) => {
        pubsub.publish('select-procedure-app', d)
        setIsShow(false)
    }

    const formatType = (ident: string) => {
        let fir_i = ident.slice(0,1)
        switch (fir_i) {
            case 'I':
                return 'ILS'
            case 'Q':
                return 'NDB'
            case 'N':
                return 'NDB'
            case 'L':
                return 'LOC'
            case 'P':
                return 'GPS'
            case 'B':
                return 'LOC'
            case 'T':
                return 'TACAN'
            case 'J':
                return 'GLS'
            case 'S':
                return 'VOR'
            case 'D':
                return 'VOR'
            case 'V':
                return 'VOR'
            case 'R':
                return 'RNP'
            default:
                return 'PROC'
        }
    }

    const handleClose = () => {
        setIsShow(false)
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
                select-none">进近程序选择</div>
                <div className="relative text-[14px] text-center text-white mb-3 mt-1 flex justify-around select-none">
                    <div className="relative w-[18%]"></div>
                    <div className="relative w-[18%]">落地机场</div>
                    <div className="relative w-[18%]">进近程序</div>
                    <div className="relative w-[18%]">过渡点</div>
                    <div className="relative w-[18%]">落地跑道</div>
                </div>
                <div className="relative w-full h-[270px] mt-2 overflow-x-hidden overflow-y-auto">
                    {
                        procedure.map(d => {
                            const type = formatType(d.ident)
                            return (
                                <div key={getRandom(16)} onClick={() => handleSelect(d)} className="relative h-[35px] pt-1 pb-1 text-[14px] text-center text-white\
                                flex justify-around items-center duration-300 select-none cursor-pointer hover:bg-[rgb(60,96,131)]">
                                    <div aria-description={type} className="relative w-[10%] h-[18px] leading-[18px] rounded pl-1 pr-1 app-selection-pill">{type}</div>
                                    <div className="relative w-[10%]">{d.airport}</div>
                                    <div className="relative w-[38%] text-[13px]">{d.procedure}</div>
                                    <div className="relative w-[10%]">{d.transition}</div>
                                    <div className="relative w-[10%]">{d.runway}</div>
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