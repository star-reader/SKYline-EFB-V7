import bsod from '../assets/bsod.png'
export default () => {
    return (
        <div className="fixed left-0 top-0 w-full h-full z-[120] bg-[rgb(32,104,180)] select-none text-white">
            <div className="relative mt-[90px] ml-[190px] small:hidden">
                <img src={bsod} alt="BSOD_Logo" style={{width: '120px'}} />
            </div>
            <div className="relative mt-[70px] ml-[190px] text-[30px] font-bold small:ml-[30px]">你的EFB遇到问题，需要重启</div>
            <div className="relative mt-[20px] ml-[190px] text-[30px] font-bold small:ml-[30px]">如果问题依然存在，请联系技术人员</div>
            <div className="relative mt-[50px] ml-[190px] text-[20px] small:ml-[30px]">100%完成</div>
            <div className="relative mt-[90px] ml-[190px] text-[17px] small:ml-[30px]">请将此问题反馈给技术人员，以便了解错误原因并进行Bug修复</div>
            <div className="relative mt-[10px] ml-[190px] text-[17px] small:ml-[30px]">给您使用带来的不便，敬请谅解！</div>
        </div>
    )
}