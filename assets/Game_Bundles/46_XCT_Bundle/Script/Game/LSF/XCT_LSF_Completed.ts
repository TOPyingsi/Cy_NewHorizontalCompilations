import { _decorator, Component, Node } from 'cc';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XCT_Events } from '../../Common/XCT_Events';
import { XCT_LSF_DataManager } from '../../Manager/XCT_LSF_DataManager';
const { ccclass, property } = _decorator;

@ccclass('XCT_LSF_Completed')
export class XCT_LSF_Completed extends Component {

    protected onLoad(): void {
        this.node.on("click", this.onClick, this);
    }

    onClick() {

        let hasSauce = false;
        let sauces = ["酱", "醋", "盐", "鸡精"]
        XCT_LSF_DataManager.Instance.currentCookedSteps.forEach((ingredient: string) => {
            if (hasSauce) return;
            if (sauces.includes(ingredient)) {
                hasSauce = true;
            }
        })
        if (!hasSauce) {
            EventManager.Scene.emit(XCT_Events.showTip, "请先调味！");
            return;
        }

        let hasIngredient = false;
        let ingredients = ["葱花", "蒜蓉", "青菜", "小米辣", "叉烧肉", "咸鸭蛋", "木耳", "煎蛋", "牛肉", "腐竹", "酸笋", "酸豆角"]
        XCT_LSF_DataManager.Instance.currentCookedSteps.forEach((ingredient: string) => {
            if (hasIngredient) return;
            if (ingredients.includes(ingredient)) {
                hasIngredient = true;
            }
        })
        if (!hasIngredient) {
            EventManager.Scene.emit(XCT_Events.showTip, "要先撒上配料，才算制作完成哦！");
            return;
        }

        if(XCT_LSF_DataManager.Instance.playerData.currentDay == 1 &&!XCT_LSF_DataManager.Instance.isTutorialEnd){
            if (XCT_LSF_DataManager.Instance.tutorialIdx !== 13) {
                return;
            }
        }
        

        EventManager.Scene.emit(XCT_Events.LSF_Cancel_All_Ingredients);
        XCT_LSF_DataManager.Instance.currentCookedSteps.push("卷饼");
        if (XCT_LSF_DataManager.Instance.tutorialIdx == 13) {
            EventManager.Scene.emit(XCT_Events.HandAnimation_End);
            XCT_LSF_DataManager.Instance.tutorialIdx++;
        }


        EventManager.Scene.emit(XCT_Events.LSF_Completed);
    }
}


