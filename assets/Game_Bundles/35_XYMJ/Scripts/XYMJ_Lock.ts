import { _decorator, Component, Label, math, Node, tween, v3 } from 'cc';
import { XYMJ_GameManager } from './XYMJ_GameManager';
const { ccclass, property } = _decorator;

@ccclass('XYMJ_Lock')
export class XYMJ_Lock extends Component {

    public keyName: string = "";
    keyLabel: Label = null;
    start() {
        this.keyLabel = this.node.getChildByName("keyName").getComponent(Label);

        this.keyName = this.keyLabel.string;
        switch (this.keyName) {
            case "102教室":
            case "杂物间":
            case "教师办公室":
                this.keyName = this.keyName + "钥匙";
        }

    }

    update(deltaTime: number) {

    }

    openDoor() {

        this.keyLabel.node.active = false;

        let randomX = math.randomRange(-1, 1) * 50;

        tween(this.node)
            .by(2, { eulerAngles: v3(0, 0, 2160) })
            .start();

        tween(this.node)
            .by(0.5, { position: v3(randomX, 50, 0) }, { easing: "backInOut" })
            .by(1, { position: v3(0, -2500, 0) }, { easing: "circIn" })
            .call(() => {
                this.node.destroy();
            })
            .start();

        XYMJ_GameManager.Instance.gameBagTs.openDoor(this.keyName);
    }
}


