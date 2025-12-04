import { _decorator, Component, Node } from 'cc';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XCT_Events } from '../../Common/XCT_Events';
import { XCT_KLM_DataManager } from '../../Manager/XCT_KLM_DataManager';
const { ccclass, property } = _decorator;

@ccclass('XCT_KLM_Completed')
export class XCT_KLM_Completed extends Component {

    protected onLoad(): void {
        this.node.on("click", this.onClick, this);
    }

    onClick() {

        let hasSauce = false;
        let sauces = ["烤冷面碗"]
        XCT_KLM_DataManager.Instance.currentCookedSteps.forEach((ingredient: string) => {
            if (hasSauce) return;
            if (sauces.includes(ingredient)) {
                hasSauce = true;
            }
        })
        if (!hasSauce) {
            EventManager.Scene.emit(XCT_Events.showTip, "要制作并打包好才能算完成哦！");
            return;
        }

        if(XCT_KLM_DataManager.Instance.playerData.currentDay == 1 &&!XCT_KLM_DataManager.Instance.isTutorialEnd){
            let num = [11,13];
            if (num.indexOf(XCT_KLM_DataManager.Instance.tutorialIdx) == -1) {
                return;
            }
        }

        if (XCT_KLM_DataManager.Instance.tutorialIdx == 11) {
            EventManager.Scene.emit(XCT_Events.HandAnimation_End);
            XCT_KLM_DataManager.Instance.tutorialIdx++;
        }


        EventManager.Scene.emit(XCT_Events.KLM_Cancel_All_Ingredients);
        XCT_KLM_DataManager.Instance.currentCookedSteps.push(this.node.name);
        if (XCT_KLM_DataManager.Instance.tutorialIdx == 13) {
            EventManager.Scene.emit(XCT_Events.HandAnimation_End);
            XCT_KLM_DataManager.Instance.tutorialIdx++;
        }


        EventManager.Scene.emit(XCT_Events.KLM_Completed);
    }
}


