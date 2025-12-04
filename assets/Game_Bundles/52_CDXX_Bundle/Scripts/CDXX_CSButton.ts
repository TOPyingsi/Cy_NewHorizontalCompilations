import { _decorator, Component, Enum, EventTouch, find, Node, tween, Tween, v3, Vec3 } from 'cc';
import { CDXX_BG, CDXX_BG_TYPE } from './CDXX_Constant';
import { CDXX_EventManager, CDXX_MyEvent } from './CDXX_EventManager';
import { CDXX_GameData } from './CDXX_GameData';
import { CDXX_GameManager } from './CDXX_GameManager';
const { ccclass, property } = _decorator;

@ccclass('CDXX_CSButton')
export class CDXX_CSButton extends Component {

    Button1: Node = null;
    Button2: Node = null;
    Icon: Node = null;

    Name: string = "";

    private _isClick: boolean = false;
    private _initPos: Vec3[] = [
        v3(-70, 0, 0),
        v3(70, 0, 0),
    ]

    private _targetPos: Vec3[] = [
        v3(-70, -110, 0),
        v3(70, -110, 0),
    ]

    private _tips: Node = null;
    protected onLoad(): void {
        this.Button1 = find("下层", this.node);
        this.Button2 = find("上层", this.node);
        this.Icon = find("Icon", this.node);
        this.Name = this.node.name;

        if (this.Name === "凡界") {
            this._tips = find("Tips", this.node);
            CDXX_EventManager.on(CDXX_MyEvent.CDXX_TIPS_SHOW, this.ShowTips, this);
        }

        this.Icon.on(Node.EventType.TOUCH_START, this.Click, this);
    }

    protected onEnable(): void {
        CDXX_EventManager.on(CDXX_MyEvent.CDXX_CS_BUTTON_SHOW, this.Show, this);
    }

    Show(name: string) {
        name == this.Name ? this.ShowButton() : this.CloseButton();
    }

    ShowButton() {
        this._isClick = true;
        Tween.stopAllByTarget(this.Button1);
        tween(this.Button1)
            .to(0.5, { position: this._targetPos[0] }, { easing: `sineIn` })
            .start();

        Tween.stopAllByTarget(this.Button2);
        tween(this.Button2)
            .to(0.5, { position: this._targetPos[1] }, { easing: `sineIn` })
            .start();
    }

    CloseButton() {
        this._isClick = false;
        Tween.stopAllByTarget(this.Button1);
        tween(this.Button1)
            .to(0.5, { position: this._initPos[0] }, { easing: `sineIn` })
            .start();

        Tween.stopAllByTarget(this.Button2);
        tween(this.Button2)
            .to(0.5, { position: this._initPos[1] }, { easing: `sineIn` })
            .start();
    }

    Click() {
        if (this.Name === "凡界" && this._tips.active) this._tips.active = false;
        this._isClick ? this.CloseButton() : CDXX_EventManager.Scene.emit(CDXX_MyEvent.CDXX_CS_BUTTON_SHOW, this.Name);;
    }

    OnButtonClick(event: EventTouch) {
        const name = this.Name + '_' + event.target.name;
        const map = CDXX_BG[name];
        if (map == CDXX_GameData.Instance.CurMap) return;
        CDXX_GameManager.Instance.ShowCSPanel(map);
        this.CloseButton();
    }

    ShowTips() {
        this._tips.active = true;
        tween(this._tips)
            .by(0.5, { scale: v3(-0.3, -0.3, -0.3) }, { easing: `sineIn` })
            .by(0.5, { scale: v3(0.3, 0.3, 0.3) }, { easing: `sineIn` })
            .delay(1)
            .union()
            .repeatForever()
            .start();
    }

}


