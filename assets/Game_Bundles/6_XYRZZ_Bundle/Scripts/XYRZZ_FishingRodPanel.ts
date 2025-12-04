import { _decorator, Component, EventTouch, Label, Node } from 'cc';
import { XYRZZ_Panel, XYRZZ_UIManager } from './XYRZZ_UIManager';

import { XYRZZ_GameData } from './XYRZZ_GameData';
import { XYRZZ_GameManager } from './Game/XYRZZ_GameManager';
import { XYRZZ_EventManager, XYRZZ_MyEvent } from './XYRZZ_EventManager';
import { XYRZZ_AudioManager } from './XYRZZ_AudioManager';
import Banner from '../../../Scripts/Banner';
const { ccclass, property } = _decorator;

@ccclass('XYRZZ_FishingRodPanel')
export class XYRZZ_FishingRodPanel extends Component {
    @property(Node)
    Content: Node = null;

    Show() {
        this.ShowUI();
    }

    //按钮事件
    OnbuttonClick(btn: EventTouch) {
        XYRZZ_AudioManager.globalAudioPlay("鼠标嘟");
        switch (btn.target.name) {
            case "叉号":
                XYRZZ_UIManager.Instance.HidePanel(XYRZZ_Panel.XYRZZ_FishingRodPanel);
                break;
            case "解锁0":
            case "解锁1":
            case "解锁2":
            case "解锁3":
            case "解锁4":
                this.UnLookFishingRod(Number(btn.target.name.charAt(2)));
                break;
            case "使用0":
            case "使用1":
            case "使用2":
            case "使用3":
            case "使用4":
                this.SetFishingRod(Number(btn.target.name.charAt(2)));
                break;
            case "0":
            case "1":
            case "2":
            case "3":
            case "4":
                this.OnFishingRodClick(Number(btn.target.name));
                break;
        }

    }
    //使用鱼竿
    SetFishingRod(id: number) {
        XYRZZ_GameData.Instance.GameData[1] = id;
        XYRZZ_GameManager.Instance.SetMainPlayer();
        XYRZZ_UIManager.HopHint("使用成功！");
        this.ShowUI();
    }

    //解锁鱼竿
    UnLookFishingRod(id: number) {
        Banner.Instance.ShowVideoAd(() => {
            XYRZZ_GameData.Instance.FishingPoleLevel[id].Level = 1;
            XYRZZ_UIManager.HopHint("鱼竿解锁成功！");
            this.ShowUI();
            XYRZZ_EventManager.Scene.emit(XYRZZ_MyEvent.改变战力);
        })
    }

    //界面刷新
    ShowUI() {
        this.Content.children.forEach((cd, index) => {
            cd.getChildByName("等级").getComponent(Label).string = `LV.${XYRZZ_GameData.Instance.FishingPoleLevel[index].Level}`;
            cd.getChildByName("使用中").active = XYRZZ_GameData.Instance.GameData[1] == index;
            cd.getChildByName("解锁" + index).active = XYRZZ_GameData.Instance.FishingPoleLevel[index].Level == 0;
            cd.getChildByName("使用" + index).active = XYRZZ_GameData.Instance.GameData[1] != index && XYRZZ_GameData.Instance.FishingPoleLevel[index].Level != 0;
        })
    }

    //点击鱼竿
    OnFishingRodClick(id: number) {
        if (XYRZZ_GameData.Instance.FishingPoleLevel[id].Level > 0) {
            XYRZZ_UIManager.Instance.ShowPanel(XYRZZ_Panel.XYRZZ_FishingRodMessage, [id]);
        } else {
            XYRZZ_UIManager.HopHint("请先解锁鱼竿！");
        }
    }
}


