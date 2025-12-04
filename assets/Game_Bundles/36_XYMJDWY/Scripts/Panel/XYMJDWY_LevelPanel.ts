import { _decorator, Component, director, Label, Node } from 'cc';
import { XYMJDWY_GameData } from '../XYMJDWY_GameData';
const { ccclass, property } = _decorator;

@ccclass('XYMJDWY_LevelPanel')
export class XYMJDWY_LevelPanel extends Component {
    start() {
        director.getScene().on("等级修改", this.updateLevel, this);
        this.updateLevel();

    }
    protected onEnable(): void {
        this.updateLevel();
    }

    //同步等级
    updateLevel() {
        this.node.getChildByName("年纪").getComponent(Label).string = "当前：" + XYMJDWY_GameData.Instance.GameData[0] + "年级";
    }

}


