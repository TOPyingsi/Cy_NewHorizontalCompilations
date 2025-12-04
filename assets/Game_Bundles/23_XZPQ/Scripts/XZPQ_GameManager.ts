import { _decorator, Animation, AudioClip, AudioSource, Component, Director, director, Event, Label, Node, Sprite, SpriteFrame, Tween, tween, v3, Vec3 } from 'cc';
import { XZPQ_Menu } from './XZPQ_Menu';
import { XZPQ_NeedHelp } from './XZPQ_NeedHelp';
import { XZPQ_GamePanel } from './XZPQ_GamePanel';
import { XZPQ_mon1 } from './XZPQ_mon1';
import { XZPQ_mon2 } from './XZPQ_mon2';
import { XZPQ_mon3 } from './XZPQ_mon3';
import { XZPQ_mon4 } from './XZPQ_mon4';
import { XZPQ_mon_home } from './XZPQ_mon_home';
import { XZPQ_WinPanel } from './XZPQ_WinPanel';
import { XZPQ_FailPanel } from './XZPQ_FailPanel';
import { AudioManager } from 'db://assets/Scripts/Framework/Managers/AudioManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { XZPQ_AudioManager } from './XZPQ_AudioManager';
import { XZPQ_AniCtrl } from './XZPQ_AniCtrl';
import { XZPQ_AniCtrl2 } from './XZPQ_AniCtrl2';
const { ccclass, property } = _decorator;

@ccclass('XZPQ_GameManager')
export class XZPQ_GameManager extends Component {

    //# region 属性
    public static Instance: XZPQ_GameManager = null;

    @property(Node)
    public aniCtrl1: Node = null;
    public aniCtrlTs1: XZPQ_AniCtrl = null;

    @property(Node)
    public aniCtrl2: Node = null;
    public aniCtrlTs2: XZPQ_AniCtrl2 = null;

    @property(Node)
    MonButton: Node = null;

    @property(Node)
    MaskButton: Node = null;

    @property(Node)
    Mask: Node = null;

    @property(XZPQ_Menu)
    meun: XZPQ_Menu;

    @property(XZPQ_NeedHelp)
    help: XZPQ_NeedHelp;

    @property(XZPQ_GamePanel)
    gamePanel: XZPQ_GamePanel;

    @property(XZPQ_WinPanel)
    winPanel: XZPQ_WinPanel;

    @property(XZPQ_FailPanel)
    failPanel: XZPQ_FailPanel;

    @property(Animation)
    flash: Animation = null;

    @property(Node)
    monsPanel: Node = null;

    @property(XZPQ_mon1)
    mon_1: XZPQ_mon1 = null;

    @property(XZPQ_mon2)
    mon_2: XZPQ_mon2 = null;

    @property(XZPQ_mon3)
    mon_3: XZPQ_mon3 = null;

    @property(XZPQ_mon4)
    mon_4: XZPQ_mon4 = null;

    @property(XZPQ_mon_home)
    mon_home: XZPQ_mon_home = null;

    @property(Node)
    peiQiTuLian: Node = null;

    @property(Node)
    qiaoZhiTuLian: Node = null;

    @property(AudioClip)
    menuBgm: AudioClip = null;//菜单界面背景音乐

    @property(AudioClip)
    gameBgm: AudioClip = null;//游戏界面背景音乐

    @property(AudioClip)
    maskyinxiao: AudioClip = null;//戴面具的音效

    @property(AudioClip)
    monyinxiao: AudioClip = null;//切换监控的音效

    @property(AudioClip)
    lookyinxiao: AudioClip = null;//被乔治发现的音效

    @property(AudioClip)
    pigAttackyinxiao: AudioClip = null;//佩奇突脸的音效

    @property(AudioClip)
    qiaozhiAttackyinxiao: AudioClip = null;//乔志突脸的音效

    @property(AudioClip)
    electyinxiao: AudioClip = null;//电击音效

    @property(AudioClip)
    monnom: AudioClip = null;//电击音效

    @property(Node)
    qz: Node = null;

    @property(Node)
    pq: Node = null;

    @property(Node)
    tutorials: Node = null;

    @property(Node)
    TutorialsPanel: Node = null;

    // @property(Node)
    // MoreModesButton: Node = null;

    public time: number = 0;
    public isGameStart: boolean = false;
    public isGameOver: boolean = false;

    peiqi_index: number = 2;
    qiaozhi_index: number = 3;
    peiQi_Action: number = 0;
    qiaoZhi_Action: number = 0;
    peiqi_clamb: boolean = false;
    wearMask: boolean = false;

    //# endregion
    protected onLoad(): void {
        XZPQ_GameManager.Instance = this;

    }

    protected start(): void {
        // AudioManager.Instance.PlayBGM(this.menuBgm);
        // this.startGame();

        this.aniCtrlTs1 = this.aniCtrl1.getComponent(XZPQ_AniCtrl);
        this.aniCtrlTs2 = this.aniCtrl2.getComponent(XZPQ_AniCtrl2);
    }

    // StartAction() {
    //     this.schedule(this.PeiQiAction, 5);
    //     this.schedule(this.QiaoZhiAction, 10);
    //     // this.PeiQiAction();
    //     // this.QiaoZhiAction();
    // }

    // PeiQiAction() {
    //     // this.peiQi_Action = setTimeout(function () {

    //     //     this.peiqi_index = 1;
    //     //     XZPQ_GameManager.Instance.RefreashPigs();

    //     //     this.schedule(function () {
    //     //         this.peiqi_clamb = true;
    //     //         XZPQ_GameManager.Instance.RefreashPigs();

    //     //         this.peiQi_Action = setTimeout(function () {
    //     //             XZPQ_GameManager.Instance.Fail(true);
    //     //         }.bind(this), 6666);

    //     //     }.bind(this), 25000);

    //     //}.bind(this), 30000);


    //     this.peiqi_index = 1;
    //     XZPQ_GameManager.Instance.RefreashPigs();

    //     this.schedule(this.unPeiqi, 5);

    // }

    // unPeiqi() {
    //     this.peiqi_clamb = true;
    //     XZPQ_GameManager.Instance.RefreashPigs();

    //     this.schedule(this.Fail(true), 6);

    // }

    // unPeiqiAll() {
    //     this.unschedule(this.PeiQiAction);
    //     this.unschedule(this.unPeiqi);
    //     this.unschedule(this.Fail);
    // }

    // QiaoZhiAction() {
    //     // this.qiaoZhi_Action = setTimeout(function () {
    //     //     this.qiaozhi_index = -1;
    //     //     XZPQ_GameManager.Instance.RefreashPigs();
    //     //     if (this.wearMask == false) {
    //     //         XZPQ_AudioManager.Instance.playAudio(this.lookyinxiao);
    //     //     }

    //     //     this.qiaoZhi_Action = setTimeout(function () {
    //     //         XZPQ_GameManager.Instance.QiaoZhiTuLian();
    //     //     }.bind(this), 6666);

    //     // }.bind(this), 40000);

    //     this.qiaozhi_index = -1;
    //     XZPQ_GameManager.Instance.RefreashPigs();
    //     if (this.wearMask == false) {
    //         XZPQ_AudioManager.Instance.playAudio(this.lookyinxiao);
    //     }

    //     this.schedule(XZPQ_GameManager.Instance.QiaoZhiTuLian, 6);

    // }

    // unQiaoZhiAll() {
    //     this.unschedule(this.QiaoZhiAction);
    //     this.unschedule(this.QiaoZhiTuLian);
    // }


    public startGame() {
        this.chooseNode.active = false;
        this.MaskButton.active = true;
        this.MonButton.active = true;

        this.aniCtrlTs1.RefreashPigs();
        this.aniCtrlTs1.StartAction();

        this.aniCtrlTs2.RefreashPigs();
        this.aniCtrlTs2.StartAction();

        this.isGameStart = true;
        this.time = 12 * 60;
        this.showBtn();
        ProjectEventManager.emit(ProjectEvent.游戏开始, "小象佩妮");
        // ProjectEventManager.emit(ProjectEvent.初始化更多模式按钮, this.MoreModesButton);
    }

    showBtn() {
        this.MonButton.active = true;
        this.MaskButton.active = true;
    }

    ShowMonsPanel(active: boolean) {
        Tween.stopAllByTarget(this.monsPanel);
        if (active) {
            this.monsPanel.active = active;
            this.MaskButton.active = !this.monsPanel.active;
            this.ShowMons(1);
            tween(this.monsPanel).to(0.2, { position: Vec3.ZERO }).start();
        } else {
            tween(this.monsPanel).to(0.2, { position: v3(0, - 1480.838, 0) }).call(() => {
                this.monsPanel.active = active;
                this.MaskButton.active = !this.monsPanel.active;
            }).start();
        }
    }

    ShowMons(index: number) {
        this.ShowFlash();
        this.mon_1.Show(index == 1);
        this.mon_2.Show(index == 2);
        this.mon_3.Show(index == 3);
        this.mon_4.Show(index == 4);
    }

    WearMask() {
        XZPQ_GameManager.Instance.wearMask = !XZPQ_GameManager.Instance.wearMask;
        Tween.stopAllByTarget(this.Mask);
        if (XZPQ_GameManager.Instance.wearMask) {
            tween(this.Mask)
                .to(0.5, { position: v3(0, -189.852, 0) })
                .call(() => {
                    if (this.qiaozhi_index === -1) {
                        this.aniCtrlTs2.unQiaoZhiAll();
                    }
                })
                .start();
        } else {
            tween(this.Mask)
                .to(0.5, { position: v3(0, 1700, 0) })
                .start();
        }
    }

    // RefreashPigs() {
    //     XZPQ_GameManager.Instance.mon_1.RefreashPig();
    //     XZPQ_GameManager.Instance.mon_2.RefreashPig();
    //     XZPQ_GameManager.Instance.mon_3.RefreashPig();
    //     XZPQ_GameManager.Instance.mon_4.RefreashPig();
    //     XZPQ_GameManager.Instance.mon_home.RefreashPig();
    // }

    // ResetPigs() {
    //     this.peiqi_clamb = false;
    //     this.peiqi_index = 2;
    //     this.qiaozhi_index = 3;
    //     // this.unscheduleAllCallbacks();
    //     this.RefreashPigs();

    // }

    // QiaoZhiTuLian() {
    //     if (!this.wearMask) {
    //         this.Fail(false);
    //     } else {
    //         this.qiaozhi_index = 3;
    //         this.RefreashPigs();
    //     }
    // }

    ShowFlash() {
        this.flash.node.active = true;
        this.flash.play();
        this.scheduleOnce(() => {
            this.flash.node.active = false;
        }, 0.1)
    }

    // Fail(isPeiQi: boolean) {

    //     return () => {
    //         if (this.isGameOver) {
    //             return;
    //         }
    //         this.isGameOver = true;
    //         ProjectEventManager.emit(ProjectEvent.游戏结束, "小象佩妮");
    //         AudioManager.Instance.StopBGM();

    //         this.ResetPigs();
    //         if (isPeiQi) {
    //             XZPQ_AudioManager.Instance.playAudio(this.pigAttackyinxiao);
    //             this.peiQiTuLian.active = true;
    //         }
    //         else {
    //             XZPQ_AudioManager.Instance.playAudio(this.qiaozhiAttackyinxiao);
    //             this.qiaoZhiTuLian.active = true;
    //         }
    //         this.scheduleOnce(() => {
    //             this.failPanel.Show();
    //         }, 2);

    //         this.unscheduleAllCallbacks();

    //     }
    // }

    // Win() {
    //     this.isGameOver = true;
    //     ProjectEventManager.emit(ProjectEvent.游戏结束, "小象佩妮");
    //     AudioManager.Instance.StopBGM();
    //     this.ResetPigs();
    //     this.scheduleOnce(() => {
    //         this.winPanel.Show();
    //     }, 2);
    // }


    protected update(dt: number): void {
        if (this.isGameOver) return;
        if (this.isGameStart) {
            this.time += dt;
            const minutes = Math.floor(this.time / 60);
            const timeLabel = this.gamePanel.node.getChildByName("TimeLabel")
            timeLabel.getComponent(Label).string = `${minutes} PM`;
            console.log(Math.floor(this.time));
        }
        if (this.time >= 1080) {
            this.isGameOver = true;
            this.winPanel.Show();
            this.scheduleOnce(() => {
                clearTimeout(this.qiaoZhi_Action);
                clearTimeout(this.peiQi_Action);
                AudioManager.Instance.StopBGM();
                Director.instance.loadScene("Start");
            }, 2);
        }
    }

    //需要更换图片的Sprite组件数组
    @property({ type: [Sprite] })
    sprites: Sprite[] = [];
    //小强图片数组
    @property({ type: [SpriteFrame] })
    qiangImages: SpriteFrame[] = [];
    // //佩奇图片数组
    // @property({ type: [SpriteFrame] })
    // peiqiImages: SpriteFrame[] = [];

    @property(Node)
    chooseNode: Node = null;
    chooseGameType() {

        for (let i = 0; i < this.sprites.length; i++) {
            this.sprites[i].spriteFrame = this.qiangImages[i];
        }

        this.startGame();
    }

    gameType: string = "佩奇";
    onButtonClick(event: Event) {

        switch (event.target.name) {
            case "mon1_Button":
                XZPQ_AudioManager.Instance.playAudio(this.monnom);

                this.ShowMons(1);
                break;
            case "mon2_Button":
                XZPQ_AudioManager.Instance.playAudio(this.monnom);

                this.ShowMons(2);
                break;
            case "mon3_Button":
                XZPQ_AudioManager.Instance.playAudio(this.monnom);

                this.ShowMons(3);
                break;
            case "mon4_Button":
                XZPQ_AudioManager.Instance.playAudio(this.monnom);

                this.ShowMons(4);
                break;

            case "佩奇":
                this.gameType = "佩奇";
                this.startGame();
                break;
            case "小强":
                this.gameType = "小强";
                this.chooseGameType();
                break;

            case "NewGameButton":
                AudioManager.Instance.StopBGM();
                AudioManager.Instance.PlayBGM(this.gameBgm);
                this.meun.newGame();
                break;
            case "ContinueGameButton":
                AudioManager.Instance.StopBGM();
                this.meun.continueGame();
                break;
            case "HelpButton":
                const scene = director.getScene()
                const grandchildren = this.getAllGrandchildren(scene);
                grandchildren.forEach((grandchild) => {
                    if (grandchild.name == "Sky") {
                        grandchild.active = true;
                    }
                });
                this.gamePanel.help();
                this.TutorialsPanel.active = true;
                this.startGame();
                break;
            case "MonButton":
                XZPQ_AudioManager.Instance.playAudio(this.monyinxiao);

                this.ShowMonsPanel(!this.monsPanel.active);
                break;
            case "MaskButton":
                this.MonButton.active = this.wearMask;
                XZPQ_AudioManager.Instance.playAudio(this.maskyinxiao);
                this.WearMask();
                break;

            case "ElectFlow_Button":
                XZPQ_AudioManager.Instance.playAudio(this.monnom);

                if (this.peiqi_clamb) {
                    XZPQ_AudioManager.Instance.playAudio(this.electyinxiao);

                    this.aniCtrlTs1.ele(() => {
                        this.aniCtrlTs1.ResetPigs();
                        this.aniCtrlTs1.unPeiqiAll();
                        this.aniCtrlTs1.RefreashPigs();
                        this.aniCtrlTs1.StartAction();
                    });

                }

                this.gamePanel.electFlow();
                break;
            case "GameFail":
                clearTimeout(this.peiQi_Action);
                clearTimeout(this.qiaoZhi_Action);
                AudioManager.Instance.StopBGM();
                this.gamePanel.gameFailButton();
                break;
            case "ReturnButton":
                ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
                    UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {

                        XZPQ_GameManager.Instance = null;
                        this.unscheduleAllCallbacks();
                        ProjectEventManager.emit(ProjectEvent.返回主页, "Start");
                    });
                });
                // if (Banner.RegionMask) {
                //     UIManager.ShGameFailowPanel(Panel.LoadingPanel, [GameManager.StartScene]);
                // } else {
                //     UIManager.ShowPanel(Panel.MoreGamePanel, [true]);
                // }
                break

            default:
                console.error("未知的按钮点击事件：", event.target.name);
                break;

        }
    }

    // ele(callback?: () => void) {
    //     let toggle = false;
    //     const intervalId = setInterval(() => {
    //         if (toggle) {
    //             this.mon_1.pig_2.active = false;
    //             this.mon_1.pig_3.active = true;
    //         } else {
    //             this.mon_1.pig_2.active = true;
    //             this.mon_1.pig_3.active = false;
    //         }
    //         toggle = !toggle;
    //     }, 100);

    //     setTimeout(() => {
    //         clearInterval(intervalId);
    //         this.mon_1.pig_2.active = true;
    //         this.mon_1.pig_3.active = false;
    //         callback();
    //     }, 2000); // 2秒后停止切换
    // }

    getAllGrandchildren(node: Node): Node[] {
        let grandchildren: Node[] = [];
        node.children.forEach(child => {
            child.children.forEach(grandchild => {
                grandchildren.push(grandchild);
            });
        });
        return grandchildren;
    }

    protected onDestroy(): void {
        XZPQ_GameManager.Instance = null;
        clearTimeout(this.peiqi_index);
        clearTimeout(this.qiaozhi_index);
    }
}
