import { _decorator, Component, Event, Node } from 'cc';
import { QLTZ_AudioManager } from './QLTZ_AudioManager';
import Banner from '../../../Scripts/Banner';
import { QLTZ_UIManager } from './QLTZ_UIManager';
const { ccclass, property } = _decorator;

@ccclass('QLTZ_GuidePanel')
export class QLTZ_GuidePanel extends Component {

    start() {
        if (Banner.RegionMask) Banner.Instance.ShowCustomAd();
    }

    update(deltaTime: number) {

    }

    ButtonClick(event: Event) {
        QLTZ_AudioManager.AudioClipPlay("button");
        switch (event.target.name) {
            case "CloseBtn":
                {
                    this.node.active = false;
                    QLTZ_UIManager.Instance.GameUI.active = false;
                    QLTZ_UIManager.Instance.ShowCountDown();
                }
                break;
        }
    }
}


