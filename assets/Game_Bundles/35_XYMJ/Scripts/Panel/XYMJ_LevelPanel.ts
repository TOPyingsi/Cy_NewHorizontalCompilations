import { _decorator, Component, director, Label, Node } from 'cc';
import { XYMJ_GameData } from '../XYMJ_GameData';
import { XYMJ_Incident } from '../XYMJ_Incident';
import Banner from '../../../../Scripts/Banner';
import { UIManager } from '../../../../Scripts/Framework/Managers/UIManager';
const { ccclass, property } = _decorator;

@ccclass('XYMJ_LevelPanel')
export class XYMJ_LevelPanel extends Component {
    start() {
        director.getScene().on("等级修改", this.updateLevel, this);
        this.updateLevel();

    }
    protected onEnable(): void {
        this.updateLevel();
    }

    //同步等级
    updateLevel() {
        this.node.getChildByName("年纪").getComponent(Label).string = "当前：" + XYMJ_GameData.Instance.GameData[0] + "年级";
    }

}


