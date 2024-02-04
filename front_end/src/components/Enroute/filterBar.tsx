import { useState , useEffect } from 'react'
import { LightHouse , HexagonOne, Airplane, CoordinateSystem, GridTwo, Halo, 
    HandleTriangle, Mountain, Road, ShareOne, Triangle, LinkCloud } from "@icon-park/react"
import { Tooltip } from 'antd'
import pubsub from 'pubsub-js'
import FilterItem from "./filterItem"

export default () => {

    const [isWeatherActive, setIsWeatherActive] = useState(false)

    useEffect(() => {
        const checkWeather = () => {
            const d = localStorage.getItem('weatherRadar')
            if (!d){
                localStorage.setItem('weatherRadar', 'false')
                setIsWeatherActive(false)
                return false
            }else{
                if (d === 'true'){
                    setIsWeatherActive(true)
                    pubsub.publish('weather-radar', 1)
                }
                return d === 'true'
            }
        }
        checkWeather()
    })

    const handleWeatherChange = () => {
        if (isWeatherActive){
            localStorage.setItem('weatherRadar', 'false')
            pubsub.publish('cancel-weather-radar', 1)
        }else{
            localStorage.setItem('weatherRadar', 'true')
            pubsub.publish('weather-radar', 1)
        }
        setIsWeatherActive(!isWeatherActive)
    }

    return (
        <div className="fixed right-0 mr-[5px] w-[36px] b-calc-50-minus-180px z-[12] h-[360px]">
            <FilterItem data="airport" content="机场" >
                <LightHouse theme="outline" size="24" fill="#ffffff"/>
            </FilterItem>
            <FilterItem data="vor" content="VOR" >
                <HexagonOne theme="outline" size="24" fill="#ffffff"/>
            </FilterItem>
            <FilterItem data="ndb" content="NDB" >
                <Halo theme="outline" size="24" fill="#ffffff"/>
            </FilterItem>
            <FilterItem data="airway" content="航路" >
                <ShareOne theme="outline" size="24" fill="#ffffff"/>
            </FilterItem>
            <FilterItem data="waypoint" content="航路点" >
                <Triangle theme="outline" size="24" fill="#ffffff"/>
            </FilterItem>
            <FilterItem data="terminal-waypoint" content="终端航路点" >
                <HandleTriangle theme="outline" size="24" fill="#ffffff"/>
            </FilterItem>
            <FilterItem data="amm" content="机场详情" >
                <Airplane theme="outline" size="24" fill="#ffffff"/>
            </FilterItem>
            <FilterItem data="road" content="公路/交通" >
                <Road theme="outline" size="24" fill="#ffffff"/>
            </FilterItem>
            <FilterItem data="terrain" content="地形/山区" >
                <Mountain theme="outline" size="24" fill="#ffffff"/>
            </FilterItem>
            <FilterItem data="grid" content="MORA/经纬度网络" >
                <GridTwo theme="outline" size="24" fill="#ffffff"/>
            </FilterItem>
            <FilterItem data="3d" content="3D地形(实验性功能*)" >
                <CoordinateSystem theme="outline" size="24" fill="#ffffff"/>
            </FilterItem>
            {/* 气象雷达单独制作 */}
            <Tooltip placement="left" title='气象雷达'>
                <div onClick={handleWeatherChange} 
                className={`filter-item flex w-full h-[36px]
                 m-[2px] rounded-sm justify-center items-center ${isWeatherActive ? 'active' : ''}`}>
                    <LinkCloud theme="outline" size="24" fill="#ffffff"/>
                </div>
            </Tooltip>
        </div>
    )
}