import { _decorator, Component, Node } from 'cc';

import { UIManager } from '../../../../Scripts/Framework/Managers/UIManager';
import { XYMJDWY_AudioManager } from '../XYMJDWY_AudioManager';
import { XYMJDWY_GameData } from '../XYMJDWY_GameData';

const { ccclass, property } = _decorator;

@ccclass('XYMJDWY_ConversionJY')
export class XYMJDWY_ConversionJY extends Component {
    start() {

    }

    onExit() {
        XYMJDWY_AudioManager.globalAudioPlay("点击");
        this.node.active = false;
    }
    //兑换
    onConversion() {
        XYMJDWY_AudioManager.globalAudioPlay("点击");
        if (XYMJDWY_GameData.Instance.GetPropNum("校长的金牙") > 0) {
            XYMJDWY_GameData.Instance.SubKnapsackData("校长的金牙", 1);
            XYMJDWY_GameData.Instance.ChanggeGoldBar(2888);
            UIManager.ShowTip("兑换成功！");
        } else {
            UIManager.ShowTip("背包中没有校长的金牙！");
        }

    }
}


