import { Input } from 'antd'
import { Search as SearchIcon } from '@icon-park/react'
import { useState , useEffect } from 'react'
import pubsub from 'pubsub-js'
const { Search } = Input


export default () => {
    const [isShow, setIsShow] = useState(true)
    const [isPhone, setIsPhone] = useState(false)

    const handleChange = () => {
        setIsShow(!isShow)
    }

    const handleSearch = (value: string) => {
        if (!value) return
        pubsub.publish('start-searching', value.toUpperCase())
    }

    useEffect(() => {
        const setWidth = () => {
            const width = document.body.scrollWidth
            if (width <= 700){
                setIsShow(false)
                setIsPhone(true)
            }else{
                setIsShow(true)
                setIsPhone(false)
            }
        }

        setWidth()
        addEventListener('resize', setWidth)
    },[])

    return (
        <>
            {
            isPhone &&  
            <div className="absolute left-[20px] top-[12px] w-[25px] overflow-hidden cursor-pointer">
                <SearchIcon onClick={handleChange} theme="outline" size="28" fill="#ffffff"/>
            </div>}
            {
                isShow &&
                <div className="relative left-[60px] top-[9px] overflow-hidden ani-show-search">
                    <Search placeholder="搜索数据" allowClear onSearch={handleSearch} style={{ width: 160 }} />
                </div> 
            }   
            
        </>
    )
}