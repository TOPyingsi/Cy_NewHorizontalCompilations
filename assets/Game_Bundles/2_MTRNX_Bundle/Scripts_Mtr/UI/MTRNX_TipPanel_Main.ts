import { _decorator, Component, Node, misc, Label, Sprite, find, CurveRange, director, tween, Vec3 } from 'cc';

import Banner from '../../../../Scripts/Banner';
import { MTRNX_Panel, MTRNX_UIManager } from '../MTRNX_UIManager';
const { ccclass, property } = _decorator;

@ccclass('MTRNX_TipPanel_Main')
export class MTRNX_TipPanel_Main extends Component {
    panel: Node = null;
    titleLb: Label = null!;
    descLb: Label = null!;
    func: Function = null!;

    onLoad() {
        this.panel = find("Panel", this.node);
        this.titleLb = find("Panel/TitleLb", this.node).getComponent(Label);
        this.descLb = find("Panel/DescLb", this.node).getComponent(Label);
    }

    Show(desc: string, pauseGame: boolean = false) {
        if (Banner.RegionMask) {
            Banner.Instance.ShowCustomAd(this.node);
        }
        this.panel.setScale(0, 0, 0);
        if (pauseGame) {
            this.scheduleOnce(() => {
                director.pause();
            });
        }

        this.descLb.string = desc;
        tween(this.panel).to(0.2, { scale: Vec3.ONE }, { easing: 'backOut' }).start();
    }

    OnCloseButtonClick() {
        director.resume();
        MTRNX_UIManager.Instance.HidePanel(MTRNX_Panel.TipPanel);
    }
}