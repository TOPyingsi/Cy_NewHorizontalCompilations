import { _decorator, Component, Node } from 'cc';
import { XYRZZ_Panel, XYRZZ_UIManager } from './XYRZZ_UIManager';

import { XYRZZ_GameManager } from './Game/XYRZZ_GameManager';
import { XYRZZ_AudioManager } from './XYRZZ_AudioManager';
import Banner from '../../../Scripts/Banner';
const { ccclass, property } = _decorator;

@ccclass('XYRZZ_AutomationPanel')
export class XYRZZ_AutomationPanel extends Component {
    Show() {

    }
    //关闭
    public onExitClick() {
        XYRZZ_AudioManager.globalAudioPlay("鼠标嘟");
        XYRZZ_UIManager.Instance.HidePanel(XYRZZ_Panel.XYRZZ_AutomationPanel);
    }
    //点击获取按钮
    public onGetTimeClick() {
        XYRZZ_AudioManager.globalAudioPlay("鼠标嘟");
        Banner.Instance.ShowVideoAd(() => {
            XYRZZ_GameManager.Instance.AutomationTime += 600;
            XYRZZ_UIManager.HopHint("获得600S自动点击时间！");
            XYRZZ_UIManager.Instance.HidePanel(XYRZZ_Panel.XYRZZ_AutomationPanel);
        })
    }
}


