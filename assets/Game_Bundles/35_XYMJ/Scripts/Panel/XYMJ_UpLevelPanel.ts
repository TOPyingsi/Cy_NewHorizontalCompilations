import { _decorator, Component, director, Label, Node } from 'cc';
import { XYMJ_GameData } from '../XYMJ_GameData';
import { UIManager } from '../../../../Scripts/Framework/Managers/UIManager';
import { XYMJ_AudioManager } from '../XYMJ_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XYMJ_UpLevelPanel')
export class XYMJ_UpLevelPanel extends Component {



    start() {
        this.ShowPanel();
    }

    ShowPanel() {
        let lv = XYMJ_GameData.Instance.GameData[0];
        let UpMoney = lv * lv * 100000;
        this.node.getChildByName("当前年级").getComponent(Label).string = `${lv}`;
        this.node.getChildByName("数量").getComponent(Label).string = `${UpMoney}`;
        this.node.getChildByName("升级后年级").getComponent(Label).string = `${lv + 1}`;
        this.node.getChildByName("生命加成").getComponent(Label).string = `已加成:${lv * 100}`;
        this.node.getChildByName("出彩率加成").getComponent(Label).string = `已加成:${(lv / 100).toFixed(2)}%`;
    }
    OnUpClick() {
        XYMJ_AudioManager.globalAudioPlay("点击");
        let lv = XYMJ_GameData.Instance.GameData[0];
        let UpMoney = lv * lv * 100000;
        if (XYMJ_GameData.Instance.Money >= UpMoney) {
            XYMJ_GameData.Instance.ChanggeMoney(-UpMoney);
            XYMJ_GameData.Instance.GameData[0]++;
            this.ShowPanel();
            UIManager.ShowTip("升级成功！")
            director.getScene().emit("等级修改");
        } else {
            UIManager.ShowTip("钞票不足！");
        }
    }

    OnExit() {
        XYMJ_AudioManager.globalAudioPlay("点击");
        this.node.active = false;

    }
}


