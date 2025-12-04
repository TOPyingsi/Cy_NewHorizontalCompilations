import { _decorator, Component, instantiate, math, Node, Prefab } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('HJMSJ_MapCtrl')
export class HJMSJ_MapCtrl extends Component {
    @property({ type: [Prefab] })
    blockPrefab: Prefab[] = [];

    @property(Node)
    posParent: Node = null;

    @property(Prefab)
    bossPrefab: Prefab[] = [];

    private Boss: Node = null;

    start() {
        this.schedule(this.creatBlock, 0.5);

        this.schedule(this.creatBoss, 10);
    }

    update(deltaTime: number) {

    }

    creatBoss() {
        if (this.Boss) {
            return;
        }

        let bossRandom = Math.random() * 5;
        if (bossRandom < 2) {
            let boss = instantiate(this.blockPrefab[math.randomRangeInt(0, this.bossPrefab.length)]);
            boss.parent = this.node.getChildByName("AICtrl").getChildByName("AIParent");
            let AIStartPos = this.node.getChildByName("AICtrl").getChildByName("AIStartPos");
            boss.worldPosition = AIStartPos.children[math.randomRangeInt(0, AIStartPos.children.length)].worldPosition.clone();
            this.Boss = boss;
        }
    }

    index: number = 0;
    creatBlock() {
        if (this.index < this.posParent.children.length) {
            let random = math.randomRangeInt(0, this.blockPrefab.length);
            let blockNode = instantiate(this.blockPrefab[random]);
            let pos = this.posParent.children[this.index].position.clone();
            blockNode.parent = this.node.children[0];
            blockNode.position = pos;
            this.index++;
        }
        else {
            this.unschedule(this.creatBlock);
        }
    }
}


