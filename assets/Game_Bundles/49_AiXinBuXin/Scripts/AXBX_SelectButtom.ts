import { _decorator, Component, director, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AXBX_SelectButtom')
export class AXBX_SelectButtom extends Component {
    private _State: string = "";
    Init(State: string) {
        this._State = State;
        this.node.getChildByName("Label").getComponent(Label).string = State;
    }
    OnClick() {
        director.getScene().emit("爱信不信_执行行为", this._State);
        this.node.destroy();
    }
}


