import { _decorator, Component, Event, Label, Node } from 'cc';
import { CCWSS_UIManager } from './CCWSS_UIManager';
import { CCWSS_Constant } from './CCWSS_Constant';
import { CCWSS_AudioManager } from './CCWSS_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('CCWSS_QuestionPanel')
export class CCWSS_QuestionPanel extends Component {

    protected onEnable(): void {
        this.node.getChildByPath("Panel/Desc").getComponent(Label).string = CCWSS_Constant.TeZhengDesc[CCWSS_Constant.Question[0]][CCWSS_Constant.Question[1]];
    }

    ButtonClick(event: Event) {
        CCWSS_AudioManager.AudioClipPlay("button");
        switch (event.target.name) {
            case "YesBtn":
                {
                    this.node.active = false;
                    CCWSS_UIManager.Instance.TeZhengPanel.active = false;
                    CCWSS_UIManager.Instance.ShowPanel(CCWSS_UIManager.Instance.AskPanel);
                }
                break;
            case "CancelBtn":
                {
                    this.node.active = false;
                }
                break;
        }
    }
}


