import { _decorator, Component, Event, Node } from 'cc';
import { CCWSS_QuestionPanel } from './CCWSS_QuestionPanel';
import { CCWSS_UIManager } from './CCWSS_UIManager';
import { CCWSS_Constant } from './CCWSS_Constant';
import { CCWSS_AudioManager } from './CCWSS_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('CCWSS_TeZhengPanel')
export class CCWSS_TeZhengPanel extends Component {

    protected onLoad(): void {
        for (let i of this.node.getChildByPath("特征/特征").children) {
            i.on(Node.EventType.TOUCH_END, () => {
                CCWSS_AudioManager.AudioClipPlay("button");
                this.node.getChildByName("特征").active = false;
                this.node.getChildByName("详细特征").children[i.getSiblingIndex()].active = true;
            })
        }
        for (let i of this.node.getChildByName("详细特征").children) {
            for (let j of i.getChildByName(i.name).children) {
                j.on(Node.EventType.TOUCH_END, (event) => {
                    CCWSS_AudioManager.AudioClipPlay("button");
                    CCWSS_Constant.Question = [i.getSiblingIndex(), j.getSiblingIndex()];
                    CCWSS_UIManager.Instance.ShowPanel(CCWSS_UIManager.Instance.QuestionPanel);
                })
            }
        }
    }

    protected onDisable(): void {
        for (let i of this.node.getChildByName("详细特征").children) {
            i.active = false;
        }
        this.node.getChildByName("特征").active = true;
    }

    ButtonClick(event: Event) {
        CCWSS_AudioManager.AudioClipPlay("button");
        switch (event.target.name) {
            case "CloseBtn":
                {
                    if (this.node.getChildByName("特征").active) {
                        this.node.active = false;
                    }
                    else {
                        for (let i of this.node.getChildByName("详细特征").children) {
                            i.active = false;
                        }
                        this.node.getChildByName("特征").active = true;
                    }
                }
                break;
        }
    }
}


