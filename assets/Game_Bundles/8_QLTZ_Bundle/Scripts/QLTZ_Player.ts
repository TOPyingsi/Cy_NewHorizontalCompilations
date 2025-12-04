import { _decorator, AnimationState, Component, Node, SkeletalAnimation, Sprite, tween, v3, Vec3 } from 'cc';
import { QLTZ_GameMode, QLTZ_UIManager } from './QLTZ_UIManager';
import { QLTZ_FinishPanel } from './QLTZ_FinishPanel';
import { QLTZ_AudioManager } from './QLTZ_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('QLTZ_Player')
export class QLTZ_Player extends Component {

    @property(Node)
    HandPoint: Node = null;

    Anim: SkeletalAnimation = null;
    Cup: Node = null;//人物手上的杯子
    CanAction: boolean = true;//是否可以行动
    AIAgain: boolean = false;//AI继续行动

    protected onLoad(): void {
        this.Anim = this.node.getComponent(SkeletalAnimation);
        this.Anim.on(SkeletalAnimation.EventType.FINISHED, this.AniFinished, this);
    }

    protected start(): void {
        this.Anim.crossFade("待机");
    }

    AniFinished(type, state: AnimationState) {
        switch (state.clip.name) {
            case "拍杯子":
                {
                    if (!QLTZ_UIManager.Instance.IsTakeCup) QLTZ_AudioManager.AudioClipPlay("拍杯子");

                    if (QLTZ_UIManager.Instance.IsTakeCup && this.Cup) {
                        QLTZ_UIManager.Instance.IsTakeCup = false;
                        this.Cup.setParent(QLTZ_UIManager.Instance.GameScene);
                        this.Cup.setPosition(QLTZ_UIManager.Instance.CupInitPos);
                        this.Cup.setRotationFromEuler(Vec3.ZERO);
                        this.Cup = null;
                    }
                    this.Anim.crossFade("抬起", 0);
                }
                break;
            case "受击":
                {
                    this.Anim.crossFade("待机");
                    this.CanAction = true;
                    if (this.node.name == "女生") {
                        if (QLTZ_UIManager.Instance.GirlMood >= 1) {
                            if (QLTZ_UIManager.gameMode == QLTZ_GameMode.SingleMode) {
                                QLTZ_UIManager.Instance.GameUI.getChildByName("FinishPanel").getComponent(QLTZ_FinishPanel).title = "你输了！";
                            }
                            else {
                                QLTZ_UIManager.Instance.GameUI.getChildByName("FinishPanel").getComponent(QLTZ_FinishPanel).title = "男生赢了！";
                            }
                            QLTZ_UIManager.Instance.ShowPanel(QLTZ_UIManager.Instance.GameUI.getChildByName("FinishPanel"));
                        }
                    }
                    else {
                        if (QLTZ_UIManager.Instance.BoyMood >= 1) {
                            if (QLTZ_UIManager.gameMode == QLTZ_GameMode.SingleMode) {
                                QLTZ_UIManager.Instance.GameUI.getChildByName("FinishPanel").getComponent(QLTZ_FinishPanel).title = "你赢了！";
                            }
                            else {
                                QLTZ_UIManager.Instance.GameUI.getChildByName("FinishPanel").getComponent(QLTZ_FinishPanel).title = "女生赢了！";
                            }
                            QLTZ_UIManager.Instance.ShowPanel(QLTZ_UIManager.Instance.GameUI.getChildByName("FinishPanel"));
                        }
                    }
                }
                break;
            case "拍铃铛":
                {
                    if (QLTZ_UIManager.Instance.GirlRound) {
                        QLTZ_UIManager.Instance.Boy.Anim.crossFade("打脸");
                    }
                    else {
                        QLTZ_UIManager.Instance.Girl.Anim.crossFade("打脸");
                    }
                    QLTZ_UIManager.Instance.StopTime();
                }
                break;
            case "打脸":
                {
                    if (QLTZ_UIManager.Instance.IsTakeCup && this.Cup) {
                        //如果拿着杯子了，要先放回去
                        this.Anim.crossFade("拍杯子", 0);
                        if (QLTZ_UIManager.gameMode == QLTZ_GameMode.SingleMode && this.node.name == "男生") this.AIAgain = true;
                    }
                }
                break;
            case "抬起":
                {
                    this.Anim.crossFade("待机");
                    this.CanAction = true;
                    if (this.AIAgain) {
                        this.AIAgain = false;
                        QLTZ_UIManager.Instance.GirlRound = false;
                        QLTZ_UIManager.Instance.Arrow.setParent(QLTZ_UIManager.Instance.GameScene.getChildByName("BoyArrowPoint"));
                        QLTZ_UIManager.Instance.TurnBoyAction();
                        QLTZ_UIManager.Instance.ShowTime();
                    }
                    else {
                        if (QLTZ_UIManager.Instance.GirlRound) {
                            QLTZ_UIManager.Instance.GirlRound = false;
                            QLTZ_UIManager.Instance.Arrow.setParent(QLTZ_UIManager.Instance.GameScene.getChildByName("BoyArrowPoint"));
                            QLTZ_UIManager.Instance.TurnBoyAction();
                            QLTZ_UIManager.Instance.ShowTime();
                        }
                        else {
                            QLTZ_UIManager.Instance.GirlRound = true;
                            QLTZ_UIManager.Instance.Arrow.setParent(QLTZ_UIManager.Instance.GameScene.getChildByName("GirlArrowPoint"));
                            QLTZ_UIManager.Instance.ShowTime();
                        }
                    }
                }
                break;
            case "拿杯子":
                {
                    if (QLTZ_UIManager.Instance.IsTakeCup) {
                        QLTZ_UIManager.Instance.IsTakeCup = false;
                        this.Cup.setParent(QLTZ_UIManager.Instance.GameScene);
                        this.Cup.setPosition(QLTZ_UIManager.Instance.CupInitPos);
                        this.Cup.setRotationFromEuler(Vec3.ZERO);
                        this.Cup = null;
                        this.Anim.crossFade("待机");
                        this.CanAction = true;
                    }
                    else {
                        QLTZ_UIManager.Instance.IsTakeCup = true;
                        this.Cup = QLTZ_UIManager.Instance.Cup;
                        this.Cup.setParent(this.HandPoint);
                        this.Cup.setPosition(v3(0, 0.1, 0));
                        this.Cup.setRotationFromEuler(v3(-90, 0, 0));
                        this.Anim.crossFade("抬起", 0);
                    }
                }
                break;
        }
    }

    HitEvent() {
        QLTZ_AudioManager.AudioClipPlay("打脸");
        if (this.node.name == "女生") {
            QLTZ_UIManager.Instance.Boy.Anim.crossFade("受击");
            QLTZ_UIManager.Instance.BoyMood += 0.2;
            tween(QLTZ_UIManager.Instance.GameUI.getChildByPath("BoyMood/bar").getComponent(Sprite))
                .to(0.5, { fillRange: QLTZ_UIManager.Instance.BoyMood })
                .start();
        }
        else {
            QLTZ_UIManager.Instance.Girl.Anim.crossFade("受击");
            QLTZ_UIManager.Instance.GirlMood += 0.2;
            tween(QLTZ_UIManager.Instance.GameUI.getChildByPath("GirlMood/bar").getComponent(Sprite))
                .to(0.5, { fillRange: QLTZ_UIManager.Instance.GirlMood })
                .start();

        }
        QLTZ_UIManager.Instance.BellCenter.setPosition(0, 0, 0);
    }

    BellEvent() {
        QLTZ_AudioManager.AudioClipPlay("铃铛声");
        QLTZ_UIManager.Instance.BellCenter.setPosition(0, -0.03, 0);
    }

    //不拿杯子
    NoTake(IsAi: boolean = false) {
        if (!IsAi) {
            if (QLTZ_UIManager.Instance.Boy.Anim.getState("受击").isPlaying || QLTZ_UIManager.Instance.Boy.Anim.getState("打脸").isPlaying
                || QLTZ_UIManager.Instance.Girl.Anim.getState("受击").isPlaying || QLTZ_UIManager.Instance.Girl.Anim.getState("打脸").isPlaying) return;
        }
        if (this.CanAction) {
            this.CanAction = false;
            this.Anim.crossFade("拍杯子", 0);
            QLTZ_UIManager.Instance.StopTime();
        }
    }

    //拿杯子
    Take(IsAi: boolean = false) {
        if (!IsAi) {
            if (QLTZ_UIManager.Instance.Boy.Anim.getState("受击").isPlaying || QLTZ_UIManager.Instance.Boy.Anim.getState("打脸").isPlaying
                || QLTZ_UIManager.Instance.Girl.Anim.getState("受击").isPlaying || QLTZ_UIManager.Instance.Girl.Anim.getState("打脸").isPlaying) return;
        }
        if (this.CanAction) {
            this.CanAction = false;
            if (QLTZ_UIManager.Instance.IsTakeCup) {
                if (this.Cup) {
                    this.Anim.crossFade("拍杯子", 0);
                }
                else {
                    this.Anim.crossFade("拍铃铛", 0);
                }
            }
            else {
                //拿杯子
                this.Anim.crossFade("拿杯子", 0);
            }
            QLTZ_UIManager.Instance.StopTime();
        }
    }
}



