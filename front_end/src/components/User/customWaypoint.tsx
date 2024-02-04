import { useEffect, useState } from "react"
import { Button, Select, Form, Input } from 'antd';
import type { SelectProps } from 'antd';
import pubsub from 'pubsub-js'
import axios from 'axios'
import apiUrl from "../../config/api/apiUrl";
import createHeader from "../../utils/createHeader";
import useWaypointLayer from "../../hooks/user/useWaypointLayer";

interface Props {
    location: number[]
}

export default ({location}: Props) => {

    const [show, setShow] = useState(false)

    const onFinish = (value: CustomWaypointForm) => {
        axios.post(apiUrl.uploadWaypoint, {...value, 'location': location}, {'headers': createHeader()}).then(() => {
            useWaypointLayer()
            setShow(false)
        }).catch(() => {
            setShow(false)
        })
    }

    const options: SelectProps['options'] = [
        {"label":"航路点", "value":"waypoint"},
        {"label":"机场", "value":"airport"},
        {"label":"VOR", "value":"vor"},
        {"label":"NDB", "value":"ndb"},
        {"label": "其他", "value": "other"}
    ]

    useEffect(() => {
        pubsub.subscribe('show-custom-waypoint-panel',() => {
            setShow(true)
        })
    })

    return (
        <>
        {
            show &&
            <div className="fixed w-full h-full flex left-0 top-0 justify-center items-center z-[40] select-none create-flight">
                <div className="absolute w-[300px] h-[280px] rounded-md bg-[#2f4565] phone:top-[80px]">
                    <div className="relative m-2"></div>
                    <Form
                        name="new-waypoint"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        style={{ maxWidth: 260 }}
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                        autoComplete="off"
                    >
                        <Form.Item<CustomWaypointForm>
                        label="识别码"
                        name="ident"
                        rules={[{ required: true, message: '请填写航路点名称' }]}
                        >
                        <Input placeholder="例：DXG" />
                        </Form.Item>
                        <Form.Item<CustomWaypointForm>
                        label="名称"
                        name="name"
                        >
                        <Input placeholder="例：大兴" />
                        </Form.Item>
                        <Form.Item<CustomWaypointForm>
                        label="类型"
                        name="type"
                        rules={[{ required: true, message: '请选择类型' }]}
                        >
                        <Select
                        placeholder="选择航路点类型"
                        optionFilterProp="children"
                        options={options}
                        />
                        </Form.Item>
                        <Form.Item<CustomWaypointForm>
                        label="频率"
                        name="frequency"
                        >
                        <Input />
                        </Form.Item>

                        <Form.Item
                        wrapperCol={{ span: 16, offset: 8 }}>
                        <Button className="new-flight-submit" type="primary" htmlType="submit">
                            创建
                        </Button>
                        <Button className="new-flight-submit cancel" type="primary" htmlType="submit" 
                        style={{backgroundColor: 'orangered'
                        }} onClick={() => setShow(false)}>
                            取消
                        </Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>
        }
        </>
    )
}