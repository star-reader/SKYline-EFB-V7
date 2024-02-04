# SKYline-EFB-V7
SKYline电子飞行包V7（2023.2.5更新至V7.2.0）

![img](https://bbs.skylineflyleague.cn/assets/logo-9hy3tgdy.png)

* front_end为前端文件，使用React+TypeScript_Vite+TailWindCSS编写
* back_end为后端文件，使用Nodejs+TypeScript+Express编写
* data_and_tools为一些处理数据的工具和一些原始数据（如AMM全球机场的数据等）

后端部分内容API来自Trish API，还有部分与处理用户隐私相关的代码在本系统重不予公开展示，使用前请确保已经自定义部署这些内容

本产品使用**GNU Public License 3.0**许可证进行开源，除了上面提到的自定义本代码中未予公开的API部分代码、与部署方用户隐私相关的部分外，其他对代码的任何改动必须也**相同的开源协议进行开源**

EFB涉及的部分数据来源如下：
* 杰普森航图与全球航路图数据：JeppView Export
* AIP航图与数据库、航路图中的中文汉化：CAAC ATMB AISC（中国民用航空局空中交通管理局航行情报服务中心）
* 全球机场AMM数据（滑行道、停机位等）：OpenStreetMap
* 气象报文（原始数据）、NOTAM：FAA
* 卫星地图：Mapbox、ArcGIS
* 街区图、街区与城市数据： Mapbox
* 气象雷达：RainViewer

若您部署了本项目，或使用了本项目相应部分的代码即证明您已**阅读并同意上述数据来源声明，并愿意遵守本产品开源协议规则**

若您对上述的任何一条有异议，我们建议您不要部署本项目

若您想获取更多技术数据和技术支持，请于SKYline技术组取得联系！
