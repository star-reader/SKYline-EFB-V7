import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import 'mapbox-gl/dist/mapbox-gl.css'
import './index.css'
import './themes/global.less'
import './themes/animation.css'
import './themes/antd-overrid.less'
import './themes/night.less'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <>
    <App />
  </>,
)
