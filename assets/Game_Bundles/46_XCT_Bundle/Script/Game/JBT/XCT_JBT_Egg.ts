import { _decorator, Component, instantiate, Node, v3 } from 'cc';
import { XCT_JBT_PancakeStick } from './XCT_JBT_PancakeStick';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XCT_Events } from '../../Common/XCT_Events';
import { XCT_JBT_DataManager, XCT_JBT_IngredientType } from '../../Manager/XCT_JBT_DataManager';
const { ccclass, property } = _decorator;


@ccclass('XCT_JBT_Egg')
export class XCT_JBT_Egg extends Component {

    @property(Node)
    eggContainer: Node = null;

    @property(Node)
    toolsLayer: Node = null;

    polePrefab: Node = null;
    eggPrefabsContanter: Node = null;
    eggAnimationPrefab: Node = null;

    poleNode: Node = null;

    protected onLoad(): void {
        this.polePrefab = this.node.getChildByName("polePrefab");
        this.eggPrefabsContanter = this.node.getChildByName("eggPrefabsContanter");

        this.eggAnimationPrefab = this.node.getChildByName("eggAnimationPrefab");

        this.onCancel_Click();

        this.addListener();
    }



    onBtnClick() {
        if (XCT_JBT_DataManager.Instance.isPacked) {
            EventManager.Scene.emit(XCT_Events.showTip, "卷饼后不可再添加材料哦！");
            return;
        }

        if (!XCT_JBT_DataManager.Instance.currentCookedSteps.includes("白面团") && !XCT_JBT_DataManager.Instance.currentCookedSteps.includes("土豆面")) {
            EventManager.Scene.emit(XCT_Events.showTip, "要先摊好面皮，才能加鸡蛋哦！");
            return;
        }
        if(XCT_JBT_DataManager.Instance.playerData.currentDay == 1 &&!XCT_JBT_DataManager.Instance.isTutorialEnd){
            if (XCT_JBT_DataManager.Instance.tutorialIdx !== 2) {
                return;
            }
        }
                
        if (XCT_JBT_DataManager.Instance.tutorialIdx == 2) {
            EventManager.Scene.emit(XCT_Events.HandAnimation_Start);
            XCT_JBT_DataManager.Instance.tutorialIdx++;
        }
        EventManager.Scene.emit(XCT_Events.JBT_Cancel_All_Ingredients);

        if (!XCT_JBT_DataManager.Instance.currentDishes["鸡蛋"]) {
            XCT_JBT_DataManager.Instance.currentDishes["鸡蛋"] = {
                type: XCT_JBT_IngredientType.EGG,
                need: 1,
                count: 0,
                percentage: 0,
                rotateCount: 0
            }
        }

        XCT_JBT_DataManager.Instance.currentDishes["鸡蛋"].count++;
        XCT_JBT_DataManager.Instance.currentEggIngredientType = "鸡蛋";

        XCT_JBT_DataManager.Instance.playerData.money -= XCT_JBT_DataManager.Instance.ingredientsConfigObject["鸡蛋"].cost;
        XCT_JBT_DataManager.Instance.dayCost += XCT_JBT_DataManager.Instance.ingredientsConfigObject["鸡蛋"].cost;
        EventManager.Scene.emit(XCT_Events.JBT_Update_Money);

        this.node.getChildByName("selected").active = true;
        //创建动画
        let animationPrefab = this.eggAnimationPrefab;
        let animationNode = instantiate(animationPrefab);
        animationNode.parent = this.toolsLayer;
        animationNode.setPosition(v3(0, 0, 0));
        animationNode.active = true;
        this.scheduleOnce(() => {
            //取消底板监听
            EventManager.Scene.emit(XCT_Events.JBT_Disable_CancelMask);
            EventManager.Scene.emit(XCT_Events.HandAnimation_End);
            animationNode.parent = this.eggContainer;
            let poleNode = instantiate(this.polePrefab);
            poleNode.parent = this.toolsLayer;
            poleNode.setPosition(v3(0, 0, 0));
            poleNode.getComponent(XCT_JBT_PancakeStick).setPiePrefabs(this.eggPrefabsContanter, this.eggContainer);
            poleNode.active = true;
            this.poleNode = poleNode;
        }, 0.72);
    }

    onCancel_Click() {
        this.node.getChildByName("selected").active = false;
        if (this.poleNode) {
            let totalAngle = this.poleNode.getComponent(XCT_JBT_PancakeStick).totalAngle;
            //oooooooooooooooooooooooooooooooooooooooooooooooooooooo设置dataManager【当前菜品idx】【菜品类型】+=角度
            this.poleNode.destroy();
        }
        this.poleNode = null;
    }

    addListener() {
        EventManager.on(XCT_Events.JBT_Cancel_All_Ingredients, this.onCancel_Click, this);

        this.node.on("click", this.onBtnClick, this);
    }

    removeListener() {
        EventManager.off(XCT_Events.JBT_Cancel_All_Ingredients, this.onCancel_Click, this);
    }

    protected onDestroy(): void {
        this.removeListener();
    }
}


