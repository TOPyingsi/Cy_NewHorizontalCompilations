import { _decorator, Component, EventTouch, Node } from 'cc';
import { KKDKF_GameManager } from './KKDKF_GameManager';
import { KKDKF_AudioManager } from '../KKDKF_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('KKDKF_ShopingPanel')
export class KKDKF_ShopingPanel extends Component {



    OnClick(target: EventTouch) {
        KKDKF_AudioManager.globalAudioPlay("鼠标嘟");
        switch (target.target.name) {
            case "墙纸":
                this.ChanggePage("墙纸");
                break;
            case "吊灯":
                this.ChanggePage("吊灯");
                break;
            case "高脚凳":
                this.ChanggePage("高脚凳");
                break;
            case "椅子":
                this.ChanggePage("椅子");
                break;
            case "收银台":
                this.ChanggePage("收银台");
                break;
            case "关闭商店":
                KKDKF_GameManager.Instance.UI.getChildByName("商店界面").active = false;
                break;
        }
    }
    Show() {



    }

    //切换页面
    ChanggePage(pageName: string) {
        let XuanZheContent: Node = this.node.getChildByPath("选择栏/view/content");
        XuanZheContent.children.forEach((cd: Node) => {
            if (cd.name == pageName) {
                cd.getChildByName("悬着按钮暗").active = false;
            } else {
                cd.getChildByName("悬着按钮暗").active = true;
            }
        });
        let ShopingPage: Node = this.node.getChildByName("商品页");
        ShopingPage.children.forEach((cd) => {
            if (cd.name == pageName) {
                cd.active = true;
            } else {
                cd.active = false;
            }
        })

    }

}


