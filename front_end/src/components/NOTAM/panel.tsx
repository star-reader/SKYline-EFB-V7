import { useEffect, useState } from "react"
import pubsub from 'pubsub-js'
import { CheckOne, Delete } from "@icon-park/react"
import { Result, Input, Skeleton } from "antd"
import axios from 'axios'
import PhoneDrag from "../common/PhoneDrag"
import apiUrl from "../../config/api/apiUrl"
import createHeader from "../../utils/createHeader"
import getUTCString from "../../utils/getUTCString"
import getRandom from "../../utils/getRandom"
import { getNOTAMList , appendNOTAM, deleteNOTAM } from "../../hooks/notam/useList"
import Divider from "../common/Divider"

const { Search } = Input

export default () => {
    const WINDOW = 'notam-panel'
    const [editMode, setEditMode] = useState(false)
    const [isShow, setIsShow] = useState(false)
    const [isHide, setIsHide] = useState(false)
    const [isMax, setIsMax] = useState(false)
    const [phone, setPhone] = useState(false)
    const [loading, setLoading] = useState(false)
    const [detail, setDetail] = useState(false)
    const [fail, setFail] = useState(false)
    const [list, setList] = useState<NOTAMListStore[]>(getNOTAMList())
    const [data, setData] = useState<NOTAMInfo[]>([])

    useEffect(() => {
        pubsub.subscribe('click-notam', (_,data: number) => {
            if (!data){
                setIsShow(false)
            }else{
                setIsShow(true)
                setIsHide(false)
                pubsub.publish('open-window', WINDOW)
            }
        })
        pubsub.subscribe('notam-panel-drag-up',() => {
            setIsMax(true)
        })
    
        pubsub.subscribe('notam-panel-drag-down',() => {
            setIsMax(false)
        })
        pubsub.subscribe('open-window',(_,data: string) => {
            if (data === WINDOW) return
            const width = document.body.scrollWidth
            if (width <= 700){
                setIsShow(false)
            }
        })
        pubsub.subscribe('open-common-window',(_,data: string) => {
            if (data === WINDOW) return
            setIsHide(true)
        })
        pubsub.subscribe('start-searching',() => {
            setIsHide(true)
        })
    },[])

    const handleClose = () => {
        if (detail){
            setDetail(false)
            setList(getNOTAMList())
        }else{
            setIsShow(false)
            //! 刚才删除的
            pubsub.publish('common-close',2)
        }
        
    }

    const handleSearch = (value: string) => {
        setDetail(true)
        setLoading(true)
        axios.get(`${apiUrl.notam}?icao=${value.toUpperCase()}`,{
            'headers': createHeader()
        }).then(res => {
            setLoading(false)
            if (res.data.code === 200){
                setFail(false)
                setData(res.data.data)
                const info: NOTAMListStore = {
                    'icao': value.toUpperCase(),
                    'date': getUTCString(),
                    'id': getRandom(16),
                }
                appendNOTAM(info)
            }else{
                setFail(true)
            }
        }).catch(() => {
            setLoading(false)
            setFail(true)
        })
    }

    const handleDelete = (d: NOTAMListStore, e:React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault()
        e.stopPropagation()
        const nList = deleteNOTAM(d)
        setList(nList)
    }

    useEffect(() => {
        const setWidth = () => {
            const width = document.body.scrollWidth
            width > 700 ? setPhone(false) : setPhone(true)
        }
        setWidth()
        addEventListener('resize', setWidth)
    },[])

    return (
        <>{
            isShow &&
          <div className={`common-panel z-[22] absolute left-[50px] w-80 top-[50px] 
              bottom-0 rounded-r-md bg-[#2f4565] ani-show-common-panel phone:w-full phone:left-0 duration-300 ${editMode ? 'edit-mode' : 'placeholder-overview'}`}
              style={{
                'top': phone ? isMax ? '50px' : '' : '',
                'height': phone ? isMax ? 'calc(100% - 100px)' : '' : '',
                'display': isHide ? 'none' : 'block'
              }}
              >
                  <PhoneDrag id={WINDOW} />
                  <div className="relative text-[19px] text-white text-center w-full 
                  select-none phone:mt-[-30px] mb-[12px]">
                    {detail ? '机场NOTAM信息' : 'NOTAM信息'}
                  </div>
                  <div onClick={handleClose} className="absolute top-[4px] right-[16px] w-[60px] mt-[4px]
                        text-[#66a5f7] text-[18px] select-none rounded text-center leading-[20px] 
                        cursor-pointer duration-200 hover:text-[#6084d9] phone:mt-[5px]">&lt;&nbsp;返回
                    </div>
                    {
                        !detail &&
                        <div onClick={() => setEditMode(!editMode)} className={`absolute top-[4px] left-[15px] mt-[4px] h-[20px]
                            text-[13px] rounded text-white select-none
                            text-center leading-[20px] align-middle
                            cursor-pointer phone:mt-[5px] pb-[2px] pl-[6px] pr-[6px] ${editMode ? 'edit-mode-exit' : 'edit-mode-enable'}`}>{editMode ? '退出编辑' : '编辑列表'}
                        </div>
                    }
                      <Search placeholder="搜索机场ICAO" onSearch={handleSearch} />
                      <div className="relative common-window-height w-full overflow-x-hidden overflow-y-auto">
                        {
                            detail ? 
                            loading ?
                            <Skeleton active paragraph={{ rows: 10 }} /> :
                            fail ?
                            <Result
                              status="warning"
                              title="加载失败，请重试"
                            /> :
                            <div className="relative">
                                {
                                    data.length ?
                                    data.map(d => {
                                        return (
                                            <div key={`${d.id}-${d.created_at}`} className="relative m-2 rounded-md bg-[#345476] p-3">
                                                <div className="relative text-[15px] leading-[18px] text-white select-none">
                                                    {d.id}
                                                </div>
                                                <div className="relative text-[16px] leading-[19px] font-semibold text-white">
                                                    {d.title}
                                                </div>
                                                <div className="relative text-[13px] mt-1 mb-1 leading-[16px] text-white">
                                                {d.data}
                                                </div>
                                                <div className="flex justify-around items-center pt-2 pb-2">
                                                    <div className="relative w-[30px]">
                                                        <span>
                                                            { d.created_at && <CheckOne theme="filled" size="16" fill="#3acc71"/>}
                                                            { d.effective_at && <CheckOne theme="filled" size="16" fill="#3acc71"/>}
                                                            { d.expire_at && <CheckOne theme="filled" size="16" fill="#3acc71"/>}
                                                        </span>
                                                    </div>
                                                    <div className="relative text-gray-300 text-[13px] select-none leading-[16px] width-calc-notam">
                                                        { d.created_at &&  <span>创建日期：2023-08-11 07:05 <br /></span>}
                                                        { d.effective_at && <span>生效日期：2023-08-19 17:00 <br /></span>}
                                                        { d.expire_at && <span>失效日期：2023-08-19 22:00</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    }) :
                                    <Result
                                        status="warning"
                                        title="暂无该机场的NOTAM信息"
                                    />
                                }
                            </div>
                            :
                            list.length ? 
                            list.map(d => {
                                return (
                                    <div key={d.id} onClick={() => handleSearch(d.icao)} className="editable-element relative flex justify-between items-center left-0 w-full 
                                        mt-1 duration-200 cursor-pointer select-none hover:bg-[#3a5170]">
                                        <div className="ml-[40px]">
                                            <div className="relative mt-3 text-white font-bold text-[20px]">{d.icao}</div>
                                            <div className="relative mt-0 text-gray-400 text-[15px]">{d.date}</div>
                                        </div>
                                        <div onClick={e => handleDelete(d, e)} className="absolute w-[40px] right-0 h-full rounded bg-[#49678d] remove-button hidden justify-center items-center">
                                            <Delete theme="outline" size="25" fill="#ffffff" style={{'opacity': '0.6'}}/>
                                        </div>
                                    </div>
                                )
                          }) :
                          (
                            <Result
                              status="warning"
                              title="暂无NOTAM搜索记录"
                            />
                          )
                        }
                        <Divider />
                      </div>
                  
              </div>
        } </>
    )
}