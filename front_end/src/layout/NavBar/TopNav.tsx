import {DownCircleOutlined, EyeOutlined, GlobalOutlined, UpCircleOutlined, CopyrightOutlined } from "@ant-design/icons"
import { Layers , SunOne , Moon , TakeOff, FullScreenOne, Lock, OffScreen, Unlock } from "@icon-park/react"
import pubsub from 'pubsub-js'
import { Dropdown, MenuProps } from 'antd'
import { useState } from "react"
import { appWindow } from '@tauri-apps/api/window'
import { getPreset, getStyleByPreset } from "../../hooks/map/useEnrouteMap"
import { getPresetByPreset } from "../../hooks/map/useEnrouteMap"
import { getMapTheme } from "../../hooks/map/useMapStyle"
import TopSearch from "./TopSearch"
import OwnShipPanel from '../../components/Ownship/panel'


export default () => {
    const [displayMode, setDisplayMode] = useState(getMapTheme())
    const [preset, setPreset] = useState(getPreset())
    const [isFullScreen, setIsFullScreen] = useState(false)
    const [isTop, setIsTop] = useState(false)
    // @ts-ignore
    const isTauri = window.__TAURI__ ? true : false

    const items: MenuProps['items'] = [
        {
          key: 'ifrh',
          label: (
            <span onClick={() => changePreset('ifrh')}>World IFR High</span>
          ),
          icon: <UpCircleOutlined />
        },
        {
          key: 'ifrl',
          label: (
            <span onClick={() => changePreset('ifrl')}>World IFR Low</span>
          ),
          icon: <DownCircleOutlined />
        },
        {
          key: 'vfr',
          label: (
            <span onClick={() => changePreset('vfr')}>World VFR</span>
          ),
          icon: <EyeOutlined />
        },
        {
          key: 'aip',
          label: (
            <span onClick={() => changePreset('aip')}>China AIP</span>
          ),
          icon: <CopyrightOutlined />
        },
        {
          key: 'sate',
          label: (
            <span onClick={() => changePreset('sate')}>World Satellite</span>
          ),
          icon: <GlobalOutlined />
        }
    ]

    const switchNightMode = () => {
        const theme = displayMode === 'night' ? 'light' : 'night'
        setDisplayMode(theme)
        localStorage.setItem('theme', theme)
        pubsub.publish('change-theme', theme)
    }

    const changePreset = (preset: 'ifrh' | 'ifrl' | 'vfr' | 'sate'|'aip') => {
        setPreset(getPresetByPreset(preset))
        const style = getStyleByPreset(preset)
        localStorage.setItem('preset', preset)
        localStorage.setItem('style', JSON.stringify(style))
        pubsub.publish('change-enroute-preset', preset)
        //pubsub.publish('request-repaint-map', 1)
    }

    const handleClickOwnship = () => {
        pubsub.publish('click-ownship-panel', 1)
    }

    const changeTop = async () => {
      const d = isTop
      if (d){
        await appWindow.setAlwaysOnTop(false)
        setIsTop(false)
      }else{
        await appWindow.setAlwaysOnTop(true)
        setIsTop(true)
      }
    }

    const changeFullScreen = async () => {
        const d = isFullScreen
        if (d){
          //已经是全屏，要退出全屏
          await appWindow.setFullscreen(false)
          setIsFullScreen(false)
        }else{
          await appWindow.setFullscreen(true)
          setIsFullScreen(true)
        }
    }

    return (
        <div className="nav-top fixed left-0 top-0 w-full h-[50px] bg-[#3a4d69] z-[56] select-none">
          <div className="absolute top-0 left-0 w-full">
            <div className="flex left-0 w-full justify-center">
                <span className="relative leading-[50px] text-white text-[20px] small:hidden">
                  {preset}
                </span>
            </div>
          </div>
          <div className="relative flex flex-nowrap items-center">
            <TopSearch />
            <div onClick={handleClickOwnship} className="relative left-[70px] cursor-pointer items-center top-[6px]">
              <TakeOff theme="outline" size="36" fill="#ffffff"/>
            </div>
          </div>
          <OwnShipPanel />
            <div className="absolute right-[10px] top-0 h-[50px] pt-[10px]" style={{width: isTauri ? '200px' : '120px'}}>
                <div className="flex justify-around cursor-pointer">
                    <Dropdown menu={ {items} } placement="bottom" arrow>
                        <Layers theme="outline" size="28" fill="#ffffff"/>
                    </Dropdown>
                    <div onClick={switchNightMode}>
                    {
                        displayMode === 'night' ?
                        <Moon theme="outline" size="28" fill="#ffffff"/> :
                        <SunOne theme="outline" size="28" fill="#ffffff"/>
                    }
                    </div>
                    <>
                    {
                      isTauri &&
                      <>
                      <div onClick={changeFullScreen}>
                        {
                          isFullScreen ? 
                          <OffScreen theme="outline" size="28" fill="#ffffff"/>
                          :
                          <FullScreenOne theme="outline" size="28" fill="#ffffff"/>
                        }
                        </div>
                        <div onClick={changeTop}>
                        {
                          isTop ?
                          <Unlock theme="outline" size="28" fill="#ffffff"/>
                          :
                          <Lock theme="outline" size="28" fill="#ffffff"/>
                        }
                      </div>
                      </>
                    }
                    </>
                </div>
            </div>
        </div>
    )
}