import { _decorator, Color, Component, director, Node, Sprite } from 'cc';
import { SJZXD_Constant, SJZXD_PropType, SJZXD_Quality } from './SJZXD_Constant';
import { SJZXD_GameManager } from './SJZXD_GameManager';
import { SJZXD_EventManager } from './SJZXD_EventManager';
import { SJZXD_GameData } from './SJZXD_GameData';
const { ccclass, property } = _decorator;

@ccclass('SJZXD_vessel')
export class SJZXD_vessel extends Component {

    @property({ displayName: "基础爆率" })
    public qualitydetonation: number = 1;//基础爆率(影响出高品质的数值)

    @property()
    public MaxPropNum: number = 6;
    @property()
    public MinPropNum: number = 2;

    @property({ type: [String], displayName: "大红列表" })
    public RedPropList: String[] = [];//能出大红的列表

    public vesselData: { Name: string, Isobserve: boolean }[] = [];

    public IsLock: boolean = false;//是否已经开过 
    protected start(): void {
        this.Init();
        director.getScene().on(SJZXD_EventManager.进入容器范围, this.drawOutline, this);
        director.getScene().on(SJZXD_EventManager.离开容器范围, this.drawOutline2, this);
    }

    Init() {
        // 获取当前场景的爆率`
        const sceneData = SJZXD_Constant.GetSceneDataByName(SJZXD_GameManager.GameScene);
        const sceneDetonation = sceneData ? sceneData.场景爆率 : 0;
        //研究所爆率
        let studyDetonation = SJZXD_Constant.LaboratoryLevelData[2][SJZXD_GameData.Instance.LaboratoryLevel[2]];
        // 计算最终爆率值
        const finalDetonation = this.qualitydetonation + sceneDetonation + studyDetonation + SJZXD_GameManager.Instance.ExtraDetonation;

        // 计算道具数量（在MinPropNum和MaxPropNum之间）
        const propCount = Math.floor(Math.random() * (this.MaxPropNum - this.MinPropNum + 1)) + this.MinPropNum;

        // 重新初始化容器数据
        this.vesselData = [];

        // 获取所有回收物列表
        const allRecycleProps = SJZXD_Constant.getAllPropByType(SJZXD_PropType.回收物);

        // 将回收物按品质分组
        const propsByQuality: { [key: number]: string[] } = {};
        for (const propName of allRecycleProps) {
            const propData = SJZXD_Constant.getPropDataByName(propName);
            if (propData) {
                if (!propsByQuality[propData.quality]) {
                    propsByQuality[propData.quality] = [];
                }
                propsByQuality[propData.quality].push(propName);
            }
        }

        // 生成道具
        for (let i = 0; i < propCount; i++) {
            let selectedPropName: string;

            // 根据爆率计算各品质的权重
            const qualityWeights = this.calculateQualityWeights(finalDetonation);

            // 随机选择一个品质
            const selectedQuality = this.selectQualityByWeight(qualityWeights);

            // 根据品质选择道具
            if (selectedQuality === SJZXD_Quality.红色 && this.RedPropList.length > 0) {
                // 如果是红色品质且RedPropList不为空，则从RedPropList中选择
                selectedPropName = this.RedPropList[Math.floor(Math.random() * this.RedPropList.length)].toString();

                // 确保选中的道具是回收物类型且是红色品质
                const propData = SJZXD_Constant.getPropDataByName(selectedPropName);
                if (!propData || propData.type !== SJZXD_PropType.回收物 || propData.quality !== SJZXD_Quality.红色) {
                    // 如果RedPropList中的道具不符合条件，则从对应品质的道具中随机选择
                    const qualityProps = propsByQuality[selectedQuality] || [];
                    if (qualityProps.length > 0) {
                        selectedPropName = qualityProps[Math.floor(Math.random() * qualityProps.length)];
                    } else {
                        // 如果指定品质没有道具，则从所有回收物中随机选择
                        selectedPropName = allRecycleProps[Math.floor(Math.random() * allRecycleProps.length)];
                    }
                }
            } else {
                // 从对应品质的道具中选择
                const qualityProps = propsByQuality[selectedQuality] || [];
                if (qualityProps.length > 0) {
                    selectedPropName = qualityProps[Math.floor(Math.random() * qualityProps.length)];
                } else {
                    // 如果指定品质没有道具，则从所有回收物中随机选择
                    selectedPropName = allRecycleProps[Math.floor(Math.random() * allRecycleProps.length)];
                }
            }

            // 添加到容器数据中
            this.vesselData.push({
                Name: selectedPropName,
                Isobserve: false
            });
        }

        // console.log("道具列表：", this.vesselData);
        // console.log(this.getQualityCount(this.vesselData));
    }
    // 统计vesselData中各个品质物品的数量
    public getQualityCount(vesselData: { Name: string, Isobserve: boolean }[]): { [quality: number]: number } {
        const qualityCount: { [quality: number]: number } = {};

        // 初始化所有品质的计数为0
        for (const qualityKey in SJZXD_Quality) {
            if (isNaN(Number(qualityKey))) { // 跳过字符串键，只保留数字键
                continue;
            }
            qualityCount[Number(qualityKey)] = 0;
        }

        // 遍历vesselData，统计每个道具的品质
        for (const item of vesselData) {
            const propData = SJZXD_Constant.getPropDataByName(item.Name);
            if (propData) {
                // 增加对应品质的计数
                qualityCount[propData.quality] = (qualityCount[propData.quality] || 0) + 1;
            }
        }

        return qualityCount;
    }
    // 计算各品质的权重，基于爆率
    private calculateQualityWeights(finalDetonation: number): { quality: SJZXD_Quality, weight: number }[] {
        // 将爆率标准化为0-1之间的值
        const normalizedDetonation = Math.min(1, Math.max(0, finalDetonation / 100));

        const baseRainbowChance = 0.02; // 
        const extraRainbowChance = 0.98; // 爆率达到100时，额外的最高品质概率

        const rainbowWeight = baseRainbowChance + normalizedDetonation * extraRainbowChance;

        const othersTotalWeight = 1;
        const scalingFactor = othersTotalWeight / (1 + normalizedDetonation); // 随爆率增加，其他品质总权重减小

        const whiteWeight = Math.max(0.01, scalingFactor * (0.4 - normalizedDetonation * 0.3)); // 0.4->0.1
        const greenWeight = Math.max(0.01, scalingFactor * (0.25 - normalizedDetonation * 0.15)); // 0.25->0.1
        const blueWeight = Math.max(0.01, scalingFactor * (0.2 - normalizedDetonation * 0.05)); // 0.2->0.15
        const purpleWeight = Math.max(0.01, scalingFactor * (0.15 + normalizedDetonation * 0.1)); // 0.15->0.25
        const goldWeight = Math.max(0.01, scalingFactor * (0.05 + normalizedDetonation * 0.2)); // 0.05->0.25
        const redWeight = Math.max(0.01, normalizedDetonation * 0.15); // 0->0.15

        return [
            { quality: SJZXD_Quality.白色, weight: whiteWeight },
            { quality: SJZXD_Quality.绿色, weight: greenWeight },
            { quality: SJZXD_Quality.蓝色, weight: blueWeight },
            { quality: SJZXD_Quality.紫色, weight: purpleWeight },
            { quality: SJZXD_Quality.金色, weight: goldWeight },
            { quality: SJZXD_Quality.红色, weight: redWeight },
            { quality: SJZXD_Quality.炫彩, weight: rainbowWeight }
        ];
    }
    // 根据权重选择品质
    private selectQualityByWeight(weights: { quality: SJZXD_Quality, weight: number }[]): SJZXD_Quality {
        // 计算总权重
        const totalWeight = weights.reduce((sum, item) => sum + item.weight, 0);

        // 生成随机值
        const randomValue = Math.random() * totalWeight;

        // 选择品质
        let currentWeight = 0;
        for (const item of weights) {
            currentWeight += item.weight;
            if (randomValue <= currentWeight) {
                return item.quality;
            }
        }

        // 默认返回白色品质
        return SJZXD_Quality.白色;
    }

    //绘制描边
    public drawOutline(node: Node) {
        if (node == this.node) {
            this.node.getChildByName("触发描边").active = true;
        } else {
            this.node.getChildByName("触发描边").active = false;
        }
    }
    //离开的时候取消描边
    public drawOutline2(node: Node) {
        if (node == this.node) {
            this.node.getChildByName("触发描边").active = false;
        }
    }

    //设置物体为半黑色(已经触发过)
    public SetHalfBlack() {
        this.IsLock = true;
        this.node.getChildByName("图片").getComponent(Sprite).color = new Color(120, 120, 120, 255);
        this.node.getChildByName("触摸特效").active = false;
    }
}


