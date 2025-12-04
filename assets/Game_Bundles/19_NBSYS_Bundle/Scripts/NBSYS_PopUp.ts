import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('NBSYS_PopUp')
export class NBSYS_PopUp extends Component {
    private _callback: Function = null;
    Show(callback: Function, text: string) {
        this._callback = callback;
        this.node.getChildByPath("主/文本").getComponent(Label).string = text;
    }
    OnYesClick() {
        this.node.active = false;
        if (this._callback) {
            this._callback();
        }
    }
    OnNoClick() {
        this.node.active = false;
    }

}


