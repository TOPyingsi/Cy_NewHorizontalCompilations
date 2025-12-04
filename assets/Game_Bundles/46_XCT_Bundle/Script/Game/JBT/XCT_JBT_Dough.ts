import { _decorator, Component, instantiate, Node, v3 } from 'cc';
import { XCT_JBT_PancakeStick } from './XCT_JBT_PancakeStick';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XCT_Events } from '../../Common/XCT_Events';
import { XCT_JBT_DataManager, XCT_JBT_IngredientType } from '../../Manager/XCT_JBT_DataManager';
const { ccclass, property } = _decorator;

@ccclass('XCT_JBT_Dough')
export class XCT_JBT_Dough extends Component {

    @property(Node)
    doughContainer: Node = null;

    @property(Node)
    toolsLayer: Node = null;

    btnDough_1: Node = null;
    btnDough_2: Node = null;
    polePrefab: Node = null;

    poleNode: Node = null;


    // @property(Node)
    piePrefabsContanter_1: Node = null;
    piePrefabsContanter_2: Node = null;

    doughAnimation: Node = null;

    protected onLoad(): void {
        this.btnDough_1 = this.node.getChildByName("btnDough_1");
        this.btnDough_2 = this.node.getChildByName("btnDough_2");
        this.polePrefab = this.node.getChildByName("polePrefab");
        this.piePrefabsContanter_1 = this.node.getChildByName("pieprefabsContanter_1");
        this.piePrefabsContanter_2 = this.node.getChildByName("pieprefabsContanter_2");

        this.doughAnimation = this.node.getChildByName("doughAnimation");

        this.onCancel_Click();

        this.addListener();
    }

    onBtn_1Click() {
        this.onBtnClick(1);
    }

    onBtn_2Click() {
        this.onBtnClick(2);
    }

    onBtnClick(btnNum: number) {
        if (XCT_JBT_DataManager.Instance.isPacked) {
            EventManager.Scene.emit(XCT_Events.showTip, "卷饼后不可再添加材料哦！");
            return;
        }
        if (XCT_JBT_DataManager.Instance.currentCookedSteps.includes("白面团") || XCT_JBT_DataManager.Instance.currentCookedSteps.includes("土豆面")) {
            EventManager.Scene.emit(XCT_Events.showTip, "面饼只可以摊一次！");
            return;
        }
        if(XCT_JBT_DataManager.Instance.playerData.currentDay == 1 &&!XCT_JBT_DataManager.Instance.isTutorialEnd){
            if (XCT_JBT_DataManager.Instance.tutorialIdx !== 0) {
                return;
            }
        }
        
        if (XCT_JBT_DataManager.Instance.tutorialIdx == 0) {
            EventManager.Scene.emit(XCT_Events.HandAnimation_Start);
            XCT_JBT_DataManager.Instance.tutorialIdx++;
        }

        EventManager.Scene.emit(XCT_Events.JBT_Cancel_All_Ingredients);

        let ingredientName = btnNum == 1 ? "白面团" : "土豆面";
        if (!XCT_JBT_DataManager.Instance.currentDishes[ingredientName]) {
            XCT_JBT_DataManager.Instance.currentDishes[ingredientName] = {
                type: XCT_JBT_IngredientType.EGG,
                need: 1,
                count: 0,
                percentage: 0,
                rotateCount: 0
            }
        }
        XCT_JBT_DataManager.Instance.currentDishes[ingredientName].count++;
        XCT_JBT_DataManager.Instance.currentEggIngredientType = ingredientName;

        //扣钱
        XCT_JBT_DataManager.Instance.playerData.money -= XCT_JBT_DataManager.Instance.ingredientsConfigObject[ingredientName].cost;
        XCT_JBT_DataManager.Instance.dayCost += XCT_JBT_DataManager.Instance.ingredientsConfigObject[ingredientName].cost;
        EventManager.Scene.emit(XCT_Events.JBT_Update_Money);

        this.btnDough_1.getChildByName("selected").active = btnNum == 1;
        this.btnDough_2.getChildByName("selected").active = btnNum == 2;
        //创建动画
        let animationPrefab = this.doughAnimation;
        let animationNode = instantiate(animationPrefab);
        animationNode.getChildByName("面1").active = btnNum == 1;
        animationNode.getChildByName("面2").active = btnNum == 2;
        animationNode.getChildByName("勺子").getChildByName("面1").active = btnNum == 1;
        animationNode.getChildByName("勺子").getChildByName("面2").active = btnNum == 2;
        animationNode.parent = this.toolsLayer;
        animationNode.setPosition(v3(0, 0, 0));
        animationNode.active = true;

        this.scheduleOnce(() => {
            //取消底板监听
            EventManager.Scene.emit(XCT_Events.JBT_Disable_CancelMask);
            EventManager.Scene.emit(XCT_Events.HandAnimation_End);
            animationNode.parent = this.doughContainer;
            let poleNode = instantiate(this.polePrefab);
            poleNode.parent = this.toolsLayer;
            poleNode.setPosition(v3(0, 0, 0));
            poleNode.getComponent(XCT_JBT_PancakeStick).setPiePrefabs(btnNum == 1 ? this.piePrefabsContanter_1 : this.piePrefabsContanter_2, this.doughContainer);
            poleNode.active = true;
            this.poleNode = poleNode;
        }, 0.72);
    }
    onCancel_Click() {
        this.btnDough_1.getChildByName("selected").active = false;
        this.btnDough_2.getChildByName("selected").active = false;
        if (this.poleNode) {
            let totalAngle = this.poleNode.getComponent(XCT_JBT_PancakeStick).totalAngle;
            //oooooooooooooooooooooooooooooooooooooooooooooooooooooo设置dataManager【当前菜品idx】【菜品类型】+=角度
            this.poleNode.destroy();
        }
        this.poleNode = null;
    }

    addListener() {
        EventManager.on(XCT_Events.JBT_Cancel_All_Ingredients, this.onCancel_Click, this);

        this.btnDough_1.on("click", this.onBtn_1Click, this);
        this.btnDough_2.on("click", this.onBtn_2Click, this);
    }

    removeListener() {
        EventManager.off(XCT_Events.JBT_Cancel_All_Ingredients, this.onCancel_Click, this);
    }

    protected onDestroy(): void {
        this.removeListener();
    }
}


