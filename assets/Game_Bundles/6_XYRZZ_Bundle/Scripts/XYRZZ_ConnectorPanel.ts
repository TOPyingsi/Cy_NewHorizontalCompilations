import { _decorator, Component, Label, Node } from 'cc';
import { XYRZZ_Panel, XYRZZ_UIManager } from './XYRZZ_UIManager';

import { XYRZZ_GameData } from './XYRZZ_GameData';
import { XYRZZ_GameManager } from './Game/XYRZZ_GameManager';
import { XYRZZ_AudioManager } from './XYRZZ_AudioManager';
import Banner from '../../../Scripts/Banner';
const { ccclass, property } = _decorator;

@ccclass('XYRZZ_ConnectorPanel')
export class XYRZZ_ConnectorPanel extends Component {
    Show() {
        this.ShowText();

    }
    //点击关闭按钮
    OnExitClick() {
        XYRZZ_AudioManager.globalAudioPlay("鼠标嘟");
        XYRZZ_UIManager.Instance.HidePanel(XYRZZ_Panel.XYRZZ_ConnectorPanel);
    }

    //点击获取按钮
    OnGetClick() {
        XYRZZ_AudioManager.globalAudioPlay("鼠标嘟");
        Banner.Instance.ShowVideoAd(() => {
            XYRZZ_GameData.Instance.GameData[3] += 2;
            XYRZZ_GameManager.Instance.OtherUIShow();
            XYRZZ_UIManager.HopHint("连点器升级成功！");
            this.ShowText();
        }, 1)
    }
    //刷新文本
    ShowText() {
        this.node.getChildByPath("框/描述").getComponent(Label).string = `已经获得用久${XYRZZ_GameData.Instance.GameData[3]}倍点击功能\n再次观看视频可以获得${XYRZZ_GameData.Instance.GameData[3] + 2}倍点击功能`;
    }
}


