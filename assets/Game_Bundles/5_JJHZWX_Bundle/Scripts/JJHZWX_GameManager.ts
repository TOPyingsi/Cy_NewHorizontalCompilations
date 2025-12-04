import { _decorator, Animation, AnimationState, Component, director, EventTouch, instantiate, Node, Prefab, sp, Sprite, SpriteFrame, tween, v2, v3, Vec2, Vec3 } from 'cc';
import { JJHZWX_incident } from './JJHZWX_incident';
import { GameManager } from '../../../Scripts/GameManager';
import Banner from '../../../Scripts/Banner';
import { JJHZWX_LabyrinthPanel } from './JJHZWX_LabyrinthPanel';
import { Panel, UIManager } from '../../../Scripts/Framework/Managers/UIManager';
import { ProjectEvent, ProjectEventManager } from '../../../Scripts/Framework/Managers/ProjectEventManager';
const { ccclass, property } = _decorator;

@ccclass('JJHZWX_GameManager')
export class JJHZWX_GameManager extends Component {
    @property(Node)
    Bg: Node = null;
    @property(Node)
    UINode: Node = null;
    @property(Node)
    GameNode: Node = null;

    private static _instance: JJHZWX_GameManager = null;
    public static get Instance(): JJHZWX_GameManager {
        if (this._instance == null) {
            this._instance = new JJHZWX_GameManager();
        }
        return this._instance;
    }
    protected onLoad(): void {
        JJHZWX_GameManager._instance = this;
    }
    public static MaxScene: number = 3;//关卡数
    public static Scene: number = 0;//关卡数
    public static sceneMaxIndexArray: number[] = [8, 8, 6];
    public static scenePropPointArray: Vec3[] = [v3(-380, -90), v3(-380, -90), v3(-380, -90)];
    public sceneMaxIndex: number = 0;
    public sceneIndex: number = -1;
    public scenePropPoint: Vec3 = null;
    protected start(): void {
        ProjectEventManager.emit(ProjectEvent.游戏开始, "节奏盒子维修");
        ProjectEventManager.emit(ProjectEvent.初始化更多模式按钮, this.UINode.getChildByName("更多游戏"));
        this.sceneMaxIndex = JJHZWX_GameManager.sceneMaxIndexArray[JJHZWX_GameManager.Scene];
        this.scenePropPoint = JJHZWX_GameManager.scenePropPointArray[JJHZWX_GameManager.Scene];
        // 加载背景
        JJHZWX_incident.LoadSprite(("Scene" + JJHZWX_GameManager.Scene + "/Bg")).then((sp: SpriteFrame) => {
            this.Bg.getComponent(Sprite).spriteFrame = sp;
        })
        // 加载关卡
        JJHZWX_incident.Loadprefab(("Scene" + JJHZWX_GameManager.Scene + "/Game")).then((pre: Prefab) => {
            let nd = instantiate(pre);
            nd.setParent(this.Bg);
            this.GameNode = nd;
            this.GoGame();
        })


    }


    //开始游戏
    GoGame() {
        this.Next();

    }

    //播放动画
    AnimationPlay(id: number) {
        console.log("播放动画" + (id + 1));
        this.GameNode.getChildByName("Player").getComponent(sp.Skeleton).setAnimation(0, `${id + 1}`, false);
        this.GameNode.getChildByName("Player").getComponent(sp.Skeleton).setCompleteListener(() => {
            this.Next();
        })
    }


    //下一步
    Next() {
        this.sceneIndex++;
        if (this.sceneIndex < this.sceneMaxIndex) {
            if (this.sceneIndex == this.sceneMaxIndex - 1) {
                //进入小游戏模式
                this.GoSmallGame();
            } else {
                //道具飘过来
                this.Open_prop();
            }
        } else {
            this.scheduleOnce(() => {
                this.GameOver(true);
            }, 1)
        }

    }


    //进入小游戏
    GoSmallGame() {
        ProjectEventManager.emit(ProjectEvent.弹出窗口, "节奏盒子维修");
        //加载
        JJHZWX_incident.Loadprefab("LabyrinthPanel/寻宝界面").then((pre: Prefab) => {
            let nd = instantiate(pre);
            nd.setParent(this.Bg);
            nd.getComponent(JJHZWX_LabyrinthPanel).GameScene = JJHZWX_GameManager.Scene;
            nd.getComponent(JJHZWX_LabyrinthPanel).Init();
        })
    }

    // 弹出当前对应道具
    Open_prop() {
        console.log("弹出道具" + this.sceneIndex);
        let nd = this.GameNode.getChildByPath("操作物体/" + this.sceneIndex);
        let scale: Vec3 = nd.getScale().clone();
        nd.scale = v3(0, 0);
        tween(nd)
            .to(0, { position: this.scenePropPoint })
            .to(0.6, { scale: scale }, { easing: "backOut" })
            .start();
    }

    OnButtonClick(Touch: EventTouch) {
        switch (Touch.target.name) {
            case "返回":
                ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
                    UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {
                        ProjectEventManager.emit(ProjectEvent.返回主页, "节奏盒子维修");
                    });
                }); break;
            case "节奏盒子": director.loadScene("HHJZ_Start"); break;
            case "返回主页": director.loadScene(GameManager.StartScene); break;
            case "下一关": JJHZWX_GameManager.Scene++; director.loadScene("JJHZWX_Game"); break;
            case "再来一次": director.loadScene("JJHZWX_Game"); break;
        }

    }


    //弹出错误提示
    Open_mistakeTip() {
        let nd = this.UINode.getChildByName("错误顺序");
        nd.scale = v3(0, 0, 0)
        nd.active = true;
        tween(nd)
            .to(0.5, { scale: v3(1, 1, 1) }, { easing: "backOut" })
            .delay(1)
            .call(() => {
                nd.active = false;
            })
            .start();
    }

    //游戏结束
    GameOver(IsWinner: boolean) {
        this.UINode.getChildByName("结算界面").active = true;
        if (IsWinner == false) {//失败
            JJHZWX_incident.LoadSprite("Sprit/结算/失败").then((sp: SpriteFrame) => {
                this.UINode.getChildByPath("结算界面/框").getComponent(Sprite).spriteFrame = sp;
            })
            this.UINode.getChildByPath("结算界面/下一关").active = false;
            this.UINode.getChildByPath("结算界面/再来一次").active = true;
        } else if (JJHZWX_GameManager.MaxScene - 1 == JJHZWX_GameManager.Scene) {//最后一关
            this.UINode.getChildByPath("结算界面/下一关").active = false;
            if (Banner.IsShowServerBundle) {
                this.UINode.getChildByPath("结算界面/创意玩法").active = true;
            } else {
                this.UINode.getChildByPath("结算界面/再来一次").active = true;
            }
        }
        ProjectEventManager.emit(ProjectEvent.游戏结束, "节奏盒子维修");
    }
}


