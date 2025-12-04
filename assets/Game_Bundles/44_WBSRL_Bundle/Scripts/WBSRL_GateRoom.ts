import { _decorator, Component, Enum, EventTouch, instantiate, Label, Node, Prefab, TERRAIN_SOUTH_INDEX, Vec3 } from 'cc';
import { WBSRL_Room } from './WBSRL_Room';
import { WBSRL_Monologue } from './WBSRL_Monologue';
import { WBSRL_Pot } from './WBSRL_Plot';
import { WBSRL_GameManager } from './WBSRL_GameManager';
import { WBSRL_Joystick } from './WBSRL_Joystick';
import { WBSRL_ROOM } from './WBSRL_Constant';
const { ccclass, property } = _decorator;

@ccclass('WBSRL_GateRoom')
export class WBSRL_GateRoom extends WBSRL_Room {

    @property(WBSRL_Monologue)
    Monologue: WBSRL_Monologue = null;

    @property(Node)
    SelectNode: Node = null;

    @property(Label)
    Select1: Label = null;

    @property(Label)
    Select2: Label = null;

    @property(Node)
    ISComeIn: Node = null;

    @property(Node)
    CheCkNode: Node = null;

    @property(Prefab)
    Day1: Prefab[] = [];

    @property(Prefab)
    Day2: Prefab[] = [];

    @property(Prefab)
    Day3: Prefab[] = [];

    @property(Prefab)
    Day4: Prefab[] = [];

    Curlot: WBSRL_Pot = null;

    private isClick: boolean = false;
    private isOver: boolean = false;
    Init() {
        super.Init();
        if (WBSRL_GameManager.Instance.CurDay == 0) {
            WBSRL_GameManager.Instance.Plots = this.Day1;
        }
        else if (WBSRL_GameManager.Instance.CurDay == 1) {
            WBSRL_GameManager.Instance.Plots = this.Day2;
        }
        else if (WBSRL_GameManager.Instance.CurDay == 2) {
            WBSRL_GameManager.Instance.Plots = this.Day3;
        }
        else if (WBSRL_GameManager.Instance.CurDay == 3) {
            WBSRL_GameManager.Instance.Plots = this.Day4;
        }
    }

    OpenRoom(): void {
        super.OpenRoom();
        WBSRL_GameManager.Instance.HouseMain.children.forEach(e => e.active = false);
        this.NextPlot();
    }

    CloseRoom(): void {
        super.CloseRoom();
        WBSRL_GameManager.Instance.HouseMain.children.forEach(e => e.active = true);
        if (WBSRL_GameManager.Instance.Plots.length <= 0) {
            WBSRL_GameManager.Instance.ShowTips("看来今天是没什么人了！");
        }
    }

    NextPlot() {
        if (WBSRL_GameManager.Instance.Plots.length <= 0) return;
        const curPrefab: Prefab = WBSRL_GameManager.Instance.Plots.shift();
        const node = instantiate(curPrefab);
        node.parent = this.PlotParent;
        node.setPosition(Vec3.ZERO);
        this.Curlot = node.getComponent(WBSRL_Pot);
        this.isClick = true;
        WBSRL_Joystick.Instance.node.active = false;
        this.Click();
    }

    Click() {
        if (!this.isClick) return;
        if (!this.Curlot) return;
        if (this.Monologue.IsPlaying) return;
        if (this.SelectNode.active) this.SelectNode.active = false;
        if (!this.Monologue.node.active) this.Monologue.node.active = true;
        const str: string[] = this.Curlot.GetNext();
        if (str[0] == "" && str[2] == "" && str[1] == "") {
            if (this.Curlot.BedNPC) {
                if (this.isOver) {
                    this.Leave();
                    return;
                }
                this.CheCkNode.active = true;
            } else if (this.Curlot.NPC) {
                this.Leave();
            } else if (!this.Curlot.ComeIn) {
                this.ISComeIn.active = true;
                this.isClick = false;
                this.Monologue.node.active = false;
            } else {
                this.ComeIn();
            }
        } else if (str[0] == "" && str[1] != "" && str[2] != "") {
            this.SelectNode.active = true;
            this.Select1.string = str[1];
            this.Select2.string = str[2];
            this.isClick = false;
        } else {
            this.Monologue.playText(str[0]);
        }
    }

    OnClick() {
        this.isClick = true;
        this.Click();
    }

    ComeIn() {
        this.ISComeIn.active = false;
        WBSRL_GameManager.Instance.AddGuest(this.Curlot.Room, this.Curlot.PrefabInRoom);
        this.isClick = false;
        this.Monologue.node.active = false;
        this.Curlot.node.destroy();
        this.Curlot = null;
        WBSRL_Joystick.Instance.node.active = true;
    }

    Leave() {
        this.ISComeIn.active = false;
        this.isClick = false;
        this.Monologue.node.active = false;
        this.Curlot.node.destroy();
        this.Curlot = null;
        WBSRL_Joystick.Instance.node.active = true;
    }

    OnButtonClick(event: EventTouch) {
        switch (event.getCurrentTarget().name) {
            case "不是一个人":
                this.isOver = true;
                this.Curlot.String.push("你今晚很幸运。");
                this.Curlot.String.push("我能听见有人在你房间里窃窃私语。");
                this.Curlot.String.push("但谁知道明天会发生什。");
                this.CheCkNode.active = false;
                this.Click();
                break;
            case "一个人":
                this.CheCkNode.active = false;
                this.Monologue.node.active = false;
                WBSRL_GameManager.Instance.GameOver1();
                break;
        }
    }
}