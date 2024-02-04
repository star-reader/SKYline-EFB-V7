import { type UserInter } from "../../config/interface/main"

/**获取航路图显示类型，如IFR、VFR、World Map、World Satellite等 */
const getMapType = () => {
    const defaultType: UserInter = "ifrh"
    const userType = localStorage.getItem('map-type')
    if (userType){
        return userType as UserInter
    }else{
        localStorage.setItem('map-type', defaultType)
        return defaultType
    }
}

/**获取航路图具体显示内容，如航点、机场、VOR等 */
const getFilteredType = () => {
    //! depressed!
}

export {
    getMapType
}