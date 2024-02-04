import { CloseCircleOutlined , UndoOutlined, RedoOutlined , 
    ExpandOutlined , PushpinOutlined } from "@ant-design/icons"
import ActionAreaButton from "../common/ActionAreaButton"

export default () => {
    return (
        <div className="action-center absolute right-[30px] top-[20px] w-[36px] h-[210px] z-[23]">
            <ActionAreaButton ident="close">
                <CloseCircleOutlined style={{'fontSize': '24px', 'color': 'orangered'}} />
            </ActionAreaButton>
            <ActionAreaButton ident="left">
                <UndoOutlined style={{'fontSize': '24px'}} />
            </ActionAreaButton>
            <ActionAreaButton ident="right">
                <RedoOutlined style={{'fontSize': '24px'}} />
            </ActionAreaButton>
            <ActionAreaButton ident="center">
                <ExpandOutlined style={{'fontSize': '24px'}} />
            </ActionAreaButton>
            <ActionAreaButton ident="pin">
                <PushpinOutlined style={{'fontSize': '24px'}} />
            </ActionAreaButton>
        </div>
    )
}