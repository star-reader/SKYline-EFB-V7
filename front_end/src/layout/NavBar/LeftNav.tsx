import { LightHouse , HeavyRain , BookOne , MessageSuccess,
         InFlight , PersonalPrivacy } from '@icon-park/react'
import { useState , useEffect } from 'react'
import { Tooltip } from 'antd'
import pubsub from 'pubsub-js'
import LeftButton from "../../components/common/LeftButton"


export default () => {
    const [status, setStatus] = useState(Array(8).fill(false))
    const [phone, setPhone] = useState(false)

    const handleClick = (index: number) => {
        const arr = Array(8).fill(false)
        arr[index] = 1

        if (status[index] === 1){
            //之前已经打开了，点击关闭
            arr[index] = false
        }
        setStatus(arr)
    }

    useEffect(() => {
        pubsub.subscribe('common-close',() => {
            const arr = Array(8).fill(false)
            setStatus(arr)
        })
    },[])

    useEffect(() => {
        const setIsPhone = () => {
            const width = document.body.clientWidth
            if (width < 700){
                setPhone(true)
            }else{
                setPhone(false)
            }
        }

        setIsPhone()
        addEventListener('resize', () => setIsPhone())
    })

    return (
        <div className="nav-left fixed top-0 left-0 w-[50px] h-[100%] bg-[#3a4d69] z-[55] select-none
        phone:h-[50px] t-calc-full-minus-50px phone:w-full">
            <div className="relative mt-[80px] ml-[9px] phone:flex phone:justify-around phone:mt-[-6px]">
                <LeftButton isActive={status[0]} index={0} handleClick={handleClick}>
                    <Tooltip placement={phone ? 'top' : 'right'} title="机场信息">
                        <LightHouse theme="outline" size="30" fill="#ffffff"/>
                    </Tooltip>
                </LeftButton>
                <LeftButton isActive={status[1]} index={1} handleClick={handleClick}>
                    <Tooltip placement={phone ? 'top' : 'right'} title="航班签派">
                        <InFlight theme="outline" size="28" fill="#ffffff"/>
                    </Tooltip>
                </LeftButton>
                <LeftButton isActive={status[2]} index={2} handleClick={handleClick}>
                    <Tooltip placement={phone ? 'top' : 'right'} title="气象信息">
                        <HeavyRain theme="outline" size="30" fill="#ffffff"/>
                    </Tooltip>
                </LeftButton>
                <LeftButton isActive={status[3]} index={3} handleClick={handleClick}>
                    <Tooltip placement={phone ? 'top' : 'right'} title="NOTAM资料">
                        <MessageSuccess theme="outline" size="30" fill="#ffffff"/>
                    </Tooltip>
                </LeftButton>
                <LeftButton isDevHidden isActive={status[4]} index={4} handleClick={handleClick}>
                    <Tooltip placement={phone ? 'top' : 'right'} title="用户文档">
                        <BookOne theme="outline" size="28" fill="#ffffff" />
                    </Tooltip>
                </LeftButton>
                <LeftButton isActive={status[5]} index={5} handleClick={handleClick}>
                    <Tooltip placement={phone ? 'top' : 'right'} title="个人设置">
                        <PersonalPrivacy theme="outline" size="28" fill="#ffffff"/>
                    </Tooltip>
                </LeftButton>
            </div>
        </div>
    )
}