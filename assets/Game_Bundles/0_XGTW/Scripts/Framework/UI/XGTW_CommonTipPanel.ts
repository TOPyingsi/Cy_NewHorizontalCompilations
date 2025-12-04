import { _decorator, Component, Node, Label, RichText, Event, Tween, Vec3, find, tween } from 'cc';
const { ccclass, property } = _decorator;

import { XGTW_AudioManager } from '../../XGTW_AudioManager';
import { XGTW_Constant } from '../Const/XGTW_Constant';
import { XGTW_UIManager } from '../Managers/XGTW_UIManager';
import Banner from '../../../../../Scripts/Banner';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';

@ccclass('XGTW_CommonTipPanel')
export default class XGTW_CommonTipPanel extends Component {
    panel: Node | null = null;
    //    /*** 提示标题 */
    titleLb: Label | null = null;
    //    /*** 提示内容 */
    contentLb: RichText | null = null;
    button_1: Node | null = null;
    button_1_Lb: Label | null = null;
    button_2: Node | null = null;
    button_2_Lb: Label | null = null;
    //    /*** 按钮1点击回调 */
    cb_1: Function = null;
    //    /*** 按钮2点击回调 */
    cb_2: Function = null;
    protected onLoad(): void {
        this.panel = find("Panel", this.node);
        this.titleLb = find("Panel/Title/Label", this.node).getComponent(Label);
        this.contentLb = find("Panel/RichText", this.node).getComponent(RichText);
        this.button_1 = find("Panel/Buttons/Button_1", this.node);
        this.button_1_Lb = find("Panel/Buttons/Button_1/Label", this.node).getComponent(Label);
        this.button_2 = find("Panel/Buttons/Button_2", this.node);
        this.button_2_Lb = find("Panel/Buttons/Button_2/Label", this.node).getComponent(Label);
    }
    protected onDisable(): void {
        Tween.stopAllByTarget(this.panel);
        this.panel.setScale(Vec3.ZERO);
    }
    Show(content: string, button1Str: string = ``, button2Str: string = ``, cb_1: Function = null, cb_2: Function = null, title: string = `提示`) {
        this.onDisable();

        this.contentLb.string = `<b>${content}</b>`;
        this.titleLb.string = title;
        this.button_1_Lb.string = button1Str;
        this.button_2_Lb.string = button2Str;
        this.cb_1 = cb_1;
        this.cb_2 = cb_2;

        this.button_2.active = !Tools.IsEmptyStr(button2Str);

        tween(this.panel).to(0.3, { scale: Vec3.ONE }, { easing: 'backOut' }).call(() => {
            if (Banner.RegionMask) {
                // Banner.Instance.ShowVideoAd(() => { });
                this.scheduleOnce(() => {
                    // Banner.Instance.ShowCustomAd();
                }, 3);
            }

            if (Banner.RegionMask)
                Banner.Instance.ShowCustomAd();
        }).start();
    }
    OnButtonClick(event: Event) {
        XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.ButtonClick);

        switch (event.target.name) {
            case "Button_1":
                this.cb_1 && this.cb_1();
                break;
            case "Button_2":
                this.cb_2 && this.cb_2();
                break;
            case "CloseButton":
                XGTW_UIManager.Instance.HidePanel(XGTW_Constant.Panel.CommonTipPanel);
                break;
        }
    }
}