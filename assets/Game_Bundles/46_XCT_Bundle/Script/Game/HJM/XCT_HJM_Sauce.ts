import { _decorator, Animation, Button, Component, EventTouch, Input, instantiate, Node, Prefab, Touch, tween, Tween, UIOpacity, UITransform, v2, v3, Vec2, Vec3 } from 'cc';

import { XCT_Events } from '../../Common/XCT_Events';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XCT_HJM_DataManager, XCT_HJM_IngredientType } from '../../Manager/XCT_HJM_DataManager';
import { XCT_AudioManager } from '../../Manager/XCT_AudioManager';
const { ccclass, property } = _decorator;


@ccclass('XCT_HJM_Sauce')
export class XCT_HJM_Sauce extends Component {

    @property(Node)
    toolsLayer: Node = null; // 面节点

    @property(Number)
    sauceType: number = 0; // 0酱1醋

    @property(Node)
    soupLayer: Node = null; // 汤节点

    private saucePrefab: Node = null; // 酱料预制体
    private sauceMaskPrefab: Node = null; // 酱料遮罩预制体

    private sauceNode: Node = null; // 酱料节点

    count: number = 0; // 点击次数

    private tween: Tween<Node> = null; // 缩放动画
    private isCancel: boolean = false; // 是否取消


    protected onLoad(): void {
        this.addListener();
        this.saucePrefab = this.node.getChildByName('saucePrefab');
        this.saucePrefab.active = false;
        this.sauceMaskPrefab = this.node.getChildByName('sauceMaskPrefab');
        this.sauceMaskPrefab.active = false;


    }


    /** 点击所有食材 */
    private onCancel_Click() {
        this.isCancel = true;
        // this.isTouching = false;
        this.destorySauceNode();
        // this.removeTouchListener();
    }

    private onClick() {
        if(XCT_HJM_DataManager.Instance.playerData.currentDay == 1 &&!XCT_HJM_DataManager.Instance.isTutorialEnd){
            let num = [5];
            if (num.indexOf(XCT_HJM_DataManager.Instance.tutorialIdx) == -1) {
                return;
            }
            if (XCT_HJM_DataManager.Instance.tutorialIdx == 5 && this.node.name !== "酱") {
                return;
            }
        }


        if (XCT_HJM_DataManager.Instance.tutorialIdx == 5 && this.node.name == "酱") {
            EventManager.Scene.emit(XCT_Events.HandAnimation_End);
            XCT_HJM_DataManager.Instance.tutorialIdx++;
        }
        EventManager.Scene.emit(XCT_Events.HJM_Cancel_All_Ingredients);
        // this.isTouching = true;
        this.createSauceNode();
        // this.addTouchListener();
        this.node.getComponent(Button).enabled = false;
    }

    private createSauceNode() {
        this.isCancel = false;
        this.node.getChildByName("icon").active = false;
        let sauceNode = instantiate(this.saucePrefab);
        let currentWorldPos = this.node.getWorldPosition();
        sauceNode.parent = this.toolsLayer;
        sauceNode.setWorldPosition(currentWorldPos);
        sauceNode.active = true;
        this.sauceNode = sauceNode;
        let animation = sauceNode.getComponent(Animation);
        if (this.sauceType == 0) {
            animation.play("jiang_1");
        }
        else {
            animation.play("cu_1");
        }
        this.scheduleOnce(() => {
            if(this.isCancel){
                this.isCancel = false;
                return;
            }
            if(!sauceNode || !sauceNode.isValid){
                return;
            }
            sauceNode.on("click", this.onSauceNodeClick, this);
        }, 0.17);
    }

    onSauceNodeClick() {
        XCT_HJM_DataManager.Instance.currentCookedSteps.push(this.node.name);
        if (XCT_HJM_DataManager.Instance.tutorialIdx == 6 && this.node.name == "酱") {
            EventManager.Scene.emit(XCT_Events.HandAnimation_End);
            XCT_HJM_DataManager.Instance.tutorialIdx++;
        }
        let animation = this.sauceNode.getComponent(Animation);
        animation.play("drop");
        XCT_AudioManager.getInstance().playSound("水滴");

        this.scheduleOnce(() => {
            let sauceMaskNode = instantiate(this.sauceMaskPrefab);
            sauceMaskNode.parent = this.soupLayer.getChildByName("Contanter");
            sauceMaskNode.setPosition(v3(0, 0, 0));
            sauceMaskNode.setScale(v3(1, 1, 1));
            sauceMaskNode.active = true;
        }, 0.42);

        if (!XCT_HJM_DataManager.Instance.currentDishes[this.node.name]) {
            XCT_HJM_DataManager.Instance.currentDishes[this.node.name] = {
                type: XCT_HJM_IngredientType.SPICE,
                need: 1,
                count: 0,
                percentage: 0,
                rotateCount: 0
            }
        }
        XCT_HJM_DataManager.Instance.currentDishes[this.node.name].count++;

        XCT_HJM_DataManager.Instance.playerData.money -= XCT_HJM_DataManager.Instance.ingredientsConfigObject[this.node.name].cost;
        XCT_HJM_DataManager.Instance.dayCost += XCT_HJM_DataManager.Instance.ingredientsConfigObject[this.node.name].cost;
        EventManager.Scene.emit(XCT_Events.HJM_Update_Money);
    }

    private destorySauceNode() {
        if (this.sauceNode) {
            this.sauceNode.off("click", this.onSauceNodeClick, this);
            let animation = this.sauceNode.getComponent(Animation);
            if (this.sauceType == 0) {
                animation.play("jiang_2");
            }
            else {
                animation.play("cu_2");
            }
            this.scheduleOnce(() => {
                if(this.sauceNode && this.sauceNode.isValid){
                    this.sauceNode.destroy();
                }

                this.sauceNode = null;
                this.node.getChildByName("icon").active = true;
                this.node.getComponent(Button).enabled = true;
            }, 0.17);
        }
        else {
            this.node.getChildByName("icon").active = true;
            this.node.getComponent(Button).enabled = true;
        }

    }

    private addListener() {
        EventManager.on(XCT_Events.HJM_Cancel_All_Ingredients, this.onCancel_Click, this);
        this.node.on("click", this.onClick, this);
    }

    private removeListener() {
        EventManager.off(XCT_Events.HJM_Cancel_All_Ingredients, this.onCancel_Click, this);
    }

    onDestroy() {
        this.removeListener();
    }
}


