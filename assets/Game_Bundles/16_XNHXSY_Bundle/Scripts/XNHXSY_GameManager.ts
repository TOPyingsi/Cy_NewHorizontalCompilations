import { _decorator, Component, director, EventTouch, instantiate, Label, Node, Prefab } from 'cc';
import { XNHXSY_Incident } from './XNHXSY_Incident';
import { XNHXSY_GlassBottle } from './XNHXSY_GlassBottle';
import { XNHXSY_Beaker } from './XNHXSY_Beaker';
import Banner from '../../../Scripts/Banner';
import { Panel, UIManager } from '../../../Scripts/Framework/Managers/UIManager';
import { XNHXSY_GameData } from './XNHXSY_GameData';
import { ProjectEvent, ProjectEventManager } from '../../../Scripts/Framework/Managers/ProjectEventManager';
import { GameManager } from '../../../Scripts/GameManager';
const { ccclass, property } = _decorator;

@ccclass('XNHXSY_GameManager')
export class XNHXSY_GameManager extends Component {
    @property(Node)
    public GameNode: Node = null;
    @property(Node)
    public UINode: Node = null;

    public Beaker: XNHXSY_Beaker = null;//烧杯

    public GameOver: boolean = false;//游戏胜利
    public static GameScene: number = 0;//游戏关卡
    public static MaterialsNumber: number = 12;//材料数量
    private static _instance: XNHXSY_GameManager = null;
    public courseIndex: number = 0;//教程进度
    public static get Instance() {
        return this._instance;
    };
    protected onLoad(): void {
        XNHXSY_GameManager._instance = this;

    }
    public TargetText: string[] = [
        "使用以下物体合成二氧化碳",
        "使用以下物体合成硫酸",
        "使用以下物体合成Asl3",
        "使用以下物体合成氧化锂",
        "使用以下物体合成氟化氢",
        "使用以下物体合成二氟化钯",
        "使用以下物体合成氢氧化钙",
        "使用以下物体合成氢化钾",
    ];
    public Target: string[] = [
        "二氧化碳",
        "硫酸",
        "Asl3",
        "氧化锂",
        "氟化氢",
        "二氟化钯",
        "氢氧化钙",
        "氢化钾"
    ]

    start() {
        ProjectEventManager.emit(ProjectEvent.游戏开始, "虚拟化学实验");
        ProjectEventManager.emit(ProjectEvent.初始化更多模式按钮, this.UINode.getChildByName("更多模式"));
        this.Beaker = this.GameNode.getChildByName("烧杯").getComponent(XNHXSY_Beaker);
        this.InitData();
        if (XNHXSY_GameManager.GameScene == 0) {
            this.UINode.getChildByName("小手0").active = true;
        }
    }
    //初始化游戏数据
    InitData() {
        this.UINode.getChildByName("关卡目标").getComponent(Label).string = this.TargetText[XNHXSY_GameManager.GameScene];
        //初始化材料
        XNHXSY_Incident.Loadprefab("Prefab/物体瓶").then((prefab: Prefab) => {
            for (let i = 0; i < XNHXSY_GameManager.MaterialsNumber; i++) {
                let nd = instantiate(prefab);
                nd.setParent(this.GameNode.getChildByName("材料区"));
                nd.getComponent(XNHXSY_GlassBottle).ID = i;
                nd.getComponent(XNHXSY_GlassBottle).Init();
                nd.getComponent(XNHXSY_GlassBottle).TargetNode = this.GameNode.getChildByName("烧杯");
            }
        })


    }



    //判断当前烧杯内容是否满足任务
    IsReaction() {
        if (this.GameOver) return;
        if (this.Beaker.ReactionData.indexOf(this.Target[XNHXSY_GameManager.GameScene]) != -1) {//胜利
            this.scheduleOnce(() => {
                this.UINode.getChildByName("实验成功界面").active = true;
                if (XNHXSY_GameManager.GameScene == 7) {
                    this.UINode.getChildByPath("实验成功界面/重新开始").active = true;
                }
                ProjectEventManager.emit(ProjectEvent.游戏结束, "虚拟化学实验");
            }, 1)
            this.GameOver = true;
        }
    }

    //返回按钮点击
    ReMain() {
        ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
            UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {
                ProjectEventManager.emit(ProjectEvent.返回主页, "虚拟化学实验室");
            });
        });
    }


    //弹出提示
    OpenTip(Text: string) {
        let msk = this.UINode.getChildByName("描述框");
        msk.getChildByPath("描述文本").getComponent(Label).string = Text;
        msk.active = true;
    }


    //按钮事件
    OnButtonClick(target: EventTouch) {
        switch (target.target.name) {
            case "下一关":
                if (XNHXSY_GameManager.GameScene < 7) {
                    XNHXSY_GameManager.GameScene++;
                }
                director.loadScene("XNHXSY_Game");
                break;
            case "重新开始":
                director.loadScene("XNHXSY_Game");
                break;
            case "返回主页":
                this.ReMain();
                break;
            case "关闭描述框":
                this.UINode.getChildByName("描述框").active = false;
                if (XNHXSY_GameManager.Instance.courseIndex == 1) {
                    XNHXSY_GameManager.Instance.UINode.getChildByName("小手0").active = false;
                    XNHXSY_GameManager.Instance.UINode.getChildByName("小手1").active = true;
                    XNHXSY_GameManager.Instance.courseIndex = 2;
                }
                break;
            case "清除":
                this.Beaker.ReStart();
                break;
            case "问号":
                Banner.Instance.ShowVideoAd(() => {
                    this.OpenTip(XNHXSY_GameData.GetCompoundDataText(XNHXSY_GameData.CompoundData[XNHXSY_GameManager.GameScene]));
                });
                break;

        }
    }

}


