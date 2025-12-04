import { _decorator, Component, director, find, instantiate, Node, Prefab, resources } from 'cc';
import Banner from '../../../Scripts/Banner';
import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
const { ccclass, property } = _decorator;

@ccclass('CPMS_MainUI')
export class CPMS_MainUI extends Component {

    @property(Node)
    startAni: Node;

    protected onLoad(): void {
        Banner.Instance.SetCityIsWhite();
    }

    start() {
        if (Banner.RegionMask) Banner.Instance.ShowBannerAd();
        // if (Banner.getGG == "1") {
        // if (Banner.RegionMask)  UIManager.ShowPanel(Panel.TreasureBoxPanel);
        // Banner.Instance.StartBoxCD();
        // }
        // else 
        // if (Banner.getGG == "2") {
        // if (Banner.RegionMask) / UIManager.ShowPanel(Panel.TreasureBoxPanel);
        // }
        Banner.Instance.ShowBannerAd();
    }

    update(deltaTime: number) {

    }

    Play() {
        if (!Banner.RegionMask) this.startAni.active = true;
        else UIManager.ShowPanel(Panel.TreasureBoxPanel, [() => { this.startAni.active = true; }]);
        // if (!Banner.Instance.TimeManager(2025, 1, 3, 18, 0)) 
        // this.startAni.active = true;
        // else {
        //     UIManager.ShowPanel(Panel.TreasureBoxPanel, [() => { this.startAni.active = true; }]);
        //     Banner.Instance.StartBoxCD();
        // }
        if (Banner.RegionMask) Banner.Instance.ShowCustomAd();
    }
}


