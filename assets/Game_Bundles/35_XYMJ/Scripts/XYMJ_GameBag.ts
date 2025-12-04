import { _decorator, Button, Camera, Component, director, Event, instantiate, Label, Layers, Node, NodeEventType, Prefab, ScrollView, Sprite, SpriteFrame, tween, v3 } from 'cc';
import { XYMJ_GameData } from './XYMJ_GameData';
import { XYMJ_Incident } from './XYMJ_Incident';
import { XYMJ_Constant } from './XYMJ_Constant';
import { XYMJ_GameManager } from './XYMJ_GameManager';
import { XYMJ_Detail } from './XYMJ_Detail';
import { XYMJ_BagProp } from './XYMJ_BagProp';
const { ccclass, property } = _decorator;

@ccclass('XYMJ_GameBag')
export class XYMJ_GameBag extends Component {

    @property(Node)
    removeBtn: Node = null;
    @property(Prefab)
    bagPropPrefab: Prefab = null;
    @property(Camera)
    mapCamera: Camera = null;

    public bagContent: Node = null;
    public bagScorllView: ScrollView = null;

    public showBagBtn: Button = null;
    public CloseBagTouch: Node = null;
    public DetailNode: Node = null;

    public initDouble: boolean = false;
    public scrollMap: Map<string, Node> = new Map();
    public bagMap: Map<string, Node> = new Map();
    start() {
        this.bagContent = this.node.getChildByName("BagContentBg").getChildByName("BagContent");
        this.bagScorllView = this.node.getChildByName("BagScorllView").getComponent(ScrollView);

        this.showBagBtn = this.node.getChildByName("ShowBagBtn").getComponent(Button);
        this.DetailNode = this.node.getChildByName("Detail");

        this.CloseBagTouch = this.node.getChildByName("CloseBagTouch");

        for (let i = 0; i < XYMJ_GameData.Instance.KnapsackData.length; i++) {
            if (XYMJ_GameData.Instance.KnapsackData[i].Num <= 0) {
                continue;
            }

            // if (XYMJ_GameData.Instance.KnapsackData[i].Num > 1) {
            //     this.getProp(XYMJ_GameData.Instance.KnapsackData[i].Name, XYMJ_GameData.Instance.KnapsackData[i].Num);
            //     continue;
            // }

            // this.getProp(XYMJ_GameData.Instance.KnapsackData[i].Name);

            this.addPropToBagByName(XYMJ_GameData.Instance.KnapsackData[i].Name, 0);

        }

        director.getScene().on("校园摸金_获得道具", (name: string, num: number) => {
            this.addPropToBagByName(name, num);
        }, this);
    }

    openDoor(doorName: string) {
        XYMJ_GameData.Instance.SubKnapsackData(doorName, 1);

        director.getScene().emit("校园摸金_添加道具", doorName);

    }

    showBag() {
        this.showBagBtn.enabled = false;
        tween(this.bagContent.parent)
            .by(0.5, { position: v3(-1170, 0, 0) })
            .call(() => {
                this.CloseBagTouch.active = true;
                this.CloseBagTouch.once(NodeEventType.TOUCH_END, this.closeBag, this);
            })
            .start();

    }

    closeBag() {
        tween(this.bagContent.parent)
            .by(0.5, { position: v3(1170, 0, 0) })
            .call(() => {
                this.CloseBagTouch.active = false;
                this.showBagBtn.enabled = true;
            })
            .start();
    }

    getProp(propName: string, num?: number) {
        let bagData = 0;
        for (let j = 0; j < XYMJ_GameData.Instance.KnapsackData.length; j++) {
            if (XYMJ_GameData.Instance.KnapsackData[j].Num > 0) {
                bagData++;
            }
        }
        let needCreate = false;

        if (bagData === 1) {
            needCreate = true;
        }

        for (let i = 0; i < bagData - 1; i++) {
            if (XYMJ_GameData.Instance.GetPropNum(propName) <= 0) {
                continue;
            }

            if (num) {
                needCreate = true;
            }

            if (propName === this.bagScorllView.content.children[i].name) {

                let prop1 = this.bagScorllView.content.children[i];
                prop1.name = propName;
                let propNumLabel1 = prop1.getChildByName("propNum").getComponent(Label);
                let propNum = XYMJ_GameData.Instance.GetPropNum(propName);
                propNum++;
                console.log(propName + "获得了" + propNum);
                propNumLabel1.string = propNum.toString();

                let prop2 = this.bagContent.children[i];
                prop2.name = propName;
                let propNumLabel2 = prop2.getChildByName("propNum").getComponent(Label);
                propNumLabel2.string = propNum.toString();

            }
            else {
                needCreate = true;
            }
        }

        if (needCreate) {
            this.addPropToBagByName(propName, num);
        }

        // director.getScene().emit("校园摸金_更新战获");
    }

    //添加道具
    addPropToBagByName(propName: string, num: number) {

        director.getScene().emit("校园摸金_添加道具", propName);
        let isRe: boolean = false;
        this.bagScorllView.content.children.forEach((element: Node) => {
            if (element.name == propName) {
                console.log("重复");
                isRe = true;
                return;
            }
        });

        if (isRe) {
            return;
        }

        XYMJ_Incident.LoadSprite("Sprites/Prop/" + propName).then((sp: SpriteFrame) => {
            if (this.node?.isValid) {
                console.log("创建");

                //底部滑动背包
                let propNode1 = instantiate(this.bagPropPrefab);
                propNode1.name = propName;
                propNode1.parent = this.bagScorllView.content;
                propNode1.getComponent(XYMJ_BagProp).propName = propName;
                propNode1.getComponent(XYMJ_BagProp).Init();

                //右侧框背包
                let propNode2 = instantiate(this.bagPropPrefab);
                propNode2.scale = v3(2, 2, 2);
                propNode2.name = propName;
                propNode2.parent = this.bagContent;
                propNode2.getComponent(XYMJ_BagProp).propName = propName;
                propNode2.getComponent(XYMJ_BagProp).Init();

                let sptrite1 = propNode1.getChildByName("propIcon").getComponent(Sprite);
                let sptrite2 = propNode2.getChildByName("propIcon").getComponent(Sprite);

                sptrite1.spriteFrame = sp;
                sptrite2.spriteFrame = sp;

                this.scrollMap.set(propName, propNode1);
                this.bagMap.set(propName, propNode2);

                propNode1.on(Node.EventType.TOUCH_END, () => { this.changeProp(propName) });
                propNode2.on(Node.EventType.TOUCH_END, () => { this.clickProp(propName) });

            }

        });
    }

    //移除道具
    removePropFromBag(propName: string) {
        let scorllProp: Node = this.scrollMap.get(propName);
        this.scrollMap.delete(propName);
        scorllProp?.destroy();

        let bagProp = this.bagMap.get(propName);
        this.bagMap.delete(propName);
        bagProp?.destroy();

        XYMJ_GameData.Instance.SubKnapsackData(propName, 1);

        // propNode.layer = 1 << 2;
        // propNode.parent = XYMJ_GameManager.Instance.player.node.parent.parent;
        // propNode.setSiblingIndex(XYMJ_GameManager.Instance.propLayer);
        // propNode.worldPosition = XYMJ_GameManager.Instance.player.node.worldPosition.clone();

        // let bagPropTs = propNode.getComponent(XYMJ_BagProp);
        // bagPropTs.propName = propName;

        this.DetailNode.active = false;
    }

    //右侧背包点击事件(可丢弃)
    curclickPropName: string = "";
    clickProp(propName: string) {
        let _type = XYMJ_Constant.GetDataByName(propName).type;
        this.curclickPropName = propName;
        if (_type === "消耗品") {
            switch (propName) {
                case "柑橘辣片":
                    XYMJ_GameManager.Instance.player.health(100);

                    break;
                case "香喷喷烤鸡":
                    XYMJ_GameManager.Instance.player.health(300);

                    break;
                case "牢大冰红茶":
                    XYMJ_GameManager.Instance.player.health(1200);

                    break;

            }
            XYMJ_GameData.Instance.SubKnapsackData(propName, 1);

            director.getScene().emit("校园摸金_添加道具", propName);

            return;
        }

        if (_type !== "武器") {

            //弹出丢弃按钮
            this.DetailNode.active = true;
            let detailTs = this.DetailNode.getComponent(XYMJ_Detail);
            let propData = XYMJ_Constant.GetDataByName(propName);
            detailTs.initData(propData);

            this.removeBtn.on(NodeEventType.TOUCH_END, () => {
                this.removePropFromBag(this.curclickPropName);
            })
        }
    }

    //底部滑动背包事件(不可丢弃,可使用道具和切换武器)
    changeProp(propName: string) {

        let _type = XYMJ_Constant.GetDataByName(propName).type;
        if (_type !== "武器") {
            // 消耗品
            if (_type === "消耗品") {
                switch (propName) {
                    case "柑橘辣片":
                        XYMJ_GameManager.Instance.player.health(100);

                        break;
                    case "香喷喷烤鸡":
                        XYMJ_GameManager.Instance.player.health(300);

                        break;
                    case "牢大冰红茶":
                        XYMJ_GameManager.Instance.player.health(1200);

                        break;
                }
                XYMJ_GameData.Instance.SubKnapsackData(propName, 1);

                director.getScene().emit("校园摸金_添加道具", propName);

            }
            // //弹出丢弃按钮
            // else {
            //     this.DetailNode.active = true;
            //     let detailTs = this.DetailNode.getComponent(XYMJ_Detail);
            //     let propData = XYMJ_Constant.GetDataByName(propName);
            //     detailTs.initData(propData);

            //     detailTs.removeBtn.on(NodeEventType.TOUCH_END, () => {
            //         this.removePropFromBag(propName);
            //     })
            // }
            return;
        }

        XYMJ_Incident.Loadprefab("Prefabs/武器/" + propName).then((prefab: Prefab) => {
            if (this.node?.isValid) {

                let handProp = instantiate(prefab);
                XYMJ_GameManager.Instance.player.handProp.destroy();
                handProp.parent = XYMJ_GameManager.Instance.player.handRoot;
                XYMJ_GameManager.Instance.player.handProp = handProp;
                console.log(handProp.parent);

            }
            XYMJ_Constant.GetWeaponDataByName(propName);

        })
    }
}


