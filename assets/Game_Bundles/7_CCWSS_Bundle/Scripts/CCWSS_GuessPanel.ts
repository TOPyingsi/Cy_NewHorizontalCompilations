import { _decorator, Component, Event, Label, Node, Sprite, SpriteFrame } from 'cc';
import { CCWSS_Constant } from './CCWSS_Constant';
import { CCWSS_AudioManager } from './CCWSS_AudioManager';
import { CCWSS_UIManager } from './CCWSS_UIManager';
import { CCWSS_FinishPanel } from './CCWSS_FinishPanel';
const { ccclass, property } = _decorator;

@ccclass('CCWSS_GuessPanel')
export class CCWSS_GuessPanel extends Component {

    GuessIndex: number = -1;//猜测对象索引
    GuessSpf: SpriteFrame = null;//猜测对象图片

    protected onEnable(): void {
        this.node.getChildByPath("Panel/底框/PeopleSelect").getComponentInChildren(Label).string = CCWSS_Constant.PeopleNames[this.GuessIndex];
        this.node.getChildByPath("Panel/底框/PeopleSelect").getComponentInChildren(Sprite).spriteFrame = this.GuessSpf;
    }

    ButtonClick(event: Event) {
        CCWSS_AudioManager.AudioClipPlay("button");
        switch (event.target.name) {
            case "YesBtn":
                {
                    if (this.GuessIndex == CCWSS_Constant.AISelectIndex) {
                        CCWSS_UIManager.Instance.FinishPanel.getComponent(CCWSS_FinishPanel).Show(true);
                    }
                    else {
                        CCWSS_UIManager.Instance.FinishPanel.getComponent(CCWSS_FinishPanel).Show(false);
                    }
                    CCWSS_UIManager.Instance.SelectPanel.active = false;
                }
                break;
            case "CancelBtn":
                {
                }
                break;
        }
        this.node.active = false;
    }
}


