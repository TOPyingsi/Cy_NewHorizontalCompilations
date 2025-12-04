import { _decorator, Animation, AnimationClip, AnimationState, AudioClip, AudioSource, Component, director, EventTouch, game, instantiate, Label, Node, Prefab, Sprite, SpriteFrame, tween, v3 } from 'cc';
import { MFXR_Incident } from './MFXR_Incident';
import { MFXR_Constant } from './MFXR_Constant';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
import { ProjectEvent, ProjectEventManager } from '../../../Scripts/Framework/Managers/ProjectEventManager';
import { Panel, UIManager } from '../../../Scripts/Framework/Managers/UIManager';
import { GameManager } from '../../../Scripts/GameManager';
const { ccclass, property } = _decorator;

@ccclass('MFXR_GameManager')
export class MFXR_GameManager extends Component {
    @property(Node)
    Player: Node = null;
    @property(AudioSource)
    audioSource: AudioSource = null;
    @property(Node)
    GameNode: Node = null;
    @property(Node)
    UINode: Node = null;
    private static _instance: MFXR_GameManager = null;
    public static get Instance() {
        return this._instance;
    };
    protected onLoad(): void {
        MFXR_GameManager._instance = this;

    }
    public static GameScene: number = 0;
    GameMaxGradeList: number[] = [80, 100, 120, 140, 160];
    GameMaxGrade: number = 0;//关卡最大分数
    GameGrade: number = 0;//当前分数
    satiety: number = 0;//饱腹感
    satietyinvincibleTime: number = 5;//饱腹感无敌时间
    MaxtapasList: number[] = [15, 10, 10, 8, 6];//小菜最大使用次数
    Maxtaps: number = 0;//小菜最大使用次数
    tapas: number = 0;//小菜剩余多少口
    CourttrialNumber: number = 3;//剩余庭审次数

    public GameStar: boolean = false;//游戏是否开始
    riceNode: Node = null;
    public GameTime: number = 40;//剩余时间
    public GameOver: boolean = false;//游戏结束
    public GamePause: boolean = false;//游戏暂停
    public IsJiaoCheng: boolean = false;//是否教程界面

    ManTouDeBuffTime: number = 0;//馒头debuff
    protected start(): void {
        ProjectEventManager.emit(ProjectEvent.游戏开始, "米饭仙人");
        ProjectEventManager.emit(ProjectEvent.初始化更多模式按钮, this.UINode.getChildByName("创意玩法"));
        this.GameMaxGrade = this.GameMaxGradeList[MFXR_GameManager.GameScene];
        this.Maxtaps = this.MaxtapasList[MFXR_GameManager.GameScene];
        this.tapas = this.Maxtaps;
        this.Init();
        tween(this.Player)
            .to(0.5, { scale: v3(1, 0.97, 1) })
            .to(0.5, { scale: v3(1, 1, 1) })
            .union().repeatForever().start();
        tween(this.UINode.getChildByName("开局提示"))
            .to(0.5, { scale: v3(1.2, 1.2, 1) })
            .to(0.5, { scale: v3(1, 1, 1) })
            .union().repeat(3).
            call(() => { this.UINode.getChildByName("开局提示").active = false; }).start();
    }

    public FaceState: number = 0;//脸部状态
    @property(Sprite)
    satietyprogressbar: Sprite = null;//饱腹感进度条
    @property(Label)
    TImeLabel: Label = null;//时间文本
    protected update(dt: number): void {
        if (this.satietyinvincibleTime >= 0) {
            this.satietyinvincibleTime -= dt;
        }
        this.ManTouDeBuffTime -= dt;
        if (this.satiety > 0 && this.ManTouDeBuffTime <= 0) {
            this.satiety -= dt * 2;
        }
        if (this.GamePause == false && this.GameOver == false) {
            this.GameTime -= dt;
            this.TImeLabel.string = this.GameTime.toFixed(0).toString();
            if (this.GameTime <= 0) {
                this.gameOver(false, "超时了！");
            }
        }
        this.satietyprogressbar.fillRange = this.satiety / 100;
        if (this.satiety < 70 && this.FaceState == 1) {
            this.FaceState = 0;
            this.ChanggeFace();
        }
        if (this.satiety > 70 && this.FaceState == 0) {
            this.FaceState = 1;
            this.ChanggeFace();
        }

        if (this.GameStar && !this.Player.getComponent(Animation).getState("夹饭").isPlaying && !this.Player.getComponent(Animation).getState("咀嚼").isPlaying) {
            this.Player.getComponent(Animation).play("咀嚼");
        }
    }

    Init() {
        //初始化米饭
        MFXR_Incident.Loadprefab("Res/米饭/" + MFXR_GameManager.GameScene).then((pre: Prefab) => {
            this.riceNode = instantiate(pre);
            this.riceNode.setParent(this.GameNode.getChildByName("桌面"));
            this.riceNode.setPosition(v3(0, 0, 0));
            this.SetXiaoCaiPos();
        })
        //初始化小菜
        MFXR_Incident.LoadSprite("小菜/" + MFXR_GameManager.GameScene).then((sp: SpriteFrame) => {
            this.GameNode.getChildByName("小菜").getComponent(Sprite).spriteFrame = sp;
        })
    }

    OnButtonClick(Event: EventTouch) {
        switch (Event.target.name) {
            case "触碰区":
                this.OneatRrice();
                break;
            case "吃小菜":
                this.OnXiaoCaiClick();
                break;
            case "退出":
                ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
                    UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {
                        ProjectEventManager.emit(ProjectEvent.返回主页, "米饭仙人");
                    });
                });
                break;
            case "返回主页":
                director.loadScene("MFXR_Start");
                break;
            case "重玩":
                director.loadScene(director.getScene().name);
                break;
            case "暂停":
                ProjectEventManager.emit(ProjectEvent.弹出窗口, "米饭仙人");
                this.UINode.getChildByName("暂停界面").active = true;
                this.UINode.getChildByPath("暂停界面/框").position = v3(0, 1500, 0);
                tween(this.UINode.getChildByPath("暂停界面/框"))
                    .to(0.5, { position: v3(0, 0, 0) }, { easing: "backOut" }).start();
                break;
            case "继续游戏":
                tween(this.UINode.getChildByPath("暂停界面/框"))
                    .to(0.5, { position: v3(0, 1500, 0) }, { easing: "backIn" })
                    .call(() => { this.UINode.getChildByName("暂停界面").active = false; }).start();
                break;
            case "下一关":
                MFXR_GameManager.GameScene++;
                director.loadScene(director.getScene().name);
                break;
            case "答案框0":
            case "答案框1":
            case "答案框2":
                this.RamdonGameNumber = 3;
                this.GoRamDomGame();
                break;
            case "教程":
                ProjectEventManager.emit(ProjectEvent.弹出窗口, "米饭仙人");
                this.GamePause = true;
                this.IsJiaoCheng = true;
                this.UINode.getChildByName("教程界面").active = true;
                break;
            case "教程Bg":
                this.GamePause = false;
                this.IsJiaoCheng = false;
                this.UINode.getChildByName("教程界面").active = false;
                break;
            case "小菜图鉴":
                ProjectEventManager.emit(ProjectEvent.弹出窗口, "米饭仙人");
                this.UINode.getChildByName("小菜图鉴").active = true;
                break;
            case "关闭小菜图鉴":
                this.UINode.getChildByName("小菜图鉴").active = false;
                break;

        }

    }

    //修改脸部状态
    ChanggeFace() {
        MFXR_Incident.LoadSprite("角色/头" + this.FaceState).then((sp: SpriteFrame) => {
            this.GameNode.getChildByPath("人/头").getComponent(Sprite).spriteFrame = sp;
        })
        MFXR_Incident.LoadSprite("角色/眼睛" + this.FaceState).then((sp: SpriteFrame) => {
            this.GameNode.getChildByPath("人/头/眼睛").getComponent(Sprite).spriteFrame = sp;
        })
        this.GameNode.getChildByPath("人/头/汗").active = this.FaceState == 1;
    }

    Riceindex: number = 0;//进度到4消除一个饭团
    //点击吃饭
    OneatRrice() {
        if (this.GameOver || this.GamePause) {
            return;
        }
        if (this.GameGrade == 0) {//第一次点击吃饭
            this.GameStar = true;
            this.UINode.getChildByName("点按任意键吃饭").active = false;
        }
        this.GameGrade++;
        this.Riceindex++;
        if (this.Riceindex == 4) {
            this.Riceindex = 0;
            if (this.riceNode.children.length > 0) {
                this.riceNode.children[this.riceNode.children.length - 1].destroy();
                this.SetXiaoCaiPos();
            }
        }
        if (this.satietyinvincibleTime <= 0) {
            this.satiety += 6;//饱腹感+6
            if (this.satiety >= 100) {
                this.satiety = 0;
                this.GoCourttrial();
            }
        }
        if (!this.Player.getComponent(Animation).getState("夹饭").isPlaying) {
            this.Player.getComponent(Animation).play("夹饭");
            this.AudioPlay("咀嚼");
        }
        if (this.GameGrade == this.GameMaxGrade) {
            //胜利
            this.gameOver(true, "胜利");
        }
    }

    //点击吃小菜
    OnXiaoCaiClick() {
        if (this.IsJiaoCheng) {//教程界面点击小菜没有反应
            return;
        }
        this.AudioPlay("吃小菜");
        this.tapas--;
        if (this.satietyinvincibleTime < 2) {
            this.satietyinvincibleTime = 2;
        }
        if (MFXR_GameManager.GameScene == 0) {
            this.satiety -= 10;
        }
        if (MFXR_GameManager.GameScene == 1) {
            this.satiety -= 5;
        }
        if (MFXR_GameManager.GameScene == 4) {
            this.ManTouDeBuffTime = 6;
        }
        this.GameNode.getChildByName("小菜").getComponent(Sprite).fillRange = this.tapas / this.Maxtaps;
        if (this.tapas == 0) {
            this.UINode.getChildByName("吃小菜").active = false;
        }
    }

    //游戏结束
    public gameOver(isWinner: boolean, Text: string) {
        this.GameOver = true;
        ProjectEventManager.emit(ProjectEvent.游戏结束, "米饭仙人");
        if (isWinner) {
            this.OpenText("挑战成功", () => {
                let GameOverPanel = this.UINode.getChildByName("结算");
                GameOverPanel.active = true;
                GameOverPanel.getChildByPath("结算框/文本").getComponent(Label).string = "干饭成功";
                if (MFXR_GameManager.GameScene < 4) {
                    GameOverPanel.getChildByPath("结算框/下一关").active = true;
                }
            })
        } else {
            let GameOverPanel = this.UINode.getChildByName("结算");
            GameOverPanel.active = true;
            GameOverPanel.getChildByPath("结算框/文本").getComponent(Label).string = "失败";
            GameOverPanel.getChildByPath("结算框/失败原因").active = true;
            GameOverPanel.getChildByPath("结算框/失败原因").getComponent(Label).string = "失败原因:" + Text;
        }

    }


    //进入庭审
    GoCourttrial() {
        if (this.CourttrialNumber > 0) {
            this.GamePause = true;
            this.UINode.getChildByName("开庭特效").active = true;
            this.UINode.getChildByName("开庭特效").getComponent(Animation).play();
            this.scheduleOnce(() => {
                this.AudioPlay("进入法庭");
                let panel = this.UINode.getChildByName("庭审");
                let index = Math.floor(Math.random() * MFXR_Constant.issue.length);
                panel.active = true;
                panel.getComponent(Animation).play();
                //初始化文字
                panel.getChildByPath("回答对话框/Label").getComponent(Label).string = MFXR_Constant.issue[index];
                panel.getChildByPath("选择框/答案框0/Label").getComponent(Label).string = MFXR_Constant.answer[index][0];
                panel.getChildByPath("选择框/答案框1/Label").getComponent(Label).string = MFXR_Constant.answer[index][1];
                panel.getChildByPath("选择框/答案框2/Label").getComponent(Label).string = MFXR_Constant.answer[index][2];
            }, 1.5)

        } else {
            this.gameOver(false, "吃不下了！");
        }

    }

    public RamdonGameNumber: number = 3;//剩余的小游戏数量
    //进入随机小游戏
    GoRamDomGame() {
        this.UINode.getChildByName("庭审").active = false;
        if (this.RamdonGameNumber <= 0) {//胃败诉
            this.OpenText("胃败诉")
            this.GamePause = false;
            this.satiety = 0;
            this.CourttrialNumber--;
            this.UINode.getChildByPath("倒计时/剩余庭审次数").getComponent(Label).string = "剩余庭审次数：" + this.CourttrialNumber;
        } else {//下一个小游戏
            this.StarRamdonGame();
        }
    }
    GameList: string[] = ["小游戏_闭目养神", "小游戏_疑惑", "小游戏_下咽", "小游戏_发呆", "小游戏_努力呼吸"];//
    //开始随机小游戏
    StarRamdonGame() {
        let gamename: string = this.GameList[Math.floor(Math.random() * this.GameList.length)];
        MFXR_Incident.Loadprefab("Res/" + gamename).then((pre: Prefab) => {
            let game = instantiate(pre);
            game.setParent(this.UINode);
        })
    }

    //弹出文字
    OpenText(Text: string, callback?: Function) {
        MFXR_Incident.Loadprefab("Res/文字").then((pre: Prefab) => {
            let nd = instantiate(pre);
            nd.setParent(this.UINode);
            MFXR_Incident.LoadSprite("文字/" + Text).then((sp: SpriteFrame) => {
                nd.getComponent(Sprite).spriteFrame = sp;
            })
            nd.setScale(v3(0, 0, 0))
            tween(nd)
                .to(0.5, { scale: v3(1.5, 1.5, 1.5) })
                .delay(0.5)
                .call(() => {
                    if (callback) callback();
                    nd.destroy();
                })
                .start();
        })
    }

    //播放音效
    AudioPlay(AudioName: string) {
        MFXR_Incident.LoadAudio("Audio/" + AudioName).then((audio: AudioClip) => {
            this.audioSource.playOneShot(audio);
        })
    }

    //重置小菜的位置
    SetXiaoCaiPos() {
        let XiaoCai = this.GameNode.getChildByName("小菜");
        if (this.riceNode && this.riceNode.children.length > 0) {
            let pos1 = this.riceNode.children[this.riceNode.children.length - 1].worldPosition.clone();
            let pos2 = v3(this.riceNode.worldPosition.x, pos1.y - 40, 0);
            tween(XiaoCai)
                .to(0.5, { worldPosition: pos2 })
                .start();
        }
    }
}


