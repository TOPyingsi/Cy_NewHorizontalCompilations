import { _decorator, Component, Event, Label, Node, Sprite, SpriteFrame } from 'cc';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
import { CCWSS_Constant } from './CCWSS_Constant';
import { CCWSS_SelectPanel, SelectMode } from './CCWSS_SelectPanel';
import { CCWSS_UIManager } from './CCWSS_UIManager';
import { CCWSS_AudioManager } from './CCWSS_AudioManager';
import { Tools } from '../../../Scripts/Framework/Utils/Tools';

const { ccclass, property } = _decorator;

@ccclass('CCWSS_AskPanel')
export class CCWSS_AskPanel extends Component {

    protected onEnable(): void {
        if (CCWSS_Constant.MeRound) {
            this.node.getChildByPath("Panel/底框/MeCard").active = false;
            this.node.getChildByPath("Panel/底框/AICard").active = true;
            this.node.getChildByPath("Panel/Title/Ask").getComponent(Label).string = "您问道：";
            this.node.getChildByPath("Panel/底框/Desc").getComponent(Label).string = CCWSS_Constant.TeZhengDesc[CCWSS_Constant.Question[0]][CCWSS_Constant.Question[1]];
            if (CCWSS_Constant.PeopleTeZheng[CCWSS_Constant.AISelectIndex][CCWSS_Constant.Question[0]][CCWSS_Constant.Question[1]] == 1) {
                this.node.getChildByPath("Panel/底框/Say").getComponent(Label).string = "答：是";
            }
            else {
                this.node.getChildByPath("Panel/底框/Say").getComponent(Label).string = "答：不是";
            }
        }
        else {
            this.node.getChildByPath("Panel/底框/AICard").active = false;
            this.node.getChildByPath("Panel/底框/MeCard").active = true;
            this.node.getChildByPath("Panel/底框/MeCard").getComponentInChildren(Label).string = CCWSS_Constant.PeopleNames[CCWSS_Constant.MeSelectIndex];
            BundleManager.GetBundle("7_CCWSS_Bundle").load("UI/人物/" + (CCWSS_Constant.MeSelectIndex + 1) + "/spriteFrame", SpriteFrame, (err, spf) => {
                if (err) console.log(err);
                this.node.getChildByPath("Panel/底框/MeCard").getComponentInChildren(Sprite).spriteFrame = spf;
            })

            this.node.getChildByPath("Panel/Title/Ask").getComponent(Label).string = "对手问道：";
            let QuestionIndex = Tools.GetRandomInt(0, CCWSS_Constant.AIQuestion.length);
            let Question = Tools.GetRandomItemFromArray(CCWSS_Constant.AIQuestion[QuestionIndex]);
            CCWSS_Constant.Question = Question;
            this.node.getChildByPath("Panel/底框/Desc").getComponent(Label).string = CCWSS_Constant.TeZhengDesc[CCWSS_Constant.Question[0]][CCWSS_Constant.Question[1]];
            if (CCWSS_Constant.PeopleTeZheng[CCWSS_Constant.MeSelectIndex][CCWSS_Constant.Question[0]][CCWSS_Constant.Question[1]] == 1) {
                this.node.getChildByPath("Panel/底框/Say").getComponent(Label).string = "答：是";
                CCWSS_Constant.AIQuestion.splice(QuestionIndex, 1);
            }
            else {
                this.node.getChildByPath("Panel/底框/Say").getComponent(Label).string = "答：不是";
            }
        }

        CCWSS_UIManager.Instance.AddRecordItem(
            this.node.getChildByPath("Panel/Title/Ask").getComponent(Label).string + this.node.getChildByPath("Panel/底框/Desc").getComponent(Label).string,
            this.node.getChildByPath("Panel/底框/Say").getComponent(Label).string
        )
    }

    ButtonClick(event: Event) {
        CCWSS_AudioManager.AudioClipPlay("button");
        switch (event.target.name) {
            case "YesBtn":
                {
                    this.node.active = false;
                    if (CCWSS_Constant.MeRound) {
                        CCWSS_SelectPanel.Instance.selectMode = SelectMode.AskSelect;
                        CCWSS_UIManager.Instance.ShowPanel(CCWSS_UIManager.Instance.SelectPanel);
                    }
                    else {
                        CCWSS_UIManager.Instance.SelectAIPeopleCard();
                    }
                }
                break;
        }
    }
}


