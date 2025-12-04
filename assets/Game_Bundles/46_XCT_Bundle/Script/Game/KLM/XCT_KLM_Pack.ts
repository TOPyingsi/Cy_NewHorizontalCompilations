import { _decorator, Component, Node } from 'cc';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XCT_Events } from '../../Common/XCT_Events';
import { XCT_KLM_DataManager } from '../../Manager/XCT_KLM_DataManager';
const { ccclass, property } = _decorator;

@ccclass('XCT_KLM_Pack')
export class XCT_KLM_Pack extends Component {
    @property(Node)
    cookArea: Node = null;

    @property(Node)
    pieceNodes: Node[] = [];

    @property(Node)
    dividers: Node[] = [];

    protected onLoad(): void {
        this.node.on("click", this.onClick, this);
    }

    private onClick(): void {
        if (XCT_KLM_DataManager.Instance.isPacked) {
            EventManager.Scene.emit(XCT_Events.showTip, "不能重复卷冷面哦！");
            return;
        }
        let hasSauce1 = false;
        let sauces1 = ["油"]
        XCT_KLM_DataManager.Instance.currentCookedSteps.forEach((ingredient: string) => {
            if (hasSauce1) return;
            if (sauces1.includes(ingredient)) {
                hasSauce1 = true;
            }
        })
        if (!hasSauce1) {
            EventManager.Scene.emit(XCT_Events.showTip, "要先刷油才可以放冷面皮哦！");
            return;
        }


        let hasSauce = false;
        let sauces = ["冷面皮"]
        XCT_KLM_DataManager.Instance.currentCookedSteps.forEach((ingredient: string) => {
            if (hasSauce) return;
            if (sauces.includes(ingredient)) {
                hasSauce = true;
            }
        })
        if (!hasSauce) {
            EventManager.Scene.emit(XCT_Events.showTip, "请先放置冷面皮！");
            return;
        }

        let hasSauce2 = false;
        let sauces2 = ["鸡蛋"]
        XCT_KLM_DataManager.Instance.currentCookedSteps.forEach((ingredient: string) => {
            if (hasSauce2) return;
            if (sauces2.includes(ingredient)) {
                hasSauce2 = true;
            }
        })
        if (!hasSauce2) {
            EventManager.Scene.emit(XCT_Events.showTip, "请先放置鸡蛋！");
            return;
        }

        let hasSauce3 = false;
        let sauces3 = ["浅色酱", "芝麻", "调味酱", "花生酱"]
        XCT_KLM_DataManager.Instance.currentCookedSteps.forEach((ingredient: string) => {
            if (hasSauce3) return;
            if (sauces3.includes(ingredient)) {
                hasSauce3 = true;
            }
        })
        if (!hasSauce3) {
            EventManager.Scene.emit(XCT_Events.showTip, "要先刷上酱料，才能放置配料哦！");
            return;
        }

        let hasSauce4 = false;
        let sauces4 = ["洋葱", "生菜", "火腿肠", "辣白菜", "鸡柳", "辣条", "猪排", "芝士", "鱼片"]
        XCT_KLM_DataManager.Instance.currentCookedSteps.forEach((ingredient: string) => {
            if (hasSauce4) return;
            if (sauces4.includes(ingredient)) {
                hasSauce4 = true;
            }
        })
        if (!hasSauce4) {
            EventManager.Scene.emit(XCT_Events.showTip, "要先撒上配料，才能卷面皮哦！");
            return;
        }

        if(XCT_KLM_DataManager.Instance.playerData.currentDay == 1 &&!XCT_KLM_DataManager.Instance.isTutorialEnd){
            let num = [8];
            if (num.indexOf(XCT_KLM_DataManager.Instance.tutorialIdx) == -1) {
                return;
            }
        }


        if (XCT_KLM_DataManager.Instance.tutorialIdx == 8) {
            EventManager.Scene.emit(XCT_Events.HandAnimation_End);
            XCT_KLM_DataManager.Instance.tutorialIdx++;
        }

        EventManager.Scene.emit(XCT_Events.KLM_Cancel_All_Ingredients);
        XCT_KLM_DataManager.Instance.isPacked = true;
        XCT_KLM_DataManager.Instance.currentCookedSteps.push(this.node.name);
        this.cookArea.children.forEach((layer: Node) => {
            if (layer.getChildByName("Contanter") && layer.name !== "layer_Completed") {
                layer.getChildByName("Contanter").children.forEach((child: Node) => {
                    child.active = true;
                    child.destroy();
                })
            }
        })
        this.dividers.forEach((divider: Node) => {
            divider.active = true;
        })
        this.pieceNodes.forEach((pieceNode: Node) => {
            pieceNode.active = true;
            pieceNode.getChildByName("before").active = true;
            pieceNode.getChildByName("after").active = false;
        })
    }
}


