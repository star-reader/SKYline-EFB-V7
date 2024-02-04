import { useEffect , useState } from 'react'
import pubsub from 'pubsub-js'
import { ArrowRightOutlined, ArrowUpOutlined, ArrowDownOutlined, QuestionCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import getRandom from '../../utils/getRandom'
import useGetWindComponents from '../../hooks/weather/useGetWindComponents'

interface Props{
    runways: Runway[],
    metarInfo: string,
    selectionType: 'dep' | 'arr'
}

export default ({runways, selectionType, metarInfo}: Props) => {
    const [isShow, setIsShow] = useState(false)

    useEffect(() => {
        pubsub.subscribe('start-runway-selection',(_, type: string) => {
            if (type === selectionType){
                setIsShow(true)
            }else{
                setIsShow(false)
            }
        })
    })

    const handleSelect = (d: Runway) => {
        pubsub.publish('select-runway-'+ selectionType, d)
        setIsShow(false)
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
                select-none">跑道选择</div>
                <div className="relative text-[14px] text-center text-white mb-3 mt-1 flex justify-around select-none">
                    <div className="relative w-[13%]">识别码</div>
                    <div className="relative w-[13%]">顺逆风</div>
                    <div className="relative w-[13%]">侧风</div>
                    <div className="relative w-[13%]">磁航向</div>
                    <div className="relative w-[13%]">长度</div>
                    <div className="relative w-[13%]">宽度</div>
                    <div className="relative w-[13%]">海拔</div>
                </div>
                <div className="relative w-full h-[270px] mt-2 overflow-x-hidden overflow-y-auto">
                    {
                        runways.map(d => {
                            const wind = useGetWindComponents(d, metarInfo)
                            return (
                                <div key={getRandom(16)} onClick={() => handleSelect(d)} className="relative h-[45px] pt-1 pb-1 text-[14px] text-center text-white\
                                flex justify-around items-center duration-300 select-none cursor-pointer hover:bg-[rgb(60,96,131)]">
                                    <div className="relative w-[13%]">{d.ident}</div>
                                    <div className="relative w-[13%] h-[30px] text-[12px] p-1 rounded"
                                    style={{backgroundColor: wind.headWind === 'var' ? 'rgb(248,205,28)' : wind.headWind < 6 ? 'rgb(74,221,127)' :
                                    wind.headWind < 12 ? 'rgb(249,148,63)' : 'rgb(246,116,115)' }}>
                                        {
                                            wind.headWind === 'var' ? 
                                            <><QuestionCircleOutlined style={{position: 'relative', 'top': '-5px'}} /> <br /></> :
                                            wind.headWind > 0 ?
                                            <ArrowUpOutlined style={{position: 'relative', 'top': '-5px'}} /> :
                                            <ArrowDownOutlined style={{position: 'relative', 'top': '-5px'}} />
                                        }
                                        <span style={{position: 'relative', 'top': '-9px','fontSize':'11px'}}>
                                            {wind.headWind === 'var' ? '不定' : `${Math.abs(wind.headWind).toFixed()}knots`}
                                        </span>
                                    </div>
                                    <div className="relative w-[13%] h-[30px] text-[12px] p-1 rounded"
                                    style={{backgroundColor: wind.crossWind === 'var' ? 'rgb(248,205,28)' : wind.crossWind < 6 ? 'rgb(74,221,127)' :
                                    wind.crossWind < 12 ? 'rgb(249,148,63)' : 'rgb(246,116,115)' }}>
                                    {
                                            wind.crossWind === 'var' ? 
                                            <><QuestionCircleOutlined style={{position: 'relative', 'top': '-5px'}} /> <br /></> :
                                            wind.crossWind > 0 ?
                                            <ArrowRightOutlined style={{position: 'relative', 'top': '-5px'}} /> :
                                            <ArrowLeftOutlined style={{position: 'relative', 'top': '-5px'}} />
                                        }
                                        <span style={{position: 'relative', 'top': '-9px','fontSize':'11px'}}>
                                            {wind.crossWind === 'var' ? '不定' : `${Math.abs(wind.crossWind).toFixed()}knots`}
                                        </span>
                                    </div>
                                    <div className="relative w-[13%]">{d.heading.toFixed()}°</div>
                                    <div className="relative w-[13%]">{d.length}ft</div>
                                    <div className="relative w-[13%]">{d.width}ft</div>
                                    <div className="relative w-[13%]">{d.elevation}ft</div>
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