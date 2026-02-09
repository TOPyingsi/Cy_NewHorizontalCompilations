import { _decorator, Component, director, Label, Node, tween } from 'cc';
import { SJZGMMT_EventManager } from '../SJZGMMT_EventManager';
const { ccclass, property } = _decorator;

@ccclass('SJZGMMT_AttackPatternButtom')
export class SJZGMMT_AttackPatternButtom extends Component {
    private _AttackPattern: number = 0;//攻击模式(0锁定1自由)
    start() {

    }
    OnClick() {
        this._AttackPattern = this._AttackPattern == 0 ? 1 : 0;
        tween(this.node.getChildByName("圆"))
            .to(0.25, { x: this._AttackPattern == 0 ? -38 : 38 }, { easing: "backOut" })
            .start();
        this.node.getChildByName("描述").x = this._AttackPattern == 0 ? 25 : -25
        this.node.getChildByName("绿底").active = this._AttackPattern == 0 ? true : false;
        this.node.getChildByName("描述").getComponent(Label).string = this._AttackPattern == 0 ? "自动" : "手动";
        director.getScene().emit(SJZGMMT_EventManager.攻击模式切换, this._AttackPattern);
    }

}


