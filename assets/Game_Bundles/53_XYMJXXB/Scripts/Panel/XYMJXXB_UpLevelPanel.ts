import { _decorator, Component, director, Label, Node } from 'cc';
import { XYMJXXB_GameData } from '../XYMJXXB_GameData';
import { UIManager } from '../../../../Scripts/Framework/Managers/UIManager';
import { XYMJXXB_AudioManager } from '../XYMJXXB_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XYMJXXB_UpLevelPanel')
export class XYMJXXB_UpLevelPanel extends Component {



    start() {
        this.ShowPanel();
    }

    ShowPanel() {
        let lv = XYMJXXB_GameData.Instance.GameData[0];
        let UpMoney = lv * lv * 100000;
        let level = this.GetLevel(lv);
        this.node.getChildByName("当前年级").getComponent(Label).string = `${level}${lv % 10}`;
        this.node.getChildByName("数量").getComponent(Label).string = `${UpMoney}`;
        this.node.getChildByName("升级后年级").getComponent(Label).string = `${level}${lv + 1}`;
        this.node.getChildByName("生命加成").getComponent(Label).string = `已加成:${lv * 100}`;
        this.node.getChildByName("出彩率加成").getComponent(Label).string = `已加成:${(lv / 100).toFixed(2)}%`;
    }
    OnUpClick() {
        XYMJXXB_AudioManager.globalAudioPlay("点击");
        let lv = XYMJXXB_GameData.Instance.GameData[0];
        let UpMoney = lv * lv * 100000;
        if (XYMJXXB_GameData.Instance.Money >= UpMoney) {
            XYMJXXB_GameData.Instance.ChanggeMoney(-UpMoney);
            XYMJXXB_GameData.Instance.GameData[0]++;
            this.ShowPanel();
            UIManager.ShowTip("升级成功！")
            director.getScene().emit("等级修改");
        } else {
            UIManager.ShowTip("钞票不足！");
        }
    }

    OnExit() {
        XYMJXXB_AudioManager.globalAudioPlay("点击");
        this.node.active = false;

    }

    //根据等级返回段位
    GetLevel(level: number): string {
        if (level <= 10) {
            return "筑基期";
        } else if (level <= 20) {
            return "金丹期";
        } else if (level <= 30) {
            return "元婴期";
        } else if (level <= 40) {
            return "化神期";
        } else if (level <= 50) {
            return "炼虚期";
        } else if (level <= 60) {
            return "合体期";
        } else if (level <= 70) {
            return "大乘期";
        } else {
            return "飞升期";
        }
    }
}


