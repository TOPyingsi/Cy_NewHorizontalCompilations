import { _decorator, Component, Label, Node, Sprite } from 'cc';
import { XSHZ_GameData } from './XSHZ_GameData';
const { ccclass, property } = _decorator;

@ccclass('XSHZ_LevelPanel')
export class XSHZ_LevelPanel extends Component {
    protected onEnable(): void {
        this.Show();
    }

    Show() {
        let LV = Math.floor(XSHZ_GameData.Instance.GameData[0] / 100) + 1;
        let Exp = Math.floor(XSHZ_GameData.Instance.GameData[0] % 100);
        this.node.getChildByName("LV").getComponent(Label).string = `LV:${LV}`;
        this.node.getChildByName("经验条").getComponent(Sprite).fillRange = Exp / 100;
    }
}


