import { _decorator, clamp, Component, EventTouch, Label, Node, UITransform, v3, Vec2, Vec3 } from 'cc';
import { DiggingAHole_Prison_PlayerController } from './DiggingAHole_Prison_PlayerController';
const { ccclass, property } = _decorator;

@ccclass('DiggingAHole_Prison_PackPanel')
export class DiggingAHole_Prison_PackPanel extends Component {

    @property(Label)
    coinLabel: Label;

    @property(Label)
    fillLabel: Label;

    @property(Node)
    layout: Node;

    protected onEnable(): void {
        this.Init();
    }

    start() {
    }

    update(deltaTime: number) {

    }

    Init() {
        let coins = localStorage.getItem("DAHCV_Coins");
        let fill = 40 + 10 * parseInt(localStorage.getItem("DAHCV_Fill"));
        if (coins != "" && coins != null) this.coinLabel.string = coins;
        else this.coinLabel.string = "0";
        let data = DiggingAHole_Prison_PlayerController.Instance.Treasures;
        let num = 0;
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            if (element > 0) {
                this.layout.children[i].active = true;
                this.layout.children[i].children[1].children[0].getComponent(Label).string = element.toString();
                num += element;
            }
            else this.layout.children[i].active = false;
        }
        this.fillLabel.string = `容量：${num}/${fill}`;
    }

    Back() {
        this.node.active = false;
    }
}


