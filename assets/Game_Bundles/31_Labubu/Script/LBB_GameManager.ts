import { _decorator, Component, director, Director, Event, Label, Node, Quat, quat, Tween, tween, v3 } from 'cc';
import { PLAY_AUDIO } from './LBB_Event';
import { AUDIO_ENUM, EVENT_ENUM, SCENE_ENUM } from './LBB_Enum';
import { LBB_RoleCtrl } from './LBB_RoleCtrl';
import { AudioManager } from 'db://assets/Scripts/Framework/Managers/AudioManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
const { ccclass, property } = _decorator;

@ccclass('LBB_GameManager')
export class LBB_GameManager extends Component {
    public static Instance: LBB_GameManager = null;

    @property(Node) mask: Node = null;
    @property(Node) monitor: Node = null;
    @property(Node) whiteMask: Node = null;
    @property(Node) yellow: Node = null;
    @property(Node) red: Node = null;
    @property(Node) y: Node = null;
    @property(Node) r: Node = null;
    @property(Node) winPanel: Node = null;
    @property(Node) failPanel: Node = null;

    @property(Node) fh: Node = null;
    @property(Node) gdms: Node = null;

    @property(Label) timeStr: Label = null;


    isWearMask: boolean = false;
    isMonitor: boolean = false;

    isGameStart: boolean = false;
    isGameOver: boolean = false;
    time: number = 0;

    protected onLoad(): void {
        LBB_GameManager.Instance = this;
    }

    protected start(): void {
        this.isGameStart = true;
        ProjectEventManager.emit(ProjectEvent.游戏开始, "Labubu恐怖之夜");
        ProjectEventManager.emit(ProjectEvent.初始化更多模式按钮, this.gdms);
    }

    protected update(dt: number): void {
        if (this.isGameOver) return;
        if (this.isGameStart) {
            this.time += dt;
            const minutes = Math.floor(this.time / 60);
            const seconds = Math.floor(this.time % 60);
            this.timeStr.string = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            console.log(Math.floor(this.time));
        }
        if (this.time >= 3600) {
            this.isGameOver = true;
            console.log("游戏胜利");
            // this.winPanel.Show();
            this.scheduleOnce(() => {
                Director.instance.loadScene("Labubu");
            }, 2);
        }
    }

    onButtonClick(event: Event) {
        PLAY_AUDIO.emit(EVENT_ENUM.PLAY_AUDIO, AUDIO_ENUM.BUTTON, this);

        console.log("点击了", event.target.name);

        switch (event.target.name) {
            case "WearMaskButton":
                this.maskButtonHandler();
                PLAY_AUDIO.emit(EVENT_ENUM.PLAY_AUDIO, AUDIO_ENUM.WEAR_MASK, this);
                break;

            case "MonitorButton":
                this.MonitorButtonHandler();
                break;

            case "ElectButton":
                this.ElectButtonHandler();
                break;

            case "ReturnButton":
                this.ReturnButtonHandler();
                break;

            case "更多模式":
                clearTimeout(LBB_RoleCtrl.Instance.role1TimeOut);
                clearTimeout(LBB_RoleCtrl.Instance.role2TimeOut);
                break;

            default:
                console.error("错误的button", event.target.name);
                break
        }
    }

    ReturnButtonHandler() {
        clearTimeout(LBB_RoleCtrl.Instance.role1TimeOut);
        clearTimeout(LBB_RoleCtrl.Instance.role2TimeOut);

        ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
            UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {
                ProjectEventManager.emit(ProjectEvent.返回主页, "Labubu恐怖之夜");
            });
        });
    }

    ElectButtonHandler() {
        if (LBB_RoleCtrl.Instance.role2_index == 6) {
            PLAY_AUDIO.emit(EVENT_ENUM.PLAY_AUDIO, AUDIO_ENUM.ElectFlow, this);

            const a = LBB_RoleCtrl.Instance.role2_mainMon.getChildByName("白色");
            if (!a) return; // 空值检查

            const FLASH_DELAY = 0.2;
            const FLASH_COUNT = 3;

            const toggleVisibility = (isActive: boolean) => {
                a.active = isActive;
                this.whiteMask.active = isActive;
            };

            const flashOnce = (index: number) => {
                if (index >= FLASH_COUNT * 2) return; // 闪烁完成

                const isActive = index % 2 === 0;
                toggleVisibility(isActive);

                this.scheduleOnce(() => {
                    flashOnce(index + 1);
                }, FLASH_DELAY);
            };

            flashOnce(0);
            clearTimeout(LBB_RoleCtrl.Instance.role2TimeOut);
            LBB_RoleCtrl.Instance.role2_index = 1;
            LBB_RoleCtrl.Instance.refeshRoles();
            LBB_RoleCtrl.Instance.role2_move();
        } else {
            return;
        }

    }

    maskButtonHandler() {
        if (this.isWearMask) {
            console.log("摘下面具");
            tween(this.mask)
                .to(0.3, { position: v3(0, 1080) })
                .call(() => {
                    this.isWearMask = false;
                })
                .start();
        } else {
            console.log("戴上面具");
            tween(this.mask)
                .to(0.3, { position: v3(0, 0) })
                .call(() => {
                    this.isWearMask = true;
                    this.scheduleOnce(() => {
                        clearTimeout(LBB_RoleCtrl.Instance.role1TimeOut)
                        LBB_RoleCtrl.Instance.role1_index = 1;
                        LBB_RoleCtrl.Instance.refeshRoles();
                        LBB_RoleCtrl.Instance.role1_move();
                    }, 2);
                })
                .start();
        }
    }

    MonitorButtonHandler() {
        if (this.isMonitor) {
            console.log("关闭监控");
            tween(this.monitor)
                .to(0.3, { eulerAngles: v3(0, -90, 0) })
                .call(() => {
                    this.isMonitor = false;
                })
                .start();
        } else {
            console.log("开启监控");
            tween(this.monitor)
                .to(0.3, { eulerAngles: v3(0, 0, 0) })
                .call(() => {
                    this.isMonitor = true;
                })
                .start();
        }
    }

    gameOver(bol: boolean) {

        clearTimeout(LBB_RoleCtrl.Instance.role2TimeOut);
        clearTimeout(LBB_RoleCtrl.Instance.role1TimeOut);

        AudioManager.Instance.StopBGM();
        if (bol) {
            this.winPanel.active = true;
            PLAY_AUDIO.emit(EVENT_ENUM.PLAY_AUDIO, AUDIO_ENUM.WIN, this);
        } else {
            this.failPanel.active = true;
            PLAY_AUDIO.emit(EVENT_ENUM.PLAY_AUDIO, AUDIO_ENUM.FAIL, this);
        }

        this.scheduleOnce(() => {
            Tween.stopAll();
            director.loadScene(SCENE_ENUM.LBB);
        }, 2);

        ProjectEventManager.emit(ProjectEvent.游戏结束, "Labubu恐怖之夜");

    }

}


