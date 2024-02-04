import { useEffect, useState } from "react"
import { Button, Form, Input } from 'antd';
import pubsub from 'pubsub-js'

export default () => {

    const [show, setShow] = useState(false)

    const onFinish = (value: SimbriefForm) => {
        localStorage.setItem('simbrief', value.username)
        pubsub.publish('simbrief-edit-over', value.username)
        setShow(false)
    }

    useEffect(() => {
        pubsub.subscribe('show-simbrief-edit-panel',() => {
            setShow(true)
        })
    })

    return (
        <>
        {
            show &&
            <div className="fixed w-full h-full flex left-0 top-0 justify-center items-center z-[40] select-none create-flight duration-500 bg-[rgba(0,0,0,0.25)]">
                <div className="absolute w-[300px] rounded-md inner-box pl-2 bg-[#2f4565] phone:top-[80px]">
                    <div className="relative m-2"></div>
                    <Form
                        name="simbrief-name"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        style={{ maxWidth: 280 }}
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                        autoComplete="off"
                    >
                        <Form.Item<SimbriefForm>
                        label="用户名"
                        name="username"
                        rules={[{ required: true, message: '请填写用户名' }]}
                        >
                        <Input placeholder="Simbrief用户名，不是ID" />
                        </Form.Item>
                        <Form.Item
                        wrapperCol={{ span: 16, offset: 8 }}>
                        <Button className="new-flight-submit" type="primary" htmlType="submit">
                            确定
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