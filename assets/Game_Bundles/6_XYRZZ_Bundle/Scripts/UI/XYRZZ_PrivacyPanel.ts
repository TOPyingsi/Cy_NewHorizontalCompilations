import { _decorator, Component, Node, find, RichText, Tween, Event, tween, Vec3, UITransform, JsonAsset, v3 } from 'cc';

import { XYRZZ_ResourceUtil } from '../Utils/XYRZZ_ResourceUtil';
import { XYRZZ_Panel, XYRZZ_UIManager } from '../XYRZZ_UIManager';
import XYRZZ_PrefsUtil from '../Utils/XYRZZ_PrefsUtil';
import Banner from '../../../../Scripts/Banner';

const { ccclass, property } = _decorator;


@ccclass('XYRZZ_PrivacyPanel')
export class XYRZZ_PrivacyPanel extends Component {

    panel: Node = null;
    content: UITransform = null;
    disagreeButton: Node = null;
    privacyLabel: RichText = null;
    cb: Function = null;

    protected onLoad(): void {
        this.panel = find("ScrollView", this.node);
        this.content = find("ScrollView/view/content", this.node).getComponent(UITransform);
        this.disagreeButton = find("ScrollView/Buttons/DisagreeButton", this.node);
        this.privacyLabel = find("ScrollView/view/content/PrivacyLabel", this.node).getComponent(RichText);
    }

    protected onDisable(): void {
        Tween.stopAllByTarget(this.panel);
        this.panel.setScale(0, 0, 0);
    }

    Show(hasDisagree: boolean = true, cb: Function = null) {
        this.cb = cb;
        this.panel.setScale(0, 0, 0);
        // this.privacyLabel.string = `<color=#000000>1.为了向您提供和持续优化定制化的服务，<b>${Banner.Company}</b>（以下简称“我们”）将收集和处理以下的信息：\n设备信息，包括设备标识符，Mac，机型，品牌，App包名，App版本号，设备分辨率及像素密度；网格信息，包括网格链接状态，接入网格的方式和类型，IP地址；\n使用信息，包括广告内容的展现，点击，下载；除上述信息外，我们还会收集您在本游戏的账号ID，以用来为您提供更加个性化的服务或广告。\n2，上述数据将会传输并保存至服务器，保存期限为60天，超出这一保留时间后将删除，但法律法规另有要求除外，我们保证不对外公开或向任何第三方提供您的个人信息，但是存在下列情形之一的除外：\n\t（1）公开或提供相关信息之前获得您的许可的；\n\t（2）根据法律或政策的规定而公开或提供的；\n\t（3）根据国家权力机关要求公开或提供的，\n如果你不同意我们采集上述信息，或不同意调用相关手机权限或功能，本软件将无法正常运行，您可通过卸载或退出本软件来终止数据收集及上传。\n3.如果您是未成年人，请在您的监护人仔细阅读本隐私政策。并在征得您的监护人同意的前提下使用我们的服务。\n4.如果您对本隐私政策和我们游戏有任何疑问和建议，请通过客服${Banner.Email}联系我们，我们将尽快答复您。</color>`;
        // this.scheduleOnce(() => { this.content.setContentSize(this.content.contentSize.width, this.privacyLabel.getComponent(UITransform).contentSize.height + 500) });
        this.disagreeButton.active = hasDisagree;
        this.onDisable();
        tween(this.panel).to(0.2, { scale: Vec3.ONE }, { easing: 'backOut' }).start();
    }

    OnButtonClick(event: Event) {
        // AudioManager.PlaySound(Audios.ButtonClick);
        switch (event.target.name) {
            case "AgreeButton":
                XYRZZ_PrefsUtil.SetBool("AgreePolicy", true);
                this.cb && this.cb();
                XYRZZ_UIManager.Instance.HidePanel(XYRZZ_Panel.XYRZZ_PrivacyPanel);
                break;
            case "DisagreeButton":
                Banner.Instance.Quit();
                break;
        }
    }
}