import { _decorator, Component, Label, Node } from 'cc';
import { XYRZZ_GameData } from './XYRZZ_GameData';
import { XYRZZ_Constant } from './Data/XYRZZ_Constant';
import { XYRZZ_EventManager, XYRZZ_MyEvent } from './XYRZZ_EventManager';
import { XYRZZ_Panel, XYRZZ_UIManager } from './XYRZZ_UIManager';

import { XYRZZ_Incident } from './XYRZZ_Incident';
import { XYRZZ_AudioManager } from './XYRZZ_AudioManager';
import Banner from '../../../Scripts/Banner';
const { ccclass, property } = _decorator;

@ccclass('XYRZZ_FishingBox')
export class XYRZZ_FishingBox extends Component {
    public Id: number;
    start() {
        XYRZZ_EventManager.on(XYRZZ_MyEvent.钓法升级, (id: number) => {
            if (id == this.Id) {
                this.ShowUI();
            }
        });
    }

    ShowUI() {
        let data = XYRZZ_GameData.Instance.FishingPoleDataLevel[this.Id];
        this.node.getChildByPath("技能名字").getComponent(Label).string = data.Name;
        let power = data.Level * data.Level * XYRZZ_Constant.FishingPoleData[this.Id].Power;
        this.node.getChildByPath("战力").getComponent(Label).string = `钓法拉力：` + XYRZZ_Incident.GetMaxNum(power);
        if (data.Level == 0) {
            this.node.getChildByPath("学习").active = true;
            this.node.getChildByPath("已学习").active = false;
            this.node.getChildByPath("技能锁").active = true;
        } else {
            this.node.getChildByPath("学习").active = false;
            this.node.getChildByPath("已学习").active = true;
            this.node.getChildByPath("技能锁").active = false;
        }
    }

    public OnClick() {
        XYRZZ_AudioManager.globalAudioPlay("鼠标嘟");
        if (XYRZZ_GameData.Instance.FishingPoleDataLevel[this.Id].Level > 0) {
            XYRZZ_UIManager.Instance.ShowPanel(XYRZZ_Panel.XYRZZ_FishingPoleMessage, [this.Id]);
        } else {
            XYRZZ_UIManager.HopHint("请先解锁该技能！");
        }
    }

    public OnStudyClick() {
        XYRZZ_AudioManager.globalAudioPlay("鼠标嘟");
        Banner.Instance.ShowVideoAd(() => {
            XYRZZ_GameData.Instance.FishingPoleDataLevel[this.Id].Level = 1;
            XYRZZ_EventManager.Scene.emit(XYRZZ_MyEvent.钓法升级, this.Id);
            XYRZZ_EventManager.Scene.emit(XYRZZ_MyEvent.改变战力);
        })
    }
}


