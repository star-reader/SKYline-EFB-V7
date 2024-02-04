import { useState , useEffect } from "react"
import { Skeleton } from 'antd'
import pubsub from 'pubsub-js'
import useQueryType from "../../hooks/map/useQueryType"
import useDraggable from "../../hooks/useDraggable"

export default () => {
    const WINDOW = 'enroute-query'
    const [isShow, setIsShow] = useState(false)
    const [loading, setLoading] = useState(false)
    const [result, setResult ] = useState<any[]>([])
    const [type, setType] = useState('')
    const [title, setTitle] = useState('')
    const { pos, ref } = useDraggable({ x: 400, y: 80 })

    const handleClose = () => {
        setIsShow(false)
        pubsub.publish('enroute-query-end',1)
    }

    const handleDetail = () => {
        if (type !== '机场') return
        pubsub.publish('request-detail-airport', title)
    }

    useEffect(() => {
        pubsub.subscribe('start-enroute-query',(_, _data) => {
            setIsShow(true)
            setLoading(true)
            pubsub.publish('open-window',WINDOW)
        })

        pubsub.subscribe('enroute-query-success',(_,data: QueryPubsubEvent) => {
            setResult(data.data)
            setType(useQueryType(data.type))
            setTitle(data.ident)
            setLoading(false)
        })

        pubsub.subscribe('open-window',(_,data: string) => {
            if (data === WINDOW) return
            const width = document.body.scrollWidth
            if (width <= 700){
                setIsShow(false)
            }
        })
    },[])

    return (
        <>
            {isShow && <div className="absolute l-calc-100-minus-400 
            w-[260px] h-[300px] z-[21] top-28 rounded bg-[#2c3b61]  select-none
            phone:w-full phone:left-0 t-calc-full-minus-350px ani-show-buttom-win"
            ref={ref}
            style={{
              left: document.body.scrollWidth > 700 ? `${pos.x}px` : '',
              top: document.body.scrollWidth > 700 ? `${pos.y}px` : '',
            }}>
                <div className="relative h-[40px] bg-[#2c3b61] rounded-t 
                    leading-[40px] text-center cursor-move text-white text-[20px] phone:cursor-default">{ title }</div>
                <div onClick={handleClose} className="absolute top-[4px] right-[16px] w-[60px] mt-[5px]
                                text-[#66a5f7] text-[18px] select-none rounded text-center leading-[20px] 
                                cursor-pointer duration-200 hover:text-[#6084d9]">&lt;&nbsp;返回</div>
                {/* <div onClick={handleClose} className="absolute top-[4px] right-[14px] w-[49px] mt-[8px] bg-[#ee835c]
                                text-white text-[13px] select-none rounded text-center leading-[20px] 
                                cursor-pointer duration-200 hover:bg-[#cc7158]">&lt;返回</div> */}
                <div className="flex justify-around h-[35px]">
                    <div className="relative w-[50%] rounded-[4px] bg-[#364670]
                     hover:bg-[#2b385a] duration-300 text-[15px] text-orange-500 leading-[35px] text-center"
                     style={{'cursor': type === '滑行道' ? 'not-allowed' : 'pointer', 'borderRight': '1px solid lightgray'}}>
                        添加到飞行计划
                    </div>
                    <div onClick={handleDetail} className="relative w-[50%] rounded-[4px] cursor-pointer bg-[#364670]
                     hover:bg-[#2b385a] duration-300 text-[15px] text-lime-500 leading-[35px] text-center"
                     style={{'cursor': type === '机场' ? 'pointer' : 'not-allowed'}}>
                        详情页面
                    </div>
                </div>
                {
                    loading ? 
                    <Skeleton active paragraph={{'rows': 6}} /> :
                    <>
                        <div className="relative h-[25px] pt-1 pb-1 mb-1 text-[13px] cursor-default leading-[25px] text-gray-200 pl-[15px]">
                            {type}详情
                        </div>
                        <div className="relative h-[200px] w-full overflow-x-hidden overflow-y-auto">
                            {
                                result.map((d, index)=> {
                                    return (
                                        <div key={index} className="flex pt-[5px] pb-[5px] justify-around
                                        items-center text-[14px] duration-200 hover:bg-[#4c5d8a]">
                                            <div className="relative w-[40%] text-center text-gray-200">{d.key}</div>
                                            <div className="relative w-[60%] text-center text-[#f5f5f5]">{d.value}</div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </>
                }
            </div>
            }
        </>
    )
}