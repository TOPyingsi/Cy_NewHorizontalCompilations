import { _decorator, Component, director, Event, find, Node } from 'cc';
import { CCWSS_Constant } from './CCWSS_Constant';
import { CCWSS_AudioManager } from './CCWSS_AudioManager';
import Banner from '../../../Scripts/Banner';
import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
const { ccclass, property } = _decorator;

@ccclass('CCWSS_Start')
export class CCWSS_Start extends Component {
    start() {
        CCWSS_Constant.InitData();
        CCWSS_AudioManager.BGMPlay("BGM");
        if (Banner.RegionMask) Banner.Instance.ShowBannerAd();
    }

    update(deltaTime: number) {

    }

    ButtonClick(event: Event) {
        CCWSS_AudioManager.AudioClipPlay("button");
        switch (event.target.name) {
            case "StartBtn":
                {
                    find("Canvas/SelectPanel").active = true;
                    if (Banner.RegionMask) UIManager.ShowPanel(Panel.TreasureBoxPanel);
                }
                break;
        }
    }
}


