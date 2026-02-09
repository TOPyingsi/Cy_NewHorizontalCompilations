import { _decorator, Component, Label, Node, Sprite } from 'cc';
import { ATZJ_GameData } from './ATZJ_GameData';
const { ccclass, property } = _decorator;

@ccclass('ATZJ_LevelPanel')
export class ATZJ_LevelPanel extends Component {
    protected onEnable(): void {
        this.Show();
    }

    Show() {
        let LV = Math.floor(ATZJ_GameData.Instance.GameData[0] / 100) + 1;
        let Exp = Math.floor(ATZJ_GameData.Instance.GameData[0] % 100);
        this.node.getChildByName("LV").getComponent(Label).string = `LV:${LV}`;
        this.node.getChildByName("经验条").getComponent(Sprite).fillRange = Exp / 100;
    }
}


