import { _decorator, AudioSource, Component, director, EventTouch, find, instantiate, Label, Node, Prefab } from 'cc';
import { XYRZZ_Panel, XYRZZ_UIManager } from '../XYRZZ_UIManager';
import { XYRZZ_Constant } from '../Data/XYRZZ_Constant';
import { XYRZZ_EventManager, XYRZZ_MyEvent } from '../XYRZZ_EventManager';
import { XYRZZ_Incident } from '../XYRZZ_Incident';
import { XYRZZ_GameData } from '../XYRZZ_GameData';
import { XYRZZ_MainPlayer } from '../XYRZZ_MainPlayer';
import { XYRZZ_TweenMoney } from '../XYRZZ_TweenMoney';
import { XYRZZ_PoolManager } from '../Utils/XYRZZ_PoolManager';
import { XYRZZ_AudioManager } from '../XYRZZ_AudioManager';
import { GameManager } from '../../../../Scripts/GameManager';
import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { Constant } from 'db://assets/Scripts/Framework/Const/Constant';
import { ProjectEvent, ProjectEventManager } from '../../../../Scripts/Framework/Managers/ProjectEventManager';

const { ccclass, property } = _decorator;

@ccclass('XYRZZ_GameManager')
export class XYRZZ_GameManager extends Component {
    @property(Node)
    Game: Node = null;
    @property(Node)
    UI: Node = null;
    @property(Node)
    BeginnerGuidance: Node = null;
    public OncePrice: number = 0;//单次点击收益
    public Power: number = 0;//战力
    public AutomationTime: number = 0;//自动点击剩余时间

    private static _instance: XYRZZ_GameManager = null;
    public static get Instance(): XYRZZ_GameManager {
        if (this._instance == null) {
            this._instance = new XYRZZ_GameManager();
        }
        return this._instance;
    }
    protected onLoad(): void {
        XYRZZ_GameManager._instance = this;
        if (!XYRZZ_AudioManager.AudioSource) {
            XYRZZ_AudioManager.AudioSource = new Node().addComponent(AudioSource);
            XYRZZ_AudioManager.Init();
        }
    }
    start() {
        ProjectEventManager.emit(ProjectEvent.游戏开始, "小鱼人战争");
        ProjectEventManager.emit(ProjectEvent.初始化更多模式按钮, this.UI.getChildByName("更多游戏"));
        XYRZZ_EventManager.on(XYRZZ_MyEvent.ChanggeMoney, this.MoneyUIShow, this);
        this.Calculate_OncePrice();
        this.Calculate_Power();
        this.OtherUIShow();
        this.SetMainPlayer();
        this.ChanggeSceneBg();
        XYRZZ_EventManager.on(XYRZZ_MyEvent.角色升级, () => { this.Calculate_Power(); this.Calculate_OncePrice(); })
        XYRZZ_EventManager.on(XYRZZ_MyEvent.改变战力, () => { this.Calculate_Power(); })
        XYRZZ_EventManager.on(XYRZZ_MyEvent.改变单次收益, () => { this.Calculate_OncePrice(); })
        XYRZZ_EventManager.on(XYRZZ_MyEvent.场景变化, () => { this.ChanggeSceneBg(); })
        this.schedule(() => {
            this._1000secondUpdate();
        }, 1)
        this.schedule(() => {
            this._300secondUpdate();
        }, 0.3)
        this.schedule(() => {
            //生成宝箱
            XYRZZ_Incident.Loadprefab("Prefabs/天降宝箱").then((prefab: Prefab) => {
                let pre = instantiate(prefab);
                pre.setParent(find("Canvas"));
            })
        }, 180)
        this.schedule(() => {
            XYRZZ_GameData.DateSave();
        }, 5)
        if (XYRZZ_GameData.Instance.GameData[6] == 0) {
            console.log("弹出新手教程");
            this.BeginnerGuidance.active = true;
        }
    }

    //每秒触发
    _1000secondUpdate() {
        if (this.AutomationTime > 0) {
            this.UI.getChildByPath("Right/自动/时间").active = true;
            this.UI.getChildByPath("Right/自动/时间").getComponent(Label).string = `` + this.AutomationTime;
            this.AutomationTime -= 1;
        } else {
            this.UI.getChildByPath("Right/自动/时间").active = false;
        }
        //蚌的收益
        if (XYRZZ_GameData.Instance.PropData[0].Level > 0) {
            this.LoadTweenMonney();
        }
    }
    //每0.3秒触发
    _300secondUpdate() {
        if (this.AutomationTime > 0) {
            this.LoadTweenMonney();
        }

    }
    update(deltaTime: number) {


    }


    //按钮事件
    OnbuttonClick(btn: EventTouch) {
        XYRZZ_AudioManager.globalAudioPlay("鼠标嘟");
        switch (btn.target.name) {
            case "人物":
                ProjectEventManager.emit(ProjectEvent.弹出窗口, "小鱼人战争");
                XYRZZ_UIManager.Instance.ShowPanel(XYRZZ_Panel.XYRZZ_FigurePanel);
                break;
            case "鱼竿":
                ProjectEventManager.emit(ProjectEvent.弹出窗口, "小鱼人战争");
                XYRZZ_UIManager.Instance.ShowPanel(XYRZZ_Panel.XYRZZ_FishingRodPanel);
                break;
            case "钓法":
                ProjectEventManager.emit(ProjectEvent.弹出窗口, "小鱼人战争");
                XYRZZ_UIManager.Instance.ShowPanel(XYRZZ_Panel.XYRZZ_FishingPanel);
                break;
            case "鱼类图鉴":
                ProjectEventManager.emit(ProjectEvent.弹出窗口, "小鱼人战争");
                XYRZZ_UIManager.Instance.ShowPanel(XYRZZ_Panel.XYRZZ_Handbook);
                break;
            case "连点器":
                ProjectEventManager.emit(ProjectEvent.弹出窗口, "小鱼人战争");
                XYRZZ_UIManager.Instance.ShowPanel(XYRZZ_Panel.XYRZZ_ConnectorPanel);
                break;
            case "自动":
                ProjectEventManager.emit(ProjectEvent.弹出窗口, "小鱼人战争");
                XYRZZ_UIManager.Instance.ShowPanel(XYRZZ_Panel.XYRZZ_AutomationPanel);
                break;
            case "升级":
                ProjectEventManager.emit(ProjectEvent.弹出窗口, "小鱼人战争");
                XYRZZ_UIManager.Instance.ShowPanel(XYRZZ_Panel.XYRZZ_UpLevelPanel);
                break;
            case "存档":
                XYRZZ_GameData.DateSave();
                break;
            case "背包":
                ProjectEventManager.emit(ProjectEvent.弹出窗口, "小鱼人战争");
                XYRZZ_UIManager.Instance.ShowPanel(XYRZZ_Panel.XYRZZ_KnapsackPanel);
                break;
            case "新手礼包":
                ProjectEventManager.emit(ProjectEvent.弹出窗口, "小鱼人战争");
                XYRZZ_UIManager.Instance.ShowPanel(XYRZZ_Panel.XYRZZ_NoviciatePanel);
                break;
            case "任务":
                ProjectEventManager.emit(ProjectEvent.弹出窗口, "小鱼人战争");
                XYRZZ_UIManager.Instance.ShowPanel(XYRZZ_Panel.XYRZZ_TaskPanel);
                break;
            case "全道具等级+1":
                XYRZZ_GameData.Instance.PropData.forEach((data, index) => {
                    this.ADD_Prop(index, 1);
                })
                break;
            case "全道具等级-1":
                XYRZZ_GameData.Instance.PropData.forEach((data, index) => {
                    this.ADD_Prop(index, -1);
                })
                break;
            case "钓鱼":
                ProjectEventManager.emit(ProjectEvent.弹出窗口, "小鱼人战争");
                XYRZZ_UIManager.Instance.ShowPanel(XYRZZ_Panel.XYRZZ_SelectScenePanel);
                break;
            case "返回主页":
                ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
                    UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {
                        ProjectEventManager.emit(ProjectEvent.返回主页, "小鱼人战争");
                    });
                });
                break;
        }

    }


    //刷新顶部数据
    public MoneyUIShow() {
        this.UI.getChildByPath("Top/顶部信息/单次数据").getComponent(Label).string = XYRZZ_Incident.GetMaxNum(this.OncePrice);
        this.UI.getChildByPath("Top/顶部信息/总数据").getComponent(Label).string = XYRZZ_Incident.GetMaxNum(XYRZZ_GameData.Instance.Money);
        this.UI.getChildByPath("Top/拉力/Label").getComponent(Label).string = XYRZZ_Incident.GetMaxNum(this.Power);
        let Lv = XYRZZ_GameData.Instance.GameData[2];
        this.UI.getChildByPath("Top/等级和称号/文本").getComponent(Label).string = `LV.${Lv}    ${XYRZZ_Constant.GetTitleOfLevel(Lv)}`;
    }
    //刷新其他数据
    public OtherUIShow() {
        this.UI.getChildByPath("Right/连点器/倍率").getComponent(Label).string = `X` + XYRZZ_GameData.Instance.GameData[3];

    }

    //计算单次收益
    //收益= 主角等级的二次方乘以2 + BUFF增益
    public Calculate_OncePrice() {
        this.OncePrice = this.GetOncePrice(XYRZZ_GameData.Instance.GameData[2]);
        this.MoneyUIShow();
    }
    //计算战力
    public Calculate_Power() {
        let num: number = 0;
        num += Math.pow(XYRZZ_GameData.Instance.GameData[2], 2) * 100;//主角等级影响(等级平方*100)
        //计算钓法战力
        XYRZZ_GameData.Instance.FishingPoleDataLevel.forEach((cd, index) => {
            num += cd.Level * cd.Level * XYRZZ_Constant.FishingPoleData[index].Power;
        })
        //计算鱼竿战力
        XYRZZ_GameData.Instance.FishingPoleLevel.forEach((cd, index) => {
            num += cd.Level * cd.Level * XYRZZ_Constant.FishingPole[index].Power;
        })
        this.Power = num;
        this.MoneyUIShow();
    }
    //返回收益BUFF的加仓(装备)返回的是百分比数
    public GetBUFFadd(): number {
        let num: number = 0;
        XYRZZ_GameData.Instance.PropData.forEach((data, index) => {
            num += data.Level * XYRZZ_Constant.PropData[index].MoneyBuff;
        })
        return num;
    }
    //返回每秒收益
    public GetOncePrice(Level: number): number {
        let num: number = 0;
        num += Math.pow(Level, 2) * 2;//主角等级影响
        num *= 1 + this.GetBUFFadd() / 100;
        num = Math.floor(num);
        return num;
    }

    //设置主页人物和鱼竿
    public SetMainPlayer() {
        this.Game.getChildByPath("MainPlayer").getComponent(XYRZZ_MainPlayer).ChanggeShenti(XYRZZ_GameData.Instance.GameData[0]);
        this.Game.getChildByPath("MainPlayer").getComponent(XYRZZ_MainPlayer).ChanggeYuGane(XYRZZ_GameData.Instance.GameData[1]);
    }




    //生成一张钞票飞向顶部
    public LoadTweenMonney() {
        XYRZZ_Incident.Loadprefab("Prefabs/钞票").then((pre: Prefab) => {
            let money = XYRZZ_PoolManager.Instance.GetNode(pre, this.UI);
            money.getComponent(XYRZZ_TweenMoney).Show(this.Game.getChildByPath("MainPlayer/钓鱼点").worldPosition,
                this.UI.getChildByPath("Top/顶部信息/总数据").worldPosition, () => {
                    //获得单次收益
                    XYRZZ_GameData.Instance.Money += this.OncePrice * XYRZZ_GameData.Instance.GameData[3];
                });
        })
    }

    //增加道具
    ADD_Prop(id: number, num: number) {
        XYRZZ_GameData.Instance.PropData[id].Level += num;
        XYRZZ_EventManager.Scene.emit(XYRZZ_MyEvent.道具数量修改, id, num);
        if (id < 5) {//id0-4的道具获得会刷新主场景背景
            XYRZZ_EventManager.Scene.emit(XYRZZ_MyEvent.场景变化);
        }
    }

    //场景变化
    ChanggeSceneBg() {
        if (XYRZZ_GameData.Instance.PropData[0].Level > 0) {
            this.Game.getChildByName("珍珠贝壳").active = true;
        }
        if (XYRZZ_GameData.Instance.PropData[1].Level > 0) {
            this.Game.getChildByName("招财橘猫").active = true;
        }
        if (XYRZZ_GameData.Instance.PropData[2].Level > 0) {
            this.Game.getChildByName("帐篷").active = true;
        }
        if (XYRZZ_GameData.Instance.PropData[3].Level > 0) {
            this.Game.getChildByName("钓具箱").active = true;
        }
        if (XYRZZ_GameData.Instance.PropData[4].Level > 0) {
            this.Game.getChildByName("渔船").active = true;
        }
    }
}


