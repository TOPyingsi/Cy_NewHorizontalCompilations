import { _decorator, Component, Event, Node } from 'cc';
import { CCWSS_AudioManager } from './CCWSS_AudioManager';
import Banner from '../../../Scripts/Banner';
const { ccclass, property } = _decorator;

@ccclass('CCWSS_RecordPanel')
export class CCWSS_RecordPanel extends Component {

    protected onEnable(): void {
        if (Banner.RegionMask) Banner.Instance.ShowCustomAd();
    }

    ButtonClick(event: Event) {
        CCWSS_AudioManager.AudioClipPlay("button");
        switch (event.target.name) {
            case "YesBtn":
                {
                    this.node.active = false;
                }
                break;
        }
    }
}


