import { _decorator, Component, Label, Node, Sprite, SpriteFrame, Tween, tween, v3, Vec3 } from 'cc';
import { CCWSS_SelectPanel, SelectMode } from './CCWSS_SelectPanel';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
import { CCWSS_AudioManager } from './CCWSS_AudioManager';
import { CCWSS_Constant } from './CCWSS_Constant';
import { CCWSS_UIManager } from './CCWSS_UIManager';
import { CCWSS_GuessPanel } from './CCWSS_GuessPanel';
const { ccclass, property } = _decorator;

@ccclass('CCWSS_PeopleSelect')
export class CCWSS_PeopleSelect extends Component {

    IsPass: boolean = false;

    protected onLoad(): void {
        this.node.getComponentInChildren(Label).string = CCWSS_Constant.PeopleNames[this.node.getSiblingIndex()];
        BundleManager.GetBundle("7_CCWSS_Bundle").load("UI/人物/" + (this.node.getSiblingIndex() + 1) + "/spriteFrame", SpriteFrame, (err, spf) => {
            if (err) console.log(err);
            this.node.getChildByName("img").getComponent(Sprite).spriteFrame = spf;
        })
    }

    OnSelectClick() {
        CCWSS_AudioManager.AudioClipPlay("button");
        switch (CCWSS_SelectPanel.Instance.selectMode) {
            case SelectMode.StartSelect:
                {
                    if (CCWSS_Constant.MeSelectIndex != -1) {
                        CCWSS_SelectPanel.Instance.node.getChildByName("Content").children[CCWSS_Constant.MeSelectIndex].getChildByName("select").active = false;
                    }
                    else {
                        CCWSS_SelectPanel.Instance.node.getChildByName("YesBtn").active = true;
                    }
                    CCWSS_Constant.MeSelectIndex = this.node.getSiblingIndex();

                    this.node.getChildByName("select").setScale(v3(1.2, 1.2, 1.2));
                    tween(this.node.getChildByName("select"))
                        .to(0.3, { scale: Vec3.ONE }, { easing: "circOut" })
                        .start();
                    this.node.getChildByName("select").active = true;
                }
                break;
            case SelectMode.LookSelect:
            case SelectMode.AskSelect:
                {
                    if (this.IsPass) {
                        this.node.getChildByName("pass").active = false;
                        this.IsPass = false;
                    }
                    else {
                        this.node.getChildByName("pass").setScale(v3(1.2, 1.2, 1.2));
                        tween(this.node.getChildByName("pass"))
                            .to(0.3, { scale: Vec3.ONE }, { easing: "circOut" })
                            .start();
                        this.node.getChildByName("pass").active = true;
                        this.IsPass = true;
                    }
                    this.node.getChildByName("selectTip").active = false;
                    this.node.getChildByName("touch").active = false;
                }
                break;
            case SelectMode.GuessSelect:
                {
                    CCWSS_UIManager.Instance.GuessPanel.getComponent(CCWSS_GuessPanel).GuessIndex = this.node.getSiblingIndex();
                    CCWSS_UIManager.Instance.GuessPanel.getComponent(CCWSS_GuessPanel).GuessSpf = this.node.getChildByName("img").getComponent(Sprite).spriteFrame;
                    CCWSS_UIManager.Instance.ShowPanel(CCWSS_UIManager.Instance.GuessPanel);
                }
                break;

        }
    }
}


