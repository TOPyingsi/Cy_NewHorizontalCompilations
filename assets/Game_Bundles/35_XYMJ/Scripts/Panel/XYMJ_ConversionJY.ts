import { _decorator, Component, Node } from 'cc';
import { XYMJ_GameData } from '../XYMJ_GameData';
import { UIManager } from '../../../../Scripts/Framework/Managers/UIManager';
import { XYMJ_AudioManager } from '../XYMJ_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XYMJ_ConversionJY')
export class XYMJ_ConversionJY extends Component {
    start() {

    }

    onExit() {
        XYMJ_AudioManager.globalAudioPlay("点击");
        this.node.active = false;
    }
    //兑换
    onConversion() {
        XYMJ_AudioManager.globalAudioPlay("点击");
        if (XYMJ_GameData.Instance.GetPropNum("校长的金牙") > 0) {
            XYMJ_GameData.Instance.SubKnapsackData("校长的金牙", 1);
            XYMJ_GameData.Instance.ChanggeGoldBar(2888);
            UIManager.ShowTip("兑换成功！");
        } else {
            UIManager.ShowTip("背包中没有校长的金牙！");
        }

    }
}


