import { _decorator, clamp, Component, director, EventTouch, Label, Node, UITransform, v3, Vec2, Vec3 } from 'cc';
import { DiggingAHole_Prison_Audio } from './DiggingAHole_Prison_Audio';
import { DiggingAHole_Prison_PlayerController } from './DiggingAHole_Prison_PlayerController';
const { ccclass, property } = _decorator;

@ccclass('DiggingAHoleCV_SellPanel')
export class DiggingAHoleCV_SellPanel extends Component {

    @property(Label)
    coinLabel: Label;

    @property(Label)
    allLabel: Label;

    @property(Node)
    layout: Node;

    @property(Node)
    sell: Node;

    allNum = 0;

    protected onEnable(): void {
        this.Init();
    }

    start() {
    }

    update(deltaTime: number) {

    }

    Init() {
        let coins = localStorage.getItem("DAHCV_Coins");
        if (coins != "" && coins != null) this.coinLabel.string = coins;
        else this.coinLabel.string = "0", localStorage.setItem("DAHCV_Coins", "0");
        let data = DiggingAHole_Prison_PlayerController.Instance.Treasures;
        this.allNum = 0;
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            if (element > 0) {
                let item = this.layout.children[i];
                item.active = true;
                item.children[0].getComponent(Label).string = element.toString();
                item.children[4].children[0].getComponent(Label).string = (element * (i + 1)).toString();
                this.allNum += element * (i + 1);
            }
            else this.layout.children[i].active = false;
        }
        this.sell.active = this.allNum != 0;
        this.allLabel.string = this.allNum.toString();
    }

    Back() {
        director.getScene().emit("掘地求财_关闭商店");
        this.node.active = false;
    }

    Sell() {
        let coins = parseInt(localStorage.getItem("DAHCV_Coins"));
        coins += this.allNum;
        localStorage.setItem("DAHCV_Coins", coins.toString());
        director.getScene().emit("掘地求财_刷新金钱", coins);
        DiggingAHole_Prison_PlayerController.Instance.Treasures = [0, 0, 0, 0, 0, 0];
        this.Init();
        DiggingAHole_Prison_Audio.Instance.PlayAudio("sell");
    }
}


