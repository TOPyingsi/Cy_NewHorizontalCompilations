import { _decorator, Component, director, Event, find, instantiate, Label, Node, Prefab, sys, tween, v3, Vec3 } from 'cc';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
import { CCWSS_PeopleCard } from './CCWSS_PeopleCard';
import { CCWSS_SelectPanel, SelectMode } from './CCWSS_SelectPanel';
import { CCWSS_Constant } from './CCWSS_Constant';
import { CCWSS_TipLabel } from './CCWSS_TipLabel';
import { CCWSS_PeopleSelect } from './CCWSS_PeopleSelect';
import { CCWSS_AudioManager } from './CCWSS_AudioManager';
import { CCWSS_FinishPanel } from './CCWSS_FinishPanel';
import { GameManager } from '../../../Scripts/GameManager';
import Banner from '../../../Scripts/Banner';
import { Tools } from '../../../Scripts/Framework/Utils/Tools';
import { ProjectEvent, ProjectEventManager } from '../../../Scripts/Framework/Managers/ProjectEventManager';
const { ccclass, property } = _decorator;

@ccclass('CCWSS_UIManager')
export class CCWSS_UIManager extends Component {

    private static _instance: CCWSS_UIManager = null;
    public static get Instance(): CCWSS_UIManager {
        if (this._instance == null) {
            this._instance = new CCWSS_UIManager();
        }
        return this._instance;
    }

    @property(Node)
    mainCamera: Node = null;
    @property(Node)
    Me: Node = null;
    @property(Node)
    AI: Node = null;
    @property(Node)
    MeScore: Node = null;
    @property(Node)
    AIScore: Node = null;
    @property(Node)
    GameUI: Node = null;
    @property(Node)
    SelectPanel: Node = null;
    @property(Node)
    GuessPanel: Node = null;
    @property(Node)
    AskPanel: Node = null;
    @property(Node)
    TeZhengPanel: Node = null;
    @property(Node)
    QuestionPanel: Node = null;
    @property(Node)
    RecordPanel: Node = null;
    @property(Node)
    FinishPanel: Node = null;
    @property(Node)
    HelpPanel: Node = null;

    CameraStartPoint: Node = null;
    CameraEndPoint: Node = null;

    protected onLoad(): void {
        CCWSS_UIManager._instance = this;
        this.CameraStartPoint = find("GameScene/CameraStartPoint");
        this.CameraEndPoint = find("GameScene/CameraEndPoint");
        CCWSS_Constant.InitData();
    }

    start() {
        ProjectEventManager.emit(ProjectEvent.游戏开始, "猜猜我是谁");
        ProjectEventManager.emit(ProjectEvent.初始化更多模式按钮, find("Canvas/GameUI/更多模式"));
        tween(this.mainCamera)
            .to(2, { position: this.CameraStartPoint.position, eulerAngles: this.CameraStartPoint.eulerAngles })
            .call(() => {
                this.ShowPanel(this.SelectPanel);
            })
            .start()
    }

    //选择性的翻倒或竖立己方的卡牌
    SelectMePeopleCard() {
        for (let i of this.SelectPanel.getChildByName("Content").children) {
            let card = this.Me.getChildByName("CardBase").children[i.getSiblingIndex()];
            if (i.getComponent(CCWSS_PeopleSelect).IsPass) {
                card.getComponent(CCWSS_PeopleCard).Pass();
            }
            else {
                card.getComponent(CCWSS_PeopleCard).NoPass();
            }
        }
        if (CCWSS_SelectPanel.Instance.selectMode == SelectMode.AskSelect) {
            this.GameUI.active = false;
            this.scheduleOnce(() => {
                CCWSS_Constant.MeRound = false;
                this.UpdateScore();
            }, 1)
        }
    }

    //选择性的翻倒或竖立对方的卡牌
    SelectAIPeopleCard() {
        this.GameUI.active = false;
        for (let i of this.AI.getChildByName("CardBase").children) {
            if (CCWSS_Constant.PeopleTeZheng[i.getSiblingIndex()][CCWSS_Constant.Question[0]][CCWSS_Constant.Question[1]]
                != CCWSS_Constant.PeopleTeZheng[CCWSS_Constant.MeSelectIndex][CCWSS_Constant.Question[0]][CCWSS_Constant.Question[1]]) {

                i.getComponent(CCWSS_PeopleCard).Pass();
            }
        }
        this.scheduleOnce(() => {
            CCWSS_Constant.MeRound = true;
            this.UpdateScore(false);
        }, 1)
    }

    //添加提问记录
    AddRecordItem(ask: string, say: string) {
        BundleManager.GetBundle("7_CCWSS_Bundle").load("Prefabs/RecordItem", Prefab, (err, pre) => {
            if (err) console.log(err);
            let record = instantiate(pre)
            record.setParent(this.RecordPanel.getChildByPath("ScrollView/view/content"));
            record.getComponentInChildren(Label).string = "（" + (record.getSiblingIndex() + 1) + "）" + ask + "          " + say;
        })
    }

    //移动摄像机视角至椅子上
    MoveCameraToChair() {
        tween(this.mainCamera)
            .to(3, { position: this.CameraEndPoint.position, eulerAngles: this.CameraEndPoint.eulerAngles })
            .call(() => {
                this.ShowTipLabel(["游戏开始", "你拿到了先手，你先询问"], () => {
                    CCWSS_Constant.MeRound = true;
                    this.UpdateScore(false);
                    if (Banner.RegionMask) Banner.Instance.ShowCustomAd();
                });
            })
            .start()
        this.Me.getChildByName("GuessCard").getComponent(CCWSS_PeopleCard).InitGuessCard(CCWSS_Constant.MeSelectIndex);
        CCWSS_Constant.AISelectIndex = Tools.GetRandomIntWithMax(0, 23);
        this.AI.getChildByName("GuessCard").getComponent(CCWSS_PeopleCard).InitGuessCard(CCWSS_Constant.AISelectIndex);
        for (let i in CCWSS_Constant.PeopleTeZheng[CCWSS_Constant.AISelectIndex]) {
            for (let j in CCWSS_Constant.PeopleTeZheng[CCWSS_Constant.AISelectIndex][i]) {
                if (CCWSS_Constant.PeopleTeZheng[CCWSS_Constant.AISelectIndex][i][j] == 0) {
                    CCWSS_Constant.SpliceHelpDesc.push(CCWSS_Constant.HelpDesc[i][j]);
                }
            }
        }
    }

    ShowTipLabel(str: string[], cb: Function) {
        BundleManager.GetBundle("7_CCWSS_Bundle").load("Prefabs/TipLabel", Prefab, (err, pre) => {
            if (err) console.log(err);
            let tiplabel = instantiate(pre)
            tiplabel.setParent(find("Canvas"));
            tiplabel.getComponent(CCWSS_TipLabel).Init(str, cb);
        })
    }

    ShowPanel(panel: Node) {
        panel.setScale(Vec3.ONE);
        panel.active = true;
        tween(panel)
            .to(0.15, { scale: v3(1.1, 1.1, 1) })
            .to(0.1, { scale: Vec3.ONE })
            .start();
    }


    //更新剩余人物数量
    UpdateScore(needAsk: boolean = true) {
        if (CCWSS_Constant.MeRound) {
            this.AIScore.getChildByName("Select").active = false;
            this.MeScore.getChildByName("Select").active = true;
        }
        else {
            this.MeScore.getChildByName("Select").active = false;
            this.AIScore.getChildByName("Select").active = true;
        }

        CCWSS_Constant.MeCardNum = CCWSS_Constant.AICardNum = 24;
        for (let i of this.Me.getChildByName("CardBase").children) {
            if (i.getComponent(CCWSS_PeopleCard).IsPass) CCWSS_Constant.MeCardNum--;
        }
        for (let i of this.AI.getChildByName("CardBase").children) {
            if (i.getComponent(CCWSS_PeopleCard).IsPass) CCWSS_Constant.AICardNum--;
        }
        this.MeScore.getChildByName("Score").getComponent(Label).string = CCWSS_Constant.MeCardNum + " / 24";
        this.AIScore.getChildByName("Score").getComponent(Label).string = CCWSS_Constant.AICardNum + " / 24";
        this.GameUI.active = true;

        if (CCWSS_Constant.AICardNum <= 1) {
            this.FinishPanel.getComponent(CCWSS_FinishPanel).Show(false);
        }
        else {
            if (needAsk) this.ShowPanel(this.AskPanel);
        }
    }

    ButtonClick(event: Event) {
        CCWSS_AudioManager.AudioClipPlay("button");
        switch (event.target.name) {
            case "ReturnBtn":
                {
                    ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
                        director.loadScene(GameManager.StartScene);
                    })
                }
                break;
            case "AskBtn"://询问
                {
                    ProjectEventManager.emit(ProjectEvent.弹出窗口, "猜猜我是谁");
                    this.ShowPanel(this.TeZhengPanel);
                }
                break;
            case "YesBtn"://解决
                {
                    ProjectEventManager.emit(ProjectEvent.弹出窗口, "猜猜我是谁");
                    CCWSS_SelectPanel.Instance.selectMode = SelectMode.GuessSelect;
                    this.ShowPanel(this.SelectPanel);
                }
                break;
            case "RecordBtn"://提问记录
                {
                    ProjectEventManager.emit(ProjectEvent.弹出窗口, "猜猜我是谁");
                    this.ShowPanel(this.RecordPanel);
                }
                break;
            case "LookBtn"://查看
                {
                    ProjectEventManager.emit(ProjectEvent.弹出窗口, "猜猜我是谁");
                    CCWSS_SelectPanel.Instance.selectMode = SelectMode.LookSelect;
                    this.ShowPanel(this.SelectPanel);
                }
                break;
            case "HelpBtn"://帮助
                {
                    ProjectEventManager.emit(ProjectEvent.弹出窗口, "猜猜我是谁");
                    this.ShowPanel(this.HelpPanel);
                }
                break;
        }
    }
}


