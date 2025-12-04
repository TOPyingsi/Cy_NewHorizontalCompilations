import { _decorator, Component, director, EventTouch, Label, Node, Sprite, SpriteFrame, tween, UITransform, Vec3 } from 'cc';
import { WBSRL_Monologue } from './WBSRL_Monologue';
import { WBSRL_Joystick } from './WBSRL_Joystick';
import { WBSRL_GameManager } from './WBSRL_GameManager';
const { ccclass, property } = _decorator;

@ccclass('WBSRL_PlotInRoom')
export class WBSRL_PlotInRoom extends Component {

    @property({ type: String })
    String: String[] = [];

    @property({ type: String })
    Select: String[] = [];

    @property({ type: String })
    StringSelect1: String[] = [];

    @property({ type: String })
    StringSelect2: String[] = [];

    @property(WBSRL_Monologue)
    Monologue: WBSRL_Monologue = null;

    @property(Node)
    SelectNode: Node = null;

    @property(Label)
    Select1: Label = null;

    @property(Label)
    Select2: Label = null;

    @property(Node)
    Icons: Node[] = [];

    @property(Node)
    CheckNode: Node = null;

    @property(Node)
    Judgment: Node = null;

    @property(Node)
    CheckedNode: Node = null;

    @property(Node)
    Hand: Node = null;

    @property(Node)
    HandIcon: Node = null;

    @property(SpriteFrame)
    DieSF: SpriteFrame = null;

    @property(SpriteFrame)
    SFs: SpriteFrame[] = [];

    @property(Sprite)
    Sprites: Sprite[] = [];

    @property(Node)
    Mouth: Node = null;

    @property(Node)
    Eyes: Node = null;

    @property
    IsFirst: boolean = false;

    @property
    IsHuman: boolean = true;

    CurString: String[] = [];

    private isClick: boolean = false;
    private isCheck: boolean = false;
    private isDie: boolean = false;

    Init() {
        if (this.Sprites.length == this.SFs.length) {
            for (let i = 0; i < this.Sprites.length; i++) {
                this.Sprites[i].spriteFrame = this.SFs[i];
            }
        }
    }

    GetNext(): string[] {
        if (this.CurString.length <= 0) {
            return ["", "", ""]
        }
        const str: string = this.CurString.shift().toString();
        if (str[0] == "_") {
            return ["", this.Select[Number(str[1])].toString(), this.Select[Number(str[3])].toString()]
        }
        return [str, "", ""];
    }

    Click() {
        if (!this.isClick) return;
        if (this.Monologue.IsPlaying) return;
        if (this.SelectNode.active) this.SelectNode.active = false;
        if (!this.Monologue.node.active) this.Monologue.node.active = true;
        const str: string[] = this.GetNext();
        if (str[0] == "" && str[2] == "" && str[1] == "") {
            if (this.isCheck) {
                this.ShowCheck();
                return;
            }
            this.isClick = false;
            this.Monologue.node.active = false;
            this.Icons[0].active = true;
            this.Icons[1].active = false;
            WBSRL_Joystick.Instance.node.active = true;
        } else if (str[0] == "" && str[1] != "" && str[2] != "") {
            this.SelectNode.active = true;
            this.Select1.string = str[1];
            this.Select2.string = str[2];
            // this.isClick = false;
        } else {
            this.Monologue.playText(str[0]);
        }
    }

    ClickIcon() {
        if (this.isDie) return;
        if (this.IsFirst) {
            this.IsFirst = false;
            WBSRL_GameManager.Instance.IsClickBX = true;
            WBSRL_GameManager.Instance.ArrRemoveName.push(this.node.name);
        }
        if (WBSRL_GameManager.Instance.Power <= 0) {
            WBSRL_GameManager.Instance.ShowTips("没有体力了！");
            return;
        }
        WBSRL_GameManager.Instance.Power--;
        WBSRL_GameManager.Instance.ShowPower();
        this.Icons[0].active = false;
        this.Icons[1].active = true;
        this.isClick = true;
        this.CurString = this.CloneString(this.String);
        this.Click();
        WBSRL_Joystick.Instance.node.active = false;
    }

    CloneString(target: String[]) {
        const out = [];
        target.forEach(e => out.push(e));
        return out;
    }

    OnButtonClick(event: EventTouch) {
        switch (event.getCurrentTarget().name) {
            case "Select1":
                this.CurString = this.CloneString(this.StringSelect1);
                this.Click();
                break;
            case "Select2":
                this.CurString = this.CloneString(this.StringSelect2);
                this.Click();
                break;
            case "Select3":
                this.CurString = ["你想检查什么？"]
                this.isCheck = true;
                this.Click();
                break;
            case "Check1":
                this.CheckMouth();
                break;
            case "Check2":
                this.CheCkHand();
                break;
            case "Check3":
                this.CheckEyes();
                break;
            case "放过":
                WBSRL_GameManager.Instance.GunController.ClosedGun(() => {
                    this.Judgment.active = false;
                    this.Icons[0].active = true;
                    this.Icons[1].active = false;
                    WBSRL_Joystick.Instance.node.active = true;
                });
                break;
            case "开枪":
                WBSRL_GameManager.Instance.GunController.ShotGun(() => {
                    this.isDie = true;
                    this.Judgment.active = false;
                    this.Icons[1].active = false;
                    this.Icons[0].getComponent(Sprite).spriteFrame = this.DieSF;
                    this.Icons[0].active = true;
                    WBSRL_GameManager.Instance.ArrRemoveName.push(this.node.name);
                    WBSRL_Joystick.Instance.node.active = true;
                });
                break;
        }
    }

    ShowCheck() {
        this.CheckNode.active = true;
        if (WBSRL_GameManager.Instance.CurDay == 1) {
            this.CheckNode.children[0].active = true;
            this.CheckNode.children[1].active = false;
            this.CheckNode.children[2].active = false;
        } else if (WBSRL_GameManager.Instance.CurDay == 2) {
            this.CheckNode.children[0].active = true;
            this.CheckNode.children[1].active = true;
            this.CheckNode.children[2].active = false;
        } else {
            this.CheckNode.children[0].active = true;
            this.CheckNode.children[1].active = true;
            this.CheckNode.children[2].active = true;
        }
    }

    CheckMouth() {
        this.Monologue.node.active = false;
        this.CheckNode.active = false;
        this.isClick = false;
        this.CheckedNode.active = true;
        this.Mouth.active = true;
        this.scheduleOnce(() => {
            this.Mouth.active = false;
            this.CheckedNode.active = false;
            WBSRL_GameManager.Instance.GunController.DrawGun(() => {
                this.Judgment.active = true;
            });
        }, 4)
    }

    CheCkHand() {
        this.Monologue.node.active = false;
        this.CheckNode.active = false;
        this.isClick = false;
        this.CheckedNode.active = true;
        this.Hand.active = true;
        if (this.HandIcon) {
            const y = this.HandIcon.getComponent(UITransform).height
            tween(this.HandIcon)
                .by(1, { y: y }, { easing: `smooth` })
                .delay(2)
                .by(1, { y: -y }, { easing: `smooth` })
                .call(() => {
                    this.Hand.active = false;
                    this.CheckedNode.active = false;
                    WBSRL_GameManager.Instance.GunController.DrawGun(() => {
                        this.Judgment.active = true;
                    });
                })
                .start();
        }
    }

    CheckEyes() {
        this.Monologue.node.active = false;
        this.CheckNode.active = false;
        this.isClick = false;
        this.CheckedNode.active = true;
        this.Eyes.active = true;
        this.scheduleOnce(() => {
            this.Eyes.active = false;
            this.CheckedNode.active = false;
            WBSRL_GameManager.Instance.GunController.DrawGun(() => {
                this.Judgment.active = true;
            });
        }, 4)
    }

}


