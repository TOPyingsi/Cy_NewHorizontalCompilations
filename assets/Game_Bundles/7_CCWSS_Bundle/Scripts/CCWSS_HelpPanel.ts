import { _decorator, Component, Event, Label, Node, Sprite, SpriteFrame } from 'cc';
import { CCWSS_AudioManager } from './CCWSS_AudioManager';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
import { CCWSS_Constant } from './CCWSS_Constant';

import Banner from '../../../Scripts/Banner';
import { Tools } from '../../../Scripts/Framework/Utils/Tools';
const { ccclass, property } = _decorator;

@ccclass('CCWSS_HelpPanel')
export class CCWSS_HelpPanel extends Component {
    protected onEnable(): void {
        if (Banner.RegionMask) Banner.Instance.ShowCustomAd();
    }

    protected onDisable(): void {
        this.node.getChildByName("线索").active = false;
        this.node.getChildByName("VideoBtn").active = true;
    }

    ButtonClick(event: Event) {
        CCWSS_AudioManager.AudioClipPlay("button");
        switch (event.target.name) {
            case "YesBtn":
            case "VideoBtn":
                {
                    Banner.Instance.ShowVideoAd(() => {
                        this.node.getChildByName("VideoBtn").active = false;
                        let desc: string = Tools.GetRandomItemFromArray(CCWSS_Constant.SpliceHelpDesc);
                        BundleManager.GetBundle("7_CCWSS_Bundle").load("UI/游戏界面/特征/" + desc.slice(0, 2) + "/spriteFrame", SpriteFrame, (err, spf) => {
                            if (err) console.log(err);
                            this.node.getChildByPath("线索/Img").getComponent(Sprite).spriteFrame = spf;
                            this.node.getChildByPath("线索/Desc").getComponent(Label).string = desc.slice(2, desc.length);
                            this.node.getChildByName("线索").active = true;
                        })
                    })
                }
                break;
            case "CancelBtn":
            case "CloseBtn":
                {
                    this.node.active = false;
                }
                break;
        }
    }
}


