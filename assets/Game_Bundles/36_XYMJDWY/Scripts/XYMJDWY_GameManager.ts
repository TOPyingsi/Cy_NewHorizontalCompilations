import { _decorator, AudioClip, Component, director, instantiate, Label, Node, NodeEventType, PhysicsSystem2D, postProcess, tween, v3 } from 'cc';
import { XYMJDWY_Constant } from './XYMJDWY_Constant';
import { AudioManager } from 'db://assets/Scripts/Framework/Managers/AudioManager';
import { XYMJDWY_Player } from './XYMJDWY_Player';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { XYMJDWY_Incident } from './XYMJDWY_Incident';
import { XYMJDWY_GameData } from './XYMJDWY_GameData';
import { XYMJDWY_GameBag } from './XYMJDWY_GameBag';
const { ccclass, property } = _decorator;

@ccclass('XYMJDWY_GameManager')
export class XYMJDWY_GameManager extends Component {
    @property({ type: [AudioClip] })
    Clips: AudioClip[] = [];

    @property(Node)
    winNode: Node = null;
    @property(Node)
    lostNode: Node = null;
    @property(Label)
    valueLabel: Label = null

    public player: XYMJDWY_Player = null;

    public level: number = 1;
    //撤离时间label
    @property(Label)
    public ExtracLabel: Label = null;

    public isExtrac: boolean = false;
    public isGameOver: boolean = false;
    private timer: number = 10;

    public propLayer: number = 0;
    public propPoolMap: Map<string, any[]> = new Map();

    @property(XYMJDWY_GameBag)
    public gameBagTs: XYMJDWY_GameBag = null;

    public static Instance: XYMJDWY_GameManager = null;

    // public static get Instance(): XYMJ_GameManager {
    //     if (!XYMJ_GameManager.instance) {
    //         XYMJ_GameManager.instance = new XYMJ_GameManager();
    //     }
    //     return XYMJ_GameManager.instance;
    // }

    start() {
        // PhysicsSystem2D.instance.debugDrawFlags = 1;
        XYMJDWY_GameManager.Instance = this;
        this.initPropData();
        ProjectEventManager.emit(ProjectEvent.游戏开始);

        this.updateValue();

        director.getScene().on("校园摸金_更新战获", this.updateValue, this);
    }

    update(deltaTime: number) {
        if (!this.isExtrac) {
            return;
        }

        this.timer -= deltaTime;
        this.ExtracLabel.string = this.timer.toFixed(2).toString() + "秒后撤离";
        if (this.timer <= 0) {
            this.ExtracLabel.string = "0.00秒后撤离";

            this.isExtrac = false;

            this.win();

        }
    }

    isFirst: boolean = true;
    startValue: number = 0;
    totalValue: number = 0;
    newValue: number = 0;
    updateValue() {

        this.totalValue = 0;

        for (let i = 0; i < XYMJDWY_GameData.Instance.KnapsackData.length; i++) {
            if (XYMJDWY_GameData.Instance.KnapsackData[i].Num <= 0) {
                continue;
            }
            let propData = XYMJDWY_Constant.GetDataByName(XYMJDWY_GameData.Instance.KnapsackData[i].Name);
            let propValue = propData.value;
            let propNum = XYMJDWY_GameData.Instance.KnapsackData[i].Num;

            this.totalValue += propValue * propNum;
        }

        if (this.isFirst) {

            this.isFirst = false;
            this.startValue = this.totalValue;
            this.totalValue = 0;

            let valueStr = "当前物品价值：" + XYMJDWY_Incident.GetMaxNum(this.totalValue);
            this.valueLabel.string = valueStr;
            return;
        }

        this.newValue = this.totalValue - this.startValue;
        let valueStr = "当前物品价值：" + XYMJDWY_Incident.GetMaxNum(this.newValue);
        this.valueLabel.string = valueStr;

    }

    win() {
        ProjectEventManager.emit(ProjectEvent.游戏结束);
        XYMJDWY_GameData.Instance.GameData[1] += 50;
        this.winNode.parent.active = true;

        tween(this.winNode)
            .to(0.5, { position: v3(0, 0, 0) })
            .call(() => {
                let value = this.winNode.getChildByName("总价值");
                value.active = true;
                value.getComponent(Label).string = "撤离物品价值：" + XYMJDWY_Incident.GetMaxNum(this.newValue);

                this.winNode.parent.once(NodeEventType.TOUCH_END, () => {
                    director.loadScene("XYMJDWY_Start");
                    ProjectEventManager.emit(ProjectEvent.返回主页);
                });
            })
            .start();

    }

    lost() {
        ProjectEventManager.emit(ProjectEvent.游戏结束);

        this.lostNode.parent.active = true;

        tween(this.lostNode)
            .to(0.5, { position: v3(0, 0, 0) })
            .call(() => {
                this.lostNode.parent.once(NodeEventType.TOUCH_END, () => {
                    ProjectEventManager.emit(ProjectEvent.返回主页);
                    director.loadScene("XYMJDWY_Start");
                });

            })
            .start();
    }

    startExtrac() {
        this.timer = 10;
        this.isExtrac = true;
        this.ExtracLabel.node.active = true;
    }

    exitExtrac() {
        this.timer = 0;
        this.isExtrac = false;
        this.ExtracLabel.node.active = false;
    }

    //初始化道具数据
    initPropData() {
        for (let j = 0; j < XYMJDWY_Constant.QualityType.length; j++) {
            this.propPoolMap.set(XYMJDWY_Constant.QualityType[j], []);
        }

        for (let i = 0; i < XYMJDWY_Constant.PropData.length; i++) {
            let quality = XYMJDWY_Constant.PropData[i].quality;
            let data = XYMJDWY_Constant.PropData[i];
            if (data.type === "回收物") {
                this.propPoolMap.get(quality).push(data);
            }
        }

        console.log(this.propPoolMap);

        XYMJDWY_Incident.Loadprefab("Prefabs/场景/" + XYMJDWY_Constant.mapID).then((prefab) => {
            let mapMgr = this.node.getChildByName("Map");
            let curMap: Node = instantiate(prefab) as Node;

            curMap.parent = mapMgr;
            this.propLayer = curMap.getChildByName("撤离点").getSiblingIndex();
            let playerTs = curMap.getChildByName("Player").getComponent(XYMJDWY_Player);
            playerTs.initData();
        });

    }

}


