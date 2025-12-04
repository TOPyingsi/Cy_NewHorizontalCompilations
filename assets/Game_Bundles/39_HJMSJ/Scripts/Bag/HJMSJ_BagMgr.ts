import { _decorator, Button, Component, director, instantiate, Label, Node, NodeEventType, Prefab, Sprite, SpriteFrame, tween, UIOpacity, v3 } from 'cc';
import { HJMSJ_GameData } from '../HJMSJ_GameData';
import { HJMSJ_Constant } from '../HJMSJ_Constant';
import { HJMSJ_Incident } from '../HJMSJ_Incident';
import { HJMSJ_BagProp } from './HJMSJ_BagProp';
import { HJMSJ_BottomProp } from './HJMSJ_BottomProp';
import { HJMSJ_Armor } from './HJMSJ_Armor';
const { ccclass, property } = _decorator;

@ccclass('HJMSJ_BagMgr')
export class HJMSJ_BagMgr extends Component {
    @property(Prefab)
    BagPropPrefab: Prefab = null;

    @property(Button)
    openBtn: Button = null;

    @property(Button)
    closeBtn: Button = null;

    @property(Node)
    SelectBox: Node = null;
    @property(Node)
    SelectBoxBottom: Node = null;

    @property({ type: [Node] })
    ArmorNode: Node[] = [];

    @property(Node)
    propDetail: Node = null;

    public static curBagID: number = 1;

    public BagMgrNode: Node = null;
    public bottomBag: Node = null;

    start() {
        this.bottomBag = this.node.getChildByName("PropBag");
        this.BagMgrNode = this.node.getChildByName("BagMgr").getChildByName("背包");

        for (let k = 0; k < this.ArmorNode.length; k++) {
            this.ArmorNode[k].on(NodeEventType.TOUCH_END, () => {
                this.clickProp(-k - 1);
            }, this);
        }

        for (let j = 0; j < 36; j++) {
            let bagPropNode = instantiate(this.BagPropPrefab);
            bagPropNode.setParent(this.BagMgrNode);
            bagPropNode.getComponent(HJMSJ_BagProp).boxID = j;
        }

        for (let i = 0; i < HJMSJ_GameData.Instance.KnapsackData.length; i++) {
            if (HJMSJ_GameData.Instance.KnapsackData[i].Num <= 0) {
                continue;
            }

            let propData = HJMSJ_GameData.Instance.KnapsackData[i];
            this.creatProp(propData);
        }

        console.log(HJMSJ_GameData.Instance.KnapsackData);

        director.getScene().on("哈基米世界_点击道具", (bagID: number) => {
            this.clickProp(bagID);
        }, this);

        director.getScene().on("哈基米世界_点击底部道具", (boxID: number) => {
            this.clickBottomProp(boxID);
        }, this);
    }


    clickArr: Node[] = [];
    clickIndex: number[] = [];
    clickProp(bagID: number) {

        if (bagID < 0 && this.clickArr.length === 0) {
            this.SelectBox.active = true;
            this.SelectBox.worldPosition = this.ArmorNode[-bagID - 1].worldPosition;

            this.clickArr.push(this.ArmorNode[-bagID - 1]);
            return;
        }

        if (bagID >= 0) {
            let selectNode = this.BagMgrNode.children[bagID];

            this.clickArr.push(selectNode);
            this.clickIndex.push(bagID);

            this.SelectBox.active = true;
            this.SelectBox.worldPosition = selectNode.worldPosition;
        }
        else {
            this.clickArr.push(this.ArmorNode[-bagID - 1]);
        }

        if (this.clickArr.length === 2) {
            this.SelectBox.active = false;

            switch (this.clickArr[0].name) {
                case "背包框-打开":
                    this.clickArr = [];
                    this.clickIndex = [];
                    return;
                //若第一次点击是防具
                case "护甲":
                case "头盔":
                case "裤子":
                case "靴子":
                    if (this.clickArr[1].name === "背包框-打开") {
                        let armorData = HJMSJ_GameData.Instance.getArmorDataByPart(this.clickArr[0].name);
                        this.Disboard(armorData.Part, armorData.Name);
                        return;
                    } else {
                        this.clickArr = [];
                        this.clickIndex = [];
                        return;
                    }

            }
            let propType = HJMSJ_Constant.getTypeByName(this.clickArr[0].name);
            if (propType === "防具") {
                let partName = HJMSJ_Constant.GetArmorDataByName(this.clickArr[0].name).Part;
                let isWearing = HJMSJ_GameData.Instance.getArmorDataByPart(partName).Name;
                //若
                if (partName === this.clickArr[1].name) {
                    // 移动
                    if (isWearing === "") {
                        this.armorMove(partName, this.clickArr[0].name);
                    }
                    else {
                        this.clickArr = [];
                        this.clickIndex = [];
                    }
                    return;
                }
                else {
                    this.SelectBox.active = false;
                    this.moveProp();
                    return;
                }
            }

            if (this.clickArr[0].name !== "背包框-打开") {
                this.moveProp();
                return;
            }

            if (this.clickArr[1].name !== "背包框-打开") {
                this.clickArr = [];
                this.clickIndex = [];
                this.clickProp(bagID);
            }

            return;
        }

        // let detailNode = selectNode.getChildByName("propDetail");
        // detailNode.active = true;
        // let detailLabel = detailNode.getComponentInChildren(Label);
        // let propName = selectNode.getComponent(HJMSJ_BagProp).propName;
        // detailLabel.string = HJMSJ_Constant.GetDataByName(propName).describe;

        // this.propDetail.active = true;
        // let detailLabel = this.propDetail.getChildByName("label").getComponent(Label);
        // let propName = selectNode.getComponent(HJMSJ_BagProp).propName;
        // if (!propName || propName === "") {
        //     return;
        // }

        // detailLabel.string = HJMSJ_Constant.GetDataByName(propName).describe;
        // this.propDetail.worldPosition = selectNode.worldPosition.clone().add(v3(0, 150, 0));
    }

    clickBottomProp(boxID: number) {
        let selectNode = this.bottomBag.children[boxID];

        // this.clickArr.push(selectNode);
        // this.clickIndex.push(bagID);

        this.SelectBoxBottom.active = true;
        this.SelectBoxBottom.worldPosition = selectNode.worldPosition;

        let curPropName = selectNode.getComponent(HJMSJ_BottomProp).propName;

        director.getScene().emit("哈基米世界_更换底部道具", curPropName);
    }

    armorMove(partName: string, armorName: string) {
        let prop = instantiate(this.clickArr[0].getChildByName("propSprite"));
        prop.parent = this.node;
        prop.worldPosition = this.clickArr[0].worldPosition.clone();

        tween(prop)
            .to(0.2, { worldPosition: this.clickArr[1].worldPosition.clone() })
            .call(() => {
                let preIndex = this.clickArr[0].getSiblingIndex();

                if (preIndex < 9/* && nextIndex >= 9*/) {

                    let propTs = this.clickArr[0].getComponent(HJMSJ_BagProp);
                    let propNode = this.bottomBag.children[propTs.boxID];
                    propNode.getComponent(HJMSJ_BottomProp).resetData();
                    propTs.resetData();
                }

                let propTs = this.clickArr[0].getComponent(HJMSJ_BagProp);
                propTs.resetData();

                // this.refeshBottomProp();

                this.clickArr = [];
                this.clickIndex = [];
                prop.destroy();

                if (HJMSJ_GameData.Instance.SubKnapsackDataByBagID(propTs.bagID, 1)) {
                    this.subPropByName(armorName, 1);
                }

                director.getScene().emit("哈基米世界_刷新防具", partName, armorName)
            })
            .start();

    }

    Disboard(partName: string, armorName: string) {
        let prop = instantiate(this.clickArr[0].getChildByName("armorSprite"));
        prop.parent = this.node;
        prop.worldPosition = this.clickArr[0].worldPosition.clone();

        let propTs = this.clickArr[1].getComponent(HJMSJ_BagProp);

        tween(prop)
            .to(0.2, { worldPosition: this.clickArr[1].worldPosition.clone() })
            .call(() => {

                let armorTs = this.clickArr[0].getComponent(HJMSJ_Armor);
                armorTs.resetData();

                let nextIndex = this.clickArr[1].getSiblingIndex();

                if (nextIndex < 9/* && nextIndex >= 9*/) {
                    let propNode = this.bottomBag.children[propTs.boxID];
                    propNode.getComponent(HJMSJ_BottomProp).resetData();
                }

                this.refeshBottomProp();

                this.clickArr = [];
                this.clickIndex = [];
                prop.destroy();

                if (HJMSJ_GameData.Instance.pushKnapsackData(armorName, 1, nextIndex)) {
                    this.pushPropByName(armorName, 1, nextIndex);
                    HJMSJ_GameData.Instance.refreshArmorData(partName, "");
                }

            })
            .start();
    }

    moveProp() {
        switch (this.clickArr[1].name) {
            case "护甲":
            case "头盔":
            case "裤子":
            case "靴子":
                this.clickArr = [];
                this.clickIndex = [];
                return;
            default:
                break;
        }

        let prop = instantiate(this.clickArr[0].getChildByName("propSprite"));
        prop.parent = this.node;
        prop.worldPosition = this.clickArr[0].worldPosition.clone();

        let pos = this.clickArr[0].position.clone();
        this.clickArr[0].position = this.clickArr[1].position.clone();
        this.clickArr[1].position = pos;

        tween(prop)
            .to(0.2, { worldPosition: this.clickArr[0].worldPosition.clone() })
            .call(() => {
                let preIndex = this.clickArr[0].getSiblingIndex();
                let nextIndex = this.clickArr[1].getSiblingIndex();

                if (preIndex < 9/* && nextIndex >= 9*/) {
                    let propTs = this.clickArr[0].getComponent(HJMSJ_BagProp);
                    let propNode = this.bottomBag.children[propTs.boxID];
                    propNode.getComponent(HJMSJ_BottomProp).resetData();
                }

                this.clickArr[0].setSiblingIndex(this.clickIndex[1]);
                this.clickArr[1].setSiblingIndex(this.clickIndex[0]);

                this.refeshID();

                let preData = HJMSJ_GameData.Instance.getDataByBagID(preIndex);
                let nextData = HJMSJ_GameData.Instance.getDataByBagID(nextIndex);

                preIndex = this.clickArr[0].getSiblingIndex();
                nextIndex = this.clickArr[1].getSiblingIndex();

                if (preData) {
                    preData.BagID = preIndex;
                }
                if (nextData) {
                    nextData.BagID = nextIndex;
                }

                console.log(HJMSJ_GameData.Instance.KnapsackData);

                // if (this.clickArr[0].name !== "背包框") {
                //     let propData = HJMSJ_GameData.Instance.getDataByName(this.clickArr[0].name);
                //     propData.BagID = ;
                // }

                this.refeshBottomProp();

                this.clickArr = [];
                this.clickIndex = [];
                prop.destroy();
            })
            .start();

    }

    refeshBottomProp() {
        for (let i = 0; i < 9; i++) {
            let propData = HJMSJ_GameData.Instance.getDataByBagID(i);
            if (propData && propData.Num !== 0) {
                this.creatProp(propData);
            }

        }
    }

    refeshID() {
        for (let i = 0; i < 36; i++) {
            this.BagMgrNode.children[i].getComponent(HJMSJ_BagProp).refeshID(i);
        }
    }

    refeshBag() {
        for (let i = 0; i < this.BagMgrNode.children.length; i++) {
            let sprite = this.BagMgrNode.children[i].getChildByName("propSprite").getComponent(Sprite);
            if (!sprite.spriteFrame) {
                HJMSJ_BagMgr.curBagID = i;
                return;
            }
        }
    }

    pushPropByName(propName: string, propNum: number, BagID?: number) {
        let isRe = false;

        this.refeshBag();

        let propType = HJMSJ_Constant.GetDataByName(propName).type;
        if (propType !== "武器" && propType !== "防具") {
            this.BagMgrNode.children.forEach((element: Node) => {
                if (element.name == propName) {
                    // console.log("重复");
                    isRe = true;
                    return;
                }
            });
        }

        if (!isRe) {
            for (let data of HJMSJ_GameData.Instance.KnapsackData) {
                if (data.Name == propName) {
                    if (BagID) {
                        if (data.BagID !== BagID) {
                            continue;
                        }
                    }
                    else {
                        data.BagID = HJMSJ_BagMgr.curBagID;
                    }

                    this.creatProp(data);
                    return;
                }
            }

        }

        director.getScene().emit("哈基米世界_刷新道具", propName);
        director.getScene().emit("哈基米世界_刷新底部道具", propName);

    }

    subPropByName(propName: string, propNum: number) {
        director.getScene().emit("哈基米世界_刷新道具", propName);
        director.getScene().emit("哈基米世界_刷新底部道具", propName);
        this.refeshBag();
    }

    creatProp(propData: any) {
        console.log("创建道具");
        HJMSJ_Incident.LoadSprite("Sprites/物品/" + propData.Name).then((sp: SpriteFrame) => {
            let bagID = propData.BagID;
            // console.log("ID" + bagID);
            let propNode = this.BagMgrNode.children[bagID];
            propNode.name = propData.Name;

            if (!propNode) {
                return;
            }

            if (bagID < 9) {
                let bottomPropTs = this.bottomBag.children[bagID].getComponent(HJMSJ_BottomProp);
                bottomPropTs.boxID = bagID;
                bottomPropTs.init(propData, sp);
            }

            let propTs = propNode.getComponent(HJMSJ_BagProp);
            propTs.init(propData, sp);

            this.refeshBag();

        });
    }

    openBag() {
        let bg = this.node.getChildByName("bg");
        let bgOpacity = bg.getComponent(UIOpacity);

        this.openBtn.enabled = false;

        tween(bgOpacity)
            .to(0.5, { opacity: 255 })
            .start();

        tween(this.BagMgrNode.parent)
            .to(0.8, { position: v3(0, 0, 0) })
            .start();
    }

    closeBg() {
        let bg = this.node.getChildByName("bg");
        let bgOpacity = bg.getComponent(UIOpacity);

        this.closeBtn.enabled = false;

        tween(bgOpacity)
            .to(0.5, { opacity: 0 })
            .start();

        tween(this.BagMgrNode.parent)
            .to(0.8, { position: v3(0, -1200, 0) }, { easing: "backIn" })
            .call(() => {
                this.openBtn.enabled = true;
                this.closeBtn.enabled = true;
            })
            .start();

    }
}


