import { _decorator, Component, instantiate, math, Node, Prefab, v3 } from 'cc';
import { XYMJXXB_Constant } from './XYMJXXB_Constant';
const { ccclass, property } = _decorator;

@ccclass('XYMJXXB_AICtrl')
export class XYMJXXB_AICtrl extends Component {

    @property(Prefab)
    AIPrefab: Prefab = null;

    AINum: number = 10;

    AIStartPos: Node[] = [];
    AIParent: Node = null;

    start() {
        this.AIStartPos = this.node.getChildByName("AIStartPos").children;
        this.AIParent = this.node.getChildByName("AIParent");
        this.AINum = XYMJXXB_Constant.level * 5 + 10;
        if (XYMJXXB_Constant.mapID === "小学部") {
            this.AINum = XYMJXXB_Constant.level * 2 + 10;
        }
        this.creatAI();

    }

    update(deltaTime: number) {

    }

    creatAI() {
        let offset = v3(Math.random() * 50, Math.random() * 50, 0);
        let x = 0;
        for (let i = 0; i < this.AINum; i++) {
            let AINode = instantiate(this.AIPrefab);
            AINode.parent = this.AIParent;

            AINode.worldPosition = this.AIStartPos[x++].worldPosition.clone().add(offset);

            if (x >= this.AIStartPos.length) {
                x = 0;
            }
        }
    }


}


