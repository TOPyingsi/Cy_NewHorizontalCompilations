import { _decorator, Camera, Component, director, EventTouch, geometry, instantiate, Node, PhysicsSystem2D, Prefab, ProgressBar, Sprite, UI, UITransform, v2, v3, Vec2, Vec3 } from 'cc';
import { HJMSJ_Player } from './HJMSJ_Player';
import { HJMSJ_GameMgr } from '../HJMSJ_GameMgr';
import { HJMSJ_Incident } from '../HJMSJ_Incident';
import { HJMSJ_GameData } from '../HJMSJ_GameData';
const { ccclass, property } = _decorator;

@ccclass('HJMSJ_ATKJoyStick')
export class HJMSJ_ATKJoyStick extends Component {

    @property(Camera)
    public mapCamera: Camera = null;

    @property(ProgressBar)
    public chargeBar: ProgressBar = null;

    public playerTs: HJMSJ_Player = null;
    public JoyStickHandle: Node = null;
    public JoyStickBg: UITransform = null;

    public chargeTime: number = 0;  //蓄力计时器
    public chargeMax: number = 3;   //蓄力最大时间

    start() {
        this.playerTs = HJMSJ_GameMgr.instance.playerNode.getComponent(HJMSJ_Player);

        this.JoyStickBg = this.node.getChildByName("JoyStickBg").getComponent(UITransform);
        this.JoyStickHandle = this.node.getChildByName("JoyStickHandle");

        this.JoyStickBg.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.JoyStickBg.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.JoyStickBg.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.JoyStickBg.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    update(deltaTime: number) {
        if (this.startCharge) {
            this.chargeTime += deltaTime;
            if (this.chargeTime >= 0.5) {
                //蓄力大于0.5秒显示蓄力条
                this.chargeBar.node.active = true;
            }

            this.chargeBar.progress = this.chargeTime / this.chargeMax;

            if (this.chargeBar.progress >= 1) {
                //蓄力最大值
            }
        }
    }

    startCharge: boolean = false;
    onTouchStart(event: EventTouch) {
        switch (this.playerTs.handPropType) {
            case "武器":
                this.startCharge = true;
                break;
        }

    }

    onTouchMove(event: EventTouch) {

    }

    onTouchEnd(event: EventTouch) {
        switch (this.playerTs.handPropType) {
            case "武器":
                this.attack();
                break;
            case "方块":
                // let pos = v3(this.playerTs.node.worldPosition.clone());
                let sign = this.playerTs.forwardDir;
                let pos = this.playerTs.handPos.add(v3(-120 * sign, 0, 0));

                this.setBlock(this.playerTs.handPropName, pos);
                break;
        }

    } s

    attack() {
        this.startCharge = false;
        this.chargeBar.node.active = false;

        if (this.chargeTime > 0.5) {
            director.getScene().emit("哈基米世界_蓄力攻击");
        }
        else {
            director.getScene().emit("哈基米世界_普通攻击");
        }

        this.chargeTime = 0;
    }

    setBlock(blockName: string, pos: Vec3) {
        let mapNode = this.playerTs.mapUITransform.node;

        let grassNode = this.getGrassNode(mapNode, pos);

        let bagTs = HJMSJ_GameMgr.instance.BagMgrTs;
        if (HJMSJ_GameData.Instance.SubKnapsackData(blockName, 1)) {
            let propNum = HJMSJ_GameData.Instance.GetPropNum(blockName);
            if (propNum <= 0) {
                this.playerTs.handProp.getComponent(Sprite).spriteFrame = null;
                this.playerTs.handPropName = "";
                this.playerTs.handPropType = "";
            }
            bagTs.subPropByName(blockName, 1);
            console.log("移除" + blockName);
        }

        if (grassNode) {
            HJMSJ_Incident.Loadprefab("Prefabs/方块/" + blockName).then((prefab: Prefab) => {
                let blockNode = instantiate(prefab);

                blockNode.parent = grassNode.parent;

                blockNode.position = grassNode.position;

            });
        }
    }

    getGrassNode(mapNode: Node, pos: Vec3) {
        let finnalNode: Node = null;
        for (let j = 0; j < mapNode.children[0].children.length; j++) {

            let grassNode = mapNode.children[0].children[j];

            let UITrans = grassNode.getComponent(UITransform);
            let posX = grassNode.worldPosition.x - UITrans.width / 2;
            let posY = grassNode.worldPosition.y - UITrans.height / 2;
            if (pos.x > posX
                && pos.y > posY
                && pos.x < posX + UITrans.width
                && pos.y < posY + UITrans.height) {
                if (!grassNode.name.startsWith("grass")) {
                    console.log("土地上已经有方块");

                } else {
                    finnalNode = grassNode;
                }
            }
        }

        if (finnalNode) {
            return finnalNode;
        }
        console.log("没有找到符合条件的土地");
        return null;
    }

}


