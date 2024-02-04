import { useEffect , useState } from 'react'
//import { Modal } from 'antd'
import pubsub from 'pubsub-js'
import LeftNav from "./layout/NavBar/LeftNav"
import TopNav from "./layout/NavBar/TopNav"
import EnrouteChart from './components/Enroute/index'
import SearchPanel from "./components/Search/searchPanel"
import WeatherPanel from './components/Weather/panel'
import FlightPanel from './components/Flight/panel'
import NOTAMPanel from './components/NOTAM/panel'
import AirportPanel from './components/Airport/panel'
import ChartViewer from './components/ChartViewer/viewer'
import RouteMenu from './components/Flight/routeMenu'
import SettingPanel from './components/Setting/panel'
import DocsPanel from './components/User/docPanel'
import PinBoard from './components/Pinboard/pinboard'
import LoginScreen from './layout/Login/LoginScreen'
import useOwnShip from './hooks/ownship/useOwnShip'
import Welcome from './screens/loadingScreen'
import DataManagement from './components/User/dataManagement'
import checkLogin from './utils/auth/checkLogin'
import getAccessToken from './utils/auth/getAccessToken'
import getUserPoint from './utils/getUserPoint'
import ShowNoPoints from './components/common/showNoPoints'

function App() {

  const [login, setLogin] = useState(false)
  const [tokenReady, setTokenReady] = useState(false)
  //const [isModalOpen, setIsModalOpen] = useState(false)
  //const appVersion = '7.1.0'

  useEffect(() => {
    useOwnShip()
    const loginState = checkLogin()

    switch (loginState) {
      case 'no-login':
            setLogin(false)
            break;
      case 'token-expire':
            getAccessToken()
            break
      case 'login-success':
            setLogin(true)
            getAccessToken()
            break
      default:
        setLogin(false)
        break;
    }
    pubsub.subscribe('login-success',() => setTimeout(() => setLogin(true), 800))
    pubsub.subscribe('token-error', () => setLogin(false))
    pubsub.subscribe('logout-user', () => setLogin(false))
    
    pubsub.subscribe('token-ok',() => {
        setLogin(true)
        setTokenReady(true)
        getUserPoint()
        setInterval(() => getAccessToken(), 3500000)
        setInterval(() => getUserPoint(), 1500000)
    })

  }, [])

  return (
    <>
    {
      <>
        <Welcome />
        {
          login ? 
          <>
            {
              tokenReady &&
              <>
                  <ShowNoPoints />
                  <TopNav />
                  <LeftNav />
                  <EnrouteChart />
                  <SearchPanel />
                  <FlightPanel />
                  <WeatherPanel />
                  <NOTAMPanel />
                  <AirportPanel />
                  <DocsPanel />
                  <SettingPanel />
                  <ChartViewer />
                  <RouteMenu />
                  <PinBoard />
                  <DataManagement />
                :
                {getAccessToken()}
              </>
            }
          </>
          :
            <LoginScreen />
        }
      </>
    }
    </>
  )
}

export default App
