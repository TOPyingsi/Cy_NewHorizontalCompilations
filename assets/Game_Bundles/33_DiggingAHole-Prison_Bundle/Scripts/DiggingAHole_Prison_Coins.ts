import { _decorator, Component, director, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('DiggingAHole_Prison_Coins')
export class DiggingAHole_Prison_Coins extends Component {
    start() {
        this.node.getChildByName("Label").getComponent(Label).string = localStorage.getItem("DAHCV_Coins");
        director.getScene().on("掘地求财_刷新金钱", (coins: number) => {
            this.node.getChildByName("Label").getComponent(Label).string = `${coins}`;
        });
    }


}


