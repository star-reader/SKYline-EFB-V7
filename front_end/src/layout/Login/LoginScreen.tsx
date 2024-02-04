import { useState } from 'react';
import { Modal , Form , Input , Button , message } from 'antd';
import axios from 'axios'
import pubsub from 'pubsub-js'
import apiUrl from '../../config/api/apiUrl';
import background from '../../assets/loginBase64'
import NewItem from './NewItem'
import { dataEncrypt } from '../../utils/crypto';
import oAuth2 from '../../config/oAuth2';

// 图片
import global from '../../assets/preview/global.png'
import taxiway from '../../assets/preview/taxiway.png'
import plan from '../../assets/preview/plan.png'
import vfr from '../../assets/preview/vfr.png'
import aip from '../../assets/preview/aip.png'
import d3 from '../../assets/preview/3d.png'
import chinese from '../../assets/preview/chinese.png'
import notam from '../../assets/preview/notam.png'
import ownship from '../../assets/preview/ownship.png'
import pinboard from '../../assets/preview/pinboard.png'


export default () => {
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleRegister = () => {
        window.open('https://pilot.skylineflyleague.cn/Register','SKYline Flyleague-注册飞行员中心编号',
        "width=600,height=900,menubar=no,toolbar=no,location=no,status=no")
    }
    
    const onFinish = (form: LoginForm) => {
        // 涉及用户部分，暂不提供。可以自定义积分规则
    }

    return (
        <div className="fixed left-0 top-0 w-full h-full z-[100] select-none"
        style={{backgroundImage: `url(${background})`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
            <div className="login-container relative left-[10%] w-[80%] rounded-[10px] z-[101] overflow-x-hidden overflow-y-auto"
            style={{backgroundImage: `linear-gradient(30deg,rgb(9 96 195 / 22%) 40%, rgb(24 221 201 / 39%)80%)`,
            backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)'}}>
                <div className="relative pt-[40px] text-white text-[28px] font-bold text-center phone:text-[20px] small:text-[18px]">欢迎使用SKYline电子飞行包</div>
                <div className="relative flex flex-wrap justify-between items-center w-[90%] left-[5%]">
                    <NewItem intro='全球投影视图'>
                        <img src={global} alt='全球投影视图' />
                    </NewItem>
                    <NewItem intro='机场滑行道展示'>
                        <img src={taxiway} alt='机场滑行道展示' />
                    </NewItem>
                    <NewItem intro='飞行计划展示'>
                        <img src={plan} alt='飞行计划展示' />
                    </NewItem>
                    <NewItem intro='VFR定制地图'>
                        <img src={vfr} alt='VFR定制地图' />
                    </NewItem>
                    <NewItem intro='AIP航图支持'>
                        <img src={aip} alt='AIP航图支持' />
                    </NewItem>
                    <NewItem intro='3D地形展示'>
                        <img src={d3} alt='3D地形展示' />
                    </NewItem>
                    <NewItem intro='中文数据'>
                        <img src={chinese} alt='中文数据' />
                    </NewItem>
                    <NewItem intro='NOTAM信息获取'>
                        <img src={notam} alt='NOTAM信息获取' />
                    </NewItem>
                    <NewItem intro='OwnShip飞行指引'>
                        <img src={ownship} alt='OwnShip飞行指引' />
                    </NewItem>
                    <NewItem intro='航图固定'>
                        <img src={pinboard} alt='航图固定' />
                    </NewItem>
                </div>
            </div>
            <div className="relative pt-[180px] mb-[30px] flex justify-between flex-wrap w-[60%] left-[20%] z-[104] phone:w-[90%] phone:left-[5%] text-white">
                <div role='buttom' className="relative cursor-pointer h-[35px] leading-[35px] align-middle rounded-lg mb-3
                w-[150px] text-center text-[14px] small:text-[12px] bg-[#409EFF] hover:bg-[rgb(51,126,204)]" onClick={handleRegister}>没有账号?立即注册</div>
                <div role='buttom' className="relative cursor-pointer h-[35px] leading-[35px] align-middle rounded-lg
                w-[150px] text-center text-[14px] small:text-[12px] bg-[#67C23A] hover:bg-[rgb(82,155,46)]" onClick={() => setIsModalOpen(true)}>登录</div>
            </div>
            <Modal title="请登录" open={isModalOpen} onCancel={() => setIsModalOpen(false)}>
            <Form
                        name="new-waypoint"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                        autoComplete="off"
                    >
                        <Form.Item<LoginForm>
                        label="注册账号"
                        name="username"
                        rules={[{ required: true, message: '请输入账号' },{'pattern': /^\d+$/g}]}
                        >
                        <Input />
                        </Form.Item>
                        <Form.Item<LoginForm>
                        label="密码"
                        name="password"
                        rules={[{ required: true, message: '请输入密码'}]}
                        >
                        <Input type='password' />
                        </Form.Item>
                        <Form.Item
                        wrapperCol={{ span: 16, offset: 8 }}>
                        <Button className="login-form-submit" type="primary" htmlType="submit">
                            立即登录
                        </Button>
                        </Form.Item>
                    </Form>
            </Modal>
        </div>
    )
}