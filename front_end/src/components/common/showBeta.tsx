import { Tooltip } from 'antd'
interface Props {
    text: string,
    content: string
}

export default ({text, content}: Props) => {
    return (
        <Tooltip placement="topLeft" title={content} color='orange'>
            <span className="relative left-1 bg-[#34628d] text-[orange] font-bold text-[15px] rounded select-none" style={{padding: '1px 4px'}}>
                {text}*
            </span>
        </Tooltip>
    )
}