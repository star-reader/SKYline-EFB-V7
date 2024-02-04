import { useEffect, useState } from "react"
import { Button, Select, Form, Input , message } from 'antd';
import type { SelectProps } from 'antd';
import pubsub from 'pubsub-js'
import axios from 'axios'

import getRandom from "../../utils/getRandom";
import getUTCString from "../../utils/getUTCString";
import useLoadOFP from "../../hooks/flight/useLoadOFP";
import createHeader from "../../utils/createHeader";
import apiUrl from "../../config/api/apiUrl";

const { TextArea } = Input;

export default () => {
    const [messageApi] = message.useMessage()
    const [isShow, setIsShow] = useState(false)
    useEffect(() => {
        pubsub.subscribe('create-new-flight-panel',() => {
            setIsShow(true)
        })
        pubsub.subscribe('load-temp-flight',(_,data: FieldType) => {
            onFinish(data, true, data.simbrief)
        })
    },[])

    const loadFlightInfo = (value: FieldType, isTemp?: boolean, isSimbrief?: boolean) => {
        //自动添加id
        value.id = value.id ? value.id :getRandom(32),
        value.date = getUTCString()
        pubsub.publish('start-loading-flight', 1)
        if (!isTemp){
            axios.post(apiUrl.uploadTempFlight,{'flight': value},{'headers': createHeader()}).then(r => {
                if (r.data.code !== 200){
                    message.error('航班数据云同步失败')
                }
            }).catch(() => {
                messageApi.error('航班数据云同步失败')
            })
        }
        try {
            // 需要找到simbrief数据
            useLoadOFP(value, isSimbrief)
        } catch (error) {
            pubsub.publish('load-flight-failed',0)
        }
    }

    const onFinish = (value: FieldType, isTemp?: boolean, isSimbrief?: boolean) => {
        loadFlightInfo(value, isTemp, isSimbrief)
        setIsShow(false)
    }

    const options: SelectProps['options'] = [
        {"label":"Airbus A318-100", "value":"A318"},
        {"label": "Airbus A319-100", "value":"A319"},
        {"label": "Airbus A320-214", "value":"A320"},
        {"label": "Airbus A320-251N", "value":"A32N"},
        {"label": "Airbus A321-200", "value":"A321"},
        {"label": "Airbus A330-200", "value":"A332"},
        {"label": "Airbus A330-300", "value":"A333"},
        {"label": "Airbus A330-800", "value":"A338"},
        {"label": "Airbus A330-900", "value":"A339"},
        {"label": "Airbus A340-200", "value":"A342"},
        {"label": "Airbus A340-300", "value":"A343"},
        {"label": "Airbus A340-500", "value":"A345"},
        {"label": "Airbus A340-600", "value":"A346"},
        {"label": "Airbus A350-914", "value":"A359"},
        {"label": "Airbus A380-800", "value":"A388"},
        {"label": "Airbus A380-900", "value":"A389"},
        {"label": "Boeing B707-320B", "value":"B703"},
        {"label": "Boeing B737-200", "value":"B732"},
        {"label": "Boeing B737-300", "value":"B733"},
        {"label": "Boeing B737-400", "value":"B734"},
        {"label": "Boeing B737-500", "value":"B735"},
        {"label": "Boeing B737-600", "value":"B736"},
        {"label": "Boeing B737-700", "value":"B737"},
        {"label": "Boeing B737-800", "value":"B738"},
        {"label": "Boeing B737-900", "value":"B739"},
        {"label": "Boeing B737 MAX 8", "value":"B38M"},
        {"label": "Boeing B747-200", "value":"B742"},
        {"label": "Boeing B747-400", "value":"B744"},
        {"label": "Boeing B747-400F", "value":"B74F"},
        {"label": "Boeing B747-8", "value":"B748"},
        {"label": "Boeing B757-200", "value":"B752"},
        {"label": "Boeing B757-300", "value":"B753"},
        {"label": "Boeing B777-200LR", "value":"B77L"},
        {"label": "Boeing B777-300ER", "value":"B77W"},
        {"label": "Boeing B787-8", "value":"B788"},
        {"label": "Boeing B787-9", "value":"B789"},
        {"label": "Boeing B787-10", "value":"B78X"},
    ]

    return (
        <>{
            isShow &&
            <div className="fixed w-full h-full left-0 top-0 flex justify-center items-center z-[40] select-none create-flight duration-500 bg-[rgba(0,0,0,0.25)]">
                <div className=" w-[400px] pt-3 pb-3 pl-2 pr-2 phone:w-[80%] phone:max-h-[70%] inner-box rounded-md bg-[#2f4565] "
                style={{overflow: 'hidden auto'}}>
                       <div className="relative text-center text-white text-[16px]">
                            新建飞行计划
                        </div>
                        <div className="relative w-full mt-1">
                            <Form
                            name="new-flight"
                            labelCol={{ span: 8 }}
                            wrapperCol={{ span: 16 }}
                            style={{ maxWidth: 400 }}
                            initialValues={{ remember: true }}
                            onFinish={onFinish}
                            autoComplete="off"
                        >
                            <Form.Item<FieldType>
                            label="航班号"
                            name="callsign"
                            rules={[{ required: true, message: '请填写航班号' }]}
                            >
                            <Input />
                            </Form.Item>

                            <Form.Item<FieldType>
                            label="起飞机场"
                            name="departure"
                            rules={[{ required: true, message: '请填写起飞机场' }]}
                            >
                            <Input />
                            </Form.Item>

                            <Form.Item<FieldType>
                            label="到达机场"
                            name="arrival"
                            rules={[{ required: true, message: '请填写到达机场' }]}
                            >
                            <Input />
                            </Form.Item>

                            <Form.Item<FieldType>
                            label="机型"
                            name="aircraft"
                            rules={[{ required: true, message: '请填写机型' }]}
                            >
                            <Select
                            placeholder="选择机型"
                            optionFilterProp="children"
                            options={options}
                            />
                            </Form.Item>

                            <Form.Item<FieldType>
                            label="成本指数"
                            name="costIndex"
                            >
                            <Input />
                            </Form.Item>

                            <Form.Item<FieldType>
                            label="额外燃油(分钟)"
                            name="reserve_fuel"
                            >
                            <Input />
                            </Form.Item>

                            <Form.Item<FieldType>
                            label="预计巡航高度"
                            name="altitude"
                            >
                            <Input />
                            </Form.Item>

                            <Form.Item<FieldType>
                            label="乘客"
                            name="passenger"
                            >
                            <Input />
                            </Form.Item>

                            <Form.Item<FieldType>
                            label="载重(kg)"
                            name="load"
                            >
                            <Input />
                            </Form.Item>

                            <Form.Item<FieldType>
                            label="自定义航路"
                            name="selfRoute"
                            >
                            <TextArea placeholder="如使用系统自动航路则留空" />
                            </Form.Item>

                            <Form.Item
                            wrapperCol={{ span: 16, offset: 8 }}>
                            <Button className="new-flight-submit" type="primary" htmlType="submit">
                                生成签派记录
                            </Button>
                            <Button className="new-flight-submit cancel" type="primary" htmlType="submit" 
                            style={{backgroundColor: 'orangered'
                            }} onClick={() => setIsShow(false)}>
                                取消
                            </Button>
                            </Form.Item>
                        </Form>
                        </div>
                </div>
            </div>
        }
        </>
    )
}
