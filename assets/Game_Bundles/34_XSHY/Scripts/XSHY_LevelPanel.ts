import { _decorator, Component, Label, Node, Sprite } from 'cc';
import { XSHY_GameData } from './XSHY_GameData';
const { ccclass, property } = _decorator;

@ccclass('XSHY_LevelPanel')
export class XSHY_LevelPanel extends Component {
    protected onEnable(): void {
        this.Show();
    }

    Show() {
        let LV = Math.floor(XSHY_GameData.Instance.GameData[0] / 100) + 1;
        let Exp = Math.floor(XSHY_GameData.Instance.GameData[0] % 100);
        this.node.getChildByName("LV").getComponent(Label).string = `LV:${LV}`;
        this.node.getChildByName("经验条").getComponent(Sprite).fillRange = Exp / 100;
    }
}


