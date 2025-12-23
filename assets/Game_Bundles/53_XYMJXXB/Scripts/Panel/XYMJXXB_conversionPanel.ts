import { _decorator, Component, EventTouch, Node } from 'cc';
import { XYMJXXB_GameData } from '../XYMJXXB_GameData';
import { UIManager } from '../../../../Scripts/Framework/Managers/UIManager';
import { XYMJXXB_AudioManager } from '../XYMJXXB_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XYMJXXB_conversionPanel')
export class XYMJXXB_conversionPanel extends Component {
    public static conversionPanelIndex: number = 0;
    start() {

    }
    protected onEnable(): void {
        this.node.getChildByName("Content").children.forEach((element, index) => {
            element.active = index == XYMJXXB_conversionPanel.conversionPanelIndex;
        });
    }
    OnbuttomClick(btn: EventTouch) {
        XYMJXXB_AudioManager.globalAudioPlay("点击");
        switch (btn.target.name) {
            case "返回":
                this.node.active = false;
                break;
            case "兑换1":
                this.conversion("机器人核心", 28, "机器装甲");
                break;
            case "兑换2":
                this.conversion("尾巴", 28, "橙狐狸");
                break;
            case "兑换3":
                this.conversion("兔子", 28, "兔女郎");
                break;
            case "兑换4":
                this.conversion("龙蛋", 28, "龙宝");
                break;
        }
    }


    //兑换皮肤
    conversion(demandName: string, demandnum: number, skin: string) {
        if (XYMJXXB_GameData.Instance.SkinData.indexOf(skin) != -1) {
            UIManager.ShowTip("你已拥有改皮肤！");
            return;
        }
        if (XYMJXXB_GameData.Instance.SubKnapsackData(demandName, demandnum)) {
            XYMJXXB_GameData.Instance.SkinData.push(skin);
            UIManager.ShowTip("兑换成功！");
        } else {
            UIManager.ShowTip("背包中缺少道具！");
        }
    }
}


