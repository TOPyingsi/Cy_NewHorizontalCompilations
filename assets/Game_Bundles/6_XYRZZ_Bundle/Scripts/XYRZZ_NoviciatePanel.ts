import { _decorator, Button, Component, Label, Node, Sprite } from 'cc';
import { XYRZZ_GameData } from './XYRZZ_GameData';

import { XYRZZ_EventManager, XYRZZ_MyEvent } from './XYRZZ_EventManager';
import { XYRZZ_Panel, XYRZZ_UIManager } from './XYRZZ_UIManager';
import { XYRZZ_AudioManager } from './XYRZZ_AudioManager';
import Banner from '../../../Scripts/Banner';
const { ccclass, property } = _decorator;

@ccclass('XYRZZ_NoviciatePanel')
export class XYRZZ_NoviciatePanel extends Component {
    public num = 0;
    Show() {
        this.num = XYRZZ_GameData.Instance.GameData[4];
        this.ShowUI();
    }

    //刷新UI
    ShowUI() {
        this.node.getChildByPath("框/剩余次数").getComponent(Label).string = `次数：${this.num}/10`;
        if (this.num == 10) {
            this.node.getChildByPath("框/升级").getComponent(Button).enabled = false;
            this.node.getChildByPath("框/升级").getComponent(Sprite).grayscale = true;
        }
    }

    //点击观看视频
    OnVideoClick() {
        XYRZZ_AudioManager.globalAudioPlay("鼠标嘟");
        Banner.Instance.ShowVideoAd(() => {
            XYRZZ_GameData.Instance.GameData[2] += 40;
            XYRZZ_EventManager.Scene.emit(XYRZZ_MyEvent.角色升级);
            XYRZZ_GameData.Instance.GameData[4] += 1;
            this.num += 1;
            this.ShowUI();
        })
    }

    //关闭
    OnExitClick() {
        XYRZZ_AudioManager.globalAudioPlay("鼠标嘟");
        XYRZZ_UIManager.Instance.HidePanel(XYRZZ_Panel.XYRZZ_NoviciatePanel);
    }
}


