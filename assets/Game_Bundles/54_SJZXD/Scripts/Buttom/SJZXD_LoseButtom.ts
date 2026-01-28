import { _decorator, Component, director, Node } from 'cc';
import { SJZXD_EventManager } from '../SJZXD_EventManager';
import { SJZXD_GameData } from '../SJZXD_GameData';
import { SJZXD_AudioManager } from '../SJZXD_AudioManager';
import Banner from 'db://assets/Scripts/Banner';
const { ccclass, property } = _decorator;

@ccclass('SJZXD_LoseButtom')
export class SJZXD_LoseButtom extends Component {
    start() {
        director.getScene().on(SJZXD_EventManager.找回遗失, this.GetLostButtonVisible, this);
        this.GetLostButtonVisible();
    }

    //判断遗失按钮显隐
    public GetLostButtonVisible() {
        if (SJZXD_GameData.Instance.GameData[2] == 0) {
            this.node.active = true;
        } else {
            this.node.active = false;
        }
    }
    Onclick() {
        Banner.Instance.ShowVideoAd(() => {
            SJZXD_AudioManager.globalAudioPlay("点击");
            SJZXD_GameData.Instance.GetLostDataProp();
        })
    }
}


