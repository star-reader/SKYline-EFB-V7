import { ReactNode } from 'react'
import pubsub from 'pubsub-js'

interface Props {
    children: ReactNode,
    ident: string
}

export default ({children, ident}: Props) => {

    const click = () => {
        pubsub.publish('chart-action',ident)
    }

    return (
        <div onClick={click} className="relative w-[36px] h-[36px] rounded-[50%] mb-[10px] duration-300 text-white
            text-center cursor-pointer leading-[34px] hover:text-[#5479c7]"
            style={{'backgroundColor': 'rgba(50,50,50,.4)'}}>
                {children}
        </div>
    )
}