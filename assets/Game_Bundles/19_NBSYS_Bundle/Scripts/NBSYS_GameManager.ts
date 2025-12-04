import { _decorator, Animation, AudioClip, AudioSource, Component, director, EventTouch, instantiate, Label, Node, ParticleSystem, ParticleSystem2D, PhysicsSystem2D, Prefab, Sprite, SpriteFrame, tween, UIOpacity, v2, v3, Vec2, Vec3 } from 'cc';
import { NBSYS_Incident } from './NBSYS_Incident';
import { NBSYS_GameData } from './NBSYS_GameData';
import Banner from '../../../Scripts/Banner';
import { Panel, UIManager } from '../../../Scripts/Framework/Managers/UIManager';
import { GameManager } from '../../../Scripts/GameManager';
import { NBSYS_PopUp } from './NBSYS_PopUp';
import { ProjectEvent, ProjectEventManager } from '../../../Scripts/Framework/Managers/ProjectEventManager';
const { ccclass, property } = _decorator;

@ccclass('NBSYS_GameManager')
export class NBSYS_GameManager extends Component {
    @property({ type: [AudioClip] })
    public audioClip: AudioClip[] = [];
    @property(Node)
    Bg: Node = null;
    @property(Node)
    UINode: Node = null;
    public static CentrePoint: Vec3 = v3(1200, 540, 0);
    public GameMode: string = "粉尘爆炸";
    private static _instance: NBSYS_GameManager = null;
    public static get Instance() {
        return this._instance;
    };
    protected onLoad(): void {
        NBSYS_GameManager._instance = this;
        NBSYS_GameManager.CentrePoint = v3(screen.width / 2, screen.height / 2);

    }
    start() {
        ProjectEventManager.emit(ProjectEvent.游戏开始, "NB实验室");
        ProjectEventManager.emit(ProjectEvent.初始化更多模式按钮, this.UINode.getChildByName("更多游戏"));
        // PhysicsSystem2D.instance.debugDrawFlags = 1;

        this.InitTemplate("粉尘爆炸");
    }

    OnButtonClick(btn: EventTouch) {
        switch (btn.target.name) {
            case "返回":
                ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
                    UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {
                        ProjectEventManager.emit(ProjectEvent.返回主页, "NB实验室");
                    });
                })
                break;
            case "打开实验报告":
                this.Open_Report();
                break;
            case "关闭实验报告":
                this.EXit_Report();
                break;
            case "清空":
                this.ClearAll();
                break;
            case "继续实验":
                this.UINode.getChildByName("游戏胜利").active = false;
                break;
        }

    }
    public static IsAddIcon: boolean = false;//是否添加到桌面
    //打开实验报告
    Open_Report() {
        Banner.Instance.AddShortcut();
        this.UINode.getChildByName("小手").active = false;
        this.UINode.getChildByName("实验报告").active = true;
        this.UINode.getChildByPath("实验报告/框").position = v3(0, 1500, 0)
        NBSYS_Incident.LoadSprite("Sprits/教程/" + this.GameMode).then((sp: SpriteFrame) => {
            this.UINode.getChildByPath("实验报告/框/图片").getComponent(Sprite).spriteFrame = sp;
        })
        tween(this.UINode.getChildByPath("实验报告/框"))
            .to(0.7, { position: v3(0, 0, 0) }, { easing: "backOut" })
            .start();
        this.UINode.getChildByPath("实验报告/框/标题").getComponent(Label).string = NBSYS_GameData.Template.find((dt) => { return dt.Name == this.GameMode }).Name;
        this.UINode.getChildByPath("实验报告/框/内容").getComponent(Label).string = NBSYS_GameData.Template.find((dt) => { return dt.Name == this.GameMode }).Text;

    }
    //关闭实验报告
    EXit_Report() {
        tween(this.UINode.getChildByPath("实验报告/框"))
            .to(0.7, { position: v3(0, 1500, 0) }, { easing: "backIn" })
            .call(() => {
                this.UINode.getChildByName("实验报告").active = false;
            })
            .start();
    }


    //生成粒子组
    InitParticle(name: string, worldPos: Vec3, num: number, parent: Node) {
        NBSYS_Incident.Loadprefab("PreFab/粒子").then((prefab: Prefab) => {
            NBSYS_Incident.LoadSprite("Sprits/粒子图片/" + name).then((sp: SpriteFrame) => {
                for (let i = 0; i < num; i++) {
                    let lz = instantiate(prefab);
                    lz.setParent(parent);
                    let ramdonx: number = Math.random() * 20 - 10;
                    let ramdonY: number = Math.random() * 20 - 10;
                    lz.setWorldPosition(worldPos.clone().add(v3(ramdonx, ramdonY)));
                    lz.getComponent(Sprite).spriteFrame = sp;
                }
            })
        })
    }
    //生成物体
    InitNode(Name: string, worldPos: Vec3, parent: Node) {
        NBSYS_Incident.Loadprefab("PreFab/" + Name).then((prefab: Prefab) => {
            let nd = instantiate(prefab);
            nd.setParent(parent);
            nd.setWorldPosition(worldPos);
        })

    }
    //生成模板
    InitTemplate(Name: string) {
        this.ClearAll();
        let data = NBSYS_GameData.Template.find((cd) => { return cd.Name == Name });
        data.QiCai.forEach((cd) => {
            this.InitNode(cd.Name, v3(cd.posX, cd.posY, 0), this.Bg.getChildByName(NBSYS_GameData.QiCaiData.find((dt) => { return dt.Name == cd.Name }).Layer));
        })
        this.GameMode = Name;
        this.UINode.getChildByName("标题").getComponent(Label).string = this.GameMode;
    }
    //清空界面
    ClearAll() {
        this.Bg.getChildByName("底层").removeAllChildren();
        this.Bg.getChildByName("中层").removeAllChildren();
        this.Bg.getChildByName("顶层").removeAllChildren();
    }


    //屏幕晃动特效
    Camera_Shark() {
        tween(this.Bg.parent.getChildByName("Camera"))
            .to(0.3, { angle: 35 })
            .to(0.3, { angle: -30 })
            .to(0.3, { angle: 25 })
            .to(0.3, { angle: -20 })
            .to(0.3, { angle: 15 })
            .to(0.3, { angle: -10 })
            .to(0.3, { angle: 5 })
            .to(0.3, { angle: 0 })
            .start();
        let psc = this.UINode.getChildByPath("UI效果/破碎层");
        psc.active = true;
        tween(psc.getComponent(UIOpacity))
            .to(4, { opacity: 0 })
            .start();
        NBSYS_Incident.Loadprefab("PreFab/粒子特效/爆破特效").then((pre: Prefab) => {
            let nd = instantiate(pre);
            nd.setParent(this.UINode.getChildByName("UI效果"));
            nd.setSiblingIndex(0);
        })
    }

    //播放音效
    PlayAudio(id: number) {
        this.node.getComponent(AudioSource).clip = this.audioClip[id];
        this.node.getComponent(AudioSource).play();
    }

    //弹出警告窗口
    WarningPop_up(_callback: Function, Text: string) {
        ProjectEventManager.emit(ProjectEvent.弹出窗口, "NB实验室");
        let nd = this.UINode.getChildByName("警告弹窗");
        nd.active = true;
        nd.getComponent(NBSYS_PopUp).Show(_callback, Text);
    }

    //游戏胜利
    GameWinner() {
        this.scheduleOnce(() => {
            ProjectEventManager.emit(ProjectEvent.弹出窗口, "NB实验室");
            this.UINode.getChildByName("游戏胜利").active = true;
        }, 8)
    }
}


