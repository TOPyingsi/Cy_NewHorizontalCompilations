import { _decorator, Component, Node } from 'cc';
import { XYMJXXB_GameData } from '../XYMJXXB_GameData';
import { UIManager } from '../../../../Scripts/Framework/Managers/UIManager';
import { XYMJXXB_AudioManager } from '../XYMJXXB_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XYMJXXB_ConversionJY')
export class XYMJXXB_ConversionJY extends Component {
    start() {

    }

    onExit() {
        XYMJXXB_AudioManager.globalAudioPlay("点击");
        this.node.active = false;
    }
    //兑换
    onConversion() {
        XYMJXXB_AudioManager.globalAudioPlay("点击");
        if (XYMJXXB_GameData.Instance.GetPropNum("校长的金牙") > 0) {
            XYMJXXB_GameData.Instance.SubKnapsackData("校长的金牙", 1);
            XYMJXXB_GameData.Instance.ChanggeGoldBar(2888);
            UIManager.ShowTip("兑换成功！");
        } else {
            UIManager.ShowTip("背包中没有校长的金牙！");
        }

    }
}


