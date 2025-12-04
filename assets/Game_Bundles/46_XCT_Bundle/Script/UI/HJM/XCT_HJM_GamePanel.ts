import { _decorator, Button, Component, director, Graphics, instantiate, Label, Layout, Mask, Node, Tween, tween, UITransform, v2, Vec3, Widget } from 'cc';

import { EventManager, MyEvent } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { XCT_BasePanel, XCT_PanelAnimation } from '../../Common/XCT_BasePanel';
import { XCT_UILayer } from '../../Common/XCT_UILayer';
import { XCT_UIManager } from '../../Manager/XCT_UIManager';
import { XCT_UIPanel } from '../../Common/XCT_UIPanel';
import { XCT_Events } from '../../Common/XCT_Events';
import { XCT_HJM_DataManager } from '../../Manager/XCT_HJM_DataManager';
import { XCT_AudioManager } from '../../Manager/XCT_AudioManager';

const { ccclass, property } = _decorator;

@ccclass('XCT_HJM_GamePanel')
export class XCT_HJM_GamePanel extends XCT_BasePanel {
    protected defaultShowAnimation: XCT_PanelAnimation = XCT_PanelAnimation.SLIDE_FROM_BOTTOM;
    protected defaultHideAnimation: XCT_PanelAnimation = XCT_PanelAnimation.SLIDE_TO_BOTTOM;
    public defaultLayer: XCT_UILayer = XCT_UILayer.Game;
    protected animationDuration: number = 0.6;


    @property(Node)
    ingredientContainer: Node = null;

    @property(Node)
    spreadIngredientContainer: Node = null;

    @property(Node)
    noodleContainer: Node = null;

    @property(Node)
    soupContainer: Node = null;

    @property(Node)
    sauceContainer: Node = null;

    @property(Node)
    saltContainer: Node = null;


    @property(Node)
    btnNote1: Node = null;

    @property(Node)
    btnNote2: Node = null;

    @property(Node)
    NotePanel: Node = null;

    @property(Node)
    NotePos1: Node = null;

    @property(Node)
    NotePos2: Node = null;

    @property(Node)
    btnNoteClose: Node = null;

    @property(Node)
    paws: Node[] = [];

    @property(Node)
    bowlNode: Node = null;

    @property(Node)
    cookArea: Node = null;

    // @property(Node)
    // toolsLayer: Node = null;


    isAddedEvent: boolean = false;


    isArea2: boolean = false;

    private catIngredient: Node[] = [];
    private stealInterval: number = 2;
    private stealTimer: number = 0;
    private isPawPated: boolean = false;
    private tween: Tween<Node> = null;

    protected start(): void {
        if (!this.isAddedEvent) {
            this.addListener();
            this.isAddedEvent = true;
        }
    }


    init() {
        this.cookArea.children.forEach((node: Node) => {
            node.getComponent(Widget).enabled = true;
            let widget = node.getComponent(Widget)
            widget.updateAlignment();
            widget.enabled = false;
        })

        // cookArea.children.forEach((node: Node)=> {
        //     node.getComponent(Widget).enabled = false;
        //     // let widget = node.getComponent(Widget)
        //     // widget.updateAlignment();
        // })
        this.cookArea.getComponent(Layout).enabled = true;
        this.cookArea.getComponent(Layout).updateLayout()
        this.cookArea.getComponent(Layout).enabled = false;
        this.cookArea.getComponent(Widget).enabled = false;

        this.NotePanel.active = false;

        this.updateIngredientContainer();
        this.isArea2 = false;
        this.paws.forEach((node) => {
            node.active = false;
        })
    }

    changeCookArea() {
        tween(this.cookArea)
            .delay(0.2)
            .to(0.5, { position: new Vec3(-this.node.getComponent(UITransform).width, 0, 0) })
            .call(() => {
                EventManager.Scene.emit(XCT_Events.HandAnimation_End);
                this.isArea2 = true;
            })
            .start();
    }
    // startNewDish(){
    //     this.cookArea.children.forEach((node: Node)=> {
    //         node.getChildByName("Contanter").children.forEach((child: Node)=> {
    //             child.destroy();
    //         })
    //     })
    //     this.toolsLayer.children.forEach((node: Node)=> {
    //         node.destroy();
    //     })
    //     this.cookArea.getComponent(Graphics).enabled = false;
    //     this.cookArea.getComponent(Mask).enabled = false;
    // }

    // /** 打包食材 */
    // private onPackIngredients(): void {
    //     this.cookArea.children.forEach((node: Node)=> {
    //         let contanter = node.getChildByName("Contanter");
    //         if(!contanter) return;
    //         contanter.children.forEach((child: Node)=> {
    //             child.destroy();
    //         })
    //     })
    //     this.toolsLayer.children.forEach((node: Node)=> {
    //         node.destroy();
    //     })
    //     this.cookArea.getComponent(Graphics).enabled = false;
    //     this.cookArea.getComponent(Mask).enabled = false;
    // }


    /** 打包食材 */
    private onCompleted(): void {
        
        let bowl = instantiate(this.bowlNode);
        XCT_HJM_DataManager.Instance.endCooking(bowl);
        // XCT_UIManager.Instance.showPanel(XCT_UIPanel.HJM_DialoguePanel,null,()=>{
        //     XCT_UIManager.Instance.hidePanel(XCT_UIPanel.HJM_GamePanel);
        // },XCT_PanelAnimation.SLIDE_FROM_TOP);
    }

    updateIngredientContainer() {
        this.catIngredient = [];
        let count = 0;
        this.ingredientContainer.children.forEach((node: Node) => {
            if (XCT_HJM_DataManager.Instance.playerData.stock[node.name] && XCT_HJM_DataManager.Instance.playerData.stock[node.name] > 0) {
                node.active = true;
                count++;
                this.catIngredient.push(node);
            }
            else {
                node.active = false;
            }
        })

        if (count < this.ingredientContainer.children.length - 1) {
            this.ingredientContainer.getChildByName("空_配料").active = true;
            this.ingredientContainer.getChildByName("空_配料").on("click", this.onClickEmptyIngredient, this);
        }

        count = 0;
        this.spreadIngredientContainer.children.forEach((node: Node) => {
            if (XCT_HJM_DataManager.Instance.playerData.stock[node.name] && XCT_HJM_DataManager.Instance.playerData.stock[node.name] > 0) {
                node.active = true;
                count++;
            }
            else {
                node.active = false;
            }
        })
        if (count < this.spreadIngredientContainer.children.length - 1) {
            this.spreadIngredientContainer.getChildByName("空_配料").active = true;
            this.spreadIngredientContainer.getChildByName("空_配料").on("click", this.onClickEmptyIngredient, this);
        }

        count = 0;
        this.noodleContainer.children.forEach((node: Node) => {
            if (XCT_HJM_DataManager.Instance.playerData.stock[node.name] && XCT_HJM_DataManager.Instance.playerData.stock[node.name] > 0) {
                node.active = true;
                count++;
            }
            else {
                node.active = false;
            }
        })
        if (count < this.noodleContainer.children.length - 1) {
            this.noodleContainer.getChildByName("空_配料").active = true;
            this.noodleContainer.getChildByName("空_配料").on("click", this.onClickEmptyIngredient, this);
        }

        count = 0;
        this.soupContainer.children.forEach((node: Node) => {
            if (XCT_HJM_DataManager.Instance.playerData.stock[node.name] && XCT_HJM_DataManager.Instance.playerData.stock[node.name] > 0) {
                node.active = true;
                count++;
            }
            else {
                node.active = false;
            }
        })
        if (count < this.soupContainer.children.length - 1) {
            this.soupContainer.getChildByName("空_配料").active = true;
            this.soupContainer.getChildByName("空_配料").on("click", this.onClickEmptyIngredient, this);
        }

        count = 0;
        this.saltContainer.children.forEach((node: Node) => {
            if (XCT_HJM_DataManager.Instance.playerData.stock[node.name] && XCT_HJM_DataManager.Instance.playerData.stock[node.name] > 0) {
                node.active = true;
                count++;
            }
            else {
                node.active = false;
            }
        })
        // if(count < this.saltContainer.children.length - 1){
        //     this.saltContainer.getChildByName("空_配料").active = true;
        //     this.saltContainer.getChildByName("空_配料").on("click",this.onClickEmptyIngredient,this);
        // }

        count = 0;
        this.sauceContainer.children.forEach((node: Node) => {
            if (XCT_HJM_DataManager.Instance.playerData.stock[node.name] && XCT_HJM_DataManager.Instance.playerData.stock[node.name] > 0) {
                node.active = true;
                count++;
            }
            else {
                node.active = false;
            }
        })
        // if(count < this.sauceContainer.children.length - 1){
        //     this.sauceContainer.getChildByName("空_配料").active = true;
        //     this.sauceContainer.getChildByName("空_配料").on("click",this.onClickEmptyIngredient,this);
        // }
    }

    onClickEmptyIngredient() {
        EventManager.Scene.emit(XCT_Events.Hide_TutorialPanel);
        XCT_UIManager.Instance.showPanel(XCT_UIPanel.HJM_ShopPanel, true);
    }



    onClickNote() {
        XCT_AudioManager.getInstance().playSound("点击");
        EventManager.Scene.emit(XCT_Events.Hide_TutorialPanel);
        this.NotePanel.active = true;
        let nodeNode1 = this.NotePanel.getChildByName("noteNode");
        let nodeNode2 = this.NotePanel.getChildByName("takeoutNoteNode");
        nodeNode1.active = !XCT_HJM_DataManager.Instance.isTakeout;
        nodeNode2.active = XCT_HJM_DataManager.Instance.isTakeout;

        let noteNodeName = XCT_HJM_DataManager.Instance.isTakeout ? "takeoutNoteNode" : "noteNode";
        let node = this.NotePanel.getChildByName(noteNodeName)
        let noteContainer = node.getChildByName("noteContainer");
        let notes = XCT_HJM_DataManager.Instance.isTakeout ? XCT_HJM_DataManager.Instance.takeoutNotes : XCT_HJM_DataManager.Instance.notes;
        noteContainer.children.forEach((node: Node, index) => {
            if (index !== 0) {
                node.destroy();
            } else {
                node.active = false;
            }
        })

        let notePrefab = noteContainer.children[0];
        notes.forEach((note: string[]) => {
            let noteItem = instantiate(notePrefab);
            noteItem.parent = noteContainer;
            noteItem.getChildByName("lblQustion").getComponent(Label).string = note[0];
            noteItem.getChildByName("lblAnswer").getComponent(Label).string = note[1];
            noteItem.active = true;
        })

        node.setWorldPosition(this.NotePos1.worldPosition);
        tween(node)
            .to(0.3, { worldPosition: this.NotePos2.worldPosition })
            .start();
    }

    onClickCloseNote() {
        EventManager.Scene.emit(XCT_Events.Show_TutorialPanel);
        this.NotePanel.active = false;
    }



    update(dt: number) {
        if (XCT_HJM_DataManager.Instance.isPause ||
            !this.isArea2 ||
            XCT_HJM_DataManager.Instance.playerData.isAdoptedCat ||
            XCT_HJM_DataManager.Instance.isCatDriveAway ||
            XCT_HJM_DataManager.Instance.playerData.currentDay == 1 ||
            !XCT_HJM_DataManager.Instance.isCooking) return;

        this.stealTimer += dt;
        if (this.stealTimer >= this.stealInterval) {
            this.stealInterval = Math.random() * 2 + 15;
            this.stealTimer = 0;
            let index = Math.floor(Math.random() * this.paws.length);
            let paw = this.paws[index];
            if (index == 0 && this.catIngredient.length < 2) return;
            if (index == 1 && this.catIngredient.length < 4) return;
            if (index == 2 && this.catIngredient.length < 7) return;
            this.catSteal(paw, index);
        }
    }

    catSteal(paw: Node, idx: number) {
        paw.active = true;
        paw.getChildByName("button").off("click")
        paw.getChildByName("button").on("click", () => this.onPawClick(paw), this)
        let pawSp = paw.getChildByName("pawSp");
        let pawPos_0 = paw.getChildByName("pawPos_0");
        let pawPos_1 = paw.getChildByName("pawPos_1");
        let ingredientContainer = pawSp.getChildByName("ingredientContainer");
        ingredientContainer.active = false;
        paw.getChildByName("nodePat").active = false;

        let stealIngredient: string = null;
        pawSp.setWorldPosition(pawPos_0.worldPosition);
        this.tween = tween(pawSp)
            .to(1.5, { worldPosition: pawPos_1.worldPosition })
            .delay(1)
            .call(() => {
                let pawPos = paw.getChildByName("pawPos").getWorldPosition();
                this.catIngredient.forEach((ingredientNode: Node) => {
                    if (stealIngredient) return;
                    const uiTrans = ingredientNode.getComponent(UITransform);
                    const isInside = uiTrans.getBoundingBoxToWorld().contains(v2(pawPos.x, pawPos.y))
                    if (isInside) {
                        stealIngredient = ingredientNode.name;
                    }
                })
                ingredientContainer.children.forEach((node) => {
                    if (node.name !== stealIngredient) {
                        node.active = false;
                    }
                    else {
                        node.active = true;
                    }
                })
                ingredientContainer.active = true;

            })
            .to(0.2, { worldPosition: pawPos_0.worldPosition })
            .call(() => {
                paw.active = false;

                let cost = XCT_HJM_DataManager.Instance.ingredientsConfigObject[stealIngredient].cost;
                XCT_HJM_DataManager.Instance.playerData.money -= cost;
                EventManager.Scene.emit(XCT_Events.HJM_Update_Money);
                this.tween = null;
            })
            .start()
    }

    onPawClick(paw: Node) {
        XCT_AudioManager.getInstance().playSound("猫2");
        if (this.tween) this.tween.stop();
        let pawSp = paw.getChildByName("pawSp");
        let pawPos_0 = paw.getChildByName("pawPos_0");
        let ingredientContainer = pawSp.getChildByName("ingredientContainer");
        ingredientContainer.active = false;
        paw.getChildByName("nodePat").active = true;

        this.tween = null;
        this.tween = tween(pawSp)
            .to(0.2, { worldPosition: pawPos_0.worldPosition })
            .call(() => {
                paw.active = false;
                this.tween = null;
            })
            .start();
    }


    onPause() {
        if (this.tween) this.tween.pause();
    }

    onResume() {
        if (this.tween) this.tween.resume();
    }



    // 注册事件监听
    addListener() {
        EventManager.on(XCT_Events.HJM_Update_Ingredient, this.updateIngredientContainer, this);

        EventManager.on(XCT_Events.HJM_Change_CookArea, this.changeCookArea, this);
        // EventManager.on(XCT_Events.HJM_Pack_Ingredients, this.onPackIngredients, this);
        EventManager.on(XCT_Events.HJM_Completed, this.onCompleted, this);

        EventManager.on(XCT_Events.Game_Pause, this.onPause, this);
        EventManager.on(XCT_Events.Game_Resume, this.onResume, this);


        this.btnNote1.on("click", this.onClickNote, this);
        this.btnNote2.on("click", this.onClickNote, this);

        this.btnNoteClose.on("click", this.onClickCloseNote, this);
    }

    // 注销事件监听
    removeListener() {
        EventManager.off(XCT_Events.HJM_Update_Ingredient, this.updateIngredientContainer, this);

        EventManager.off(XCT_Events.HJM_Change_CookArea, this.changeCookArea, this);
        // EventManager.off(XCT_Events.HJM_Pack_Ingredients, this.onPackIngredients, this);
        EventManager.off(XCT_Events.HJM_Completed, this.onCompleted, this);
        EventManager.off(XCT_Events.Game_Pause, this.onPause, this);
        EventManager.off(XCT_Events.Game_Resume, this.onResume, this);
    }

    // 注销事件监听
    onDestroy() {
        this.removeListener();
        this.isAddedEvent = false;
    }
}








