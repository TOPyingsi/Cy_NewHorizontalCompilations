import { _decorator, Component, director, Node } from 'cc';
import { SJZGMMT_EventManager } from '../SJZGMMT_EventManager';
import { SJZGMMT_GameData } from '../SJZGMMT_GameData';
import { SJZGMMT_AudioManager } from '../SJZGMMT_AudioManager';
import Banner from 'db://assets/Scripts/Banner';
const { ccclass, property } = _decorator;

@ccclass('SJZGMMT_LoseButtom')
export class SJZGMMT_LoseButtom extends Component {
    start() {
        director.getScene().on(SJZGMMT_EventManager.找回遗失, this.GetLostButtonVisible, this);
        this.GetLostButtonVisible();
    }

    //判断遗失按钮显隐
    public GetLostButtonVisible() {
        if (SJZGMMT_GameData.Instance.GameData[2] == 0) {
            this.node.active = true;
        } else {
            this.node.active = false;
        }
    }
    Onclick() {
        Banner.Instance.ShowVideoAd(() => {
            SJZGMMT_AudioManager.globalAudioPlay("点击");
            SJZGMMT_GameData.Instance.GetLostDataProp();
        })
    }
}


