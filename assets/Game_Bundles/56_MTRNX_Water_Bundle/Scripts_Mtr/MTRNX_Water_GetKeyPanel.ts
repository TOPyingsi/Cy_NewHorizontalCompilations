import { _decorator, Animation, Component, Label, Node, tween, UIOpacity } from 'cc';
import { MTRNX_Water_GameManager } from './MTRNX_Water_GameManager';

const { ccclass, property } = _decorator;

@ccclass('MTRNX_Water_GetKeyPanel')
export class MTRNX_Water_GetKeyPanel extends Component {


    start() {
        this.node.getChildByName("KeyButton").getChildByName("Label").getComponent(Label).string = MTRNX_Water_GameManager.Key + '';
        this.node.getComponent(Animation).play("获得钥匙");
        this.scheduleOnce(() => {
            this.node.getChildByName("钥匙").active = false;
            MTRNX_Water_GameManager.Key += 1;
            this.node.getChildByName("KeyButton").getChildByName("Label").getComponent(Label).string = MTRNX_Water_GameManager.Key + '';
            tween(this.node.getChildByName("KeyButton").getComponent(UIOpacity))
                .to(0.8, { opacity: 0 })
                .start();
            this.scheduleOnce(() => {
                this.node.destroy();
            }, 1)
        }, 0.97)
    }


}


