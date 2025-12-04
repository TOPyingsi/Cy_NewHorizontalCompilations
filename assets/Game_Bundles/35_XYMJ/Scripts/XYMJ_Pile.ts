import { _decorator, Component, director, instantiate, math, Node, NodeEventType, Prefab, Sprite, SpriteFrame, tween, v3 } from 'cc';
import { XYMJ_GameData } from './XYMJ_GameData';
import { XYMJ_Prop } from './XYMJ_Prop';
import { XYMJ_Constant } from './XYMJ_Constant';
import { XYMJ_GameManager } from './XYMJ_GameManager';
import { XYMJ_Incident } from './XYMJ_Incident';
import { XYMJ_AudioManager } from './XYMJ_AudioManager';
import { UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
const { ccclass, property } = _decorator;

//开堆
@ccclass('XYMJ_Pile')
export class XYMJ_Pile extends Component {

    //道具预制体
    @property(Prefab)
    propPrefab: Prefab = null;

    isSearch: boolean = false;
    getNum: number = 0;

    //堆的质量
    pileType: number = 0;
    //堆最大容纳道具数量
    pileMaxContain: number = 3;
    //堆道具节点
    pilePropTsArr: XYMJ_Prop[] = [];

    minPercent: number = 0.1;

    start() {

    }

    update(deltaTime: number) {

    }

    qualityPool = [];
    creatProp() {
        this.getPool();
        for (let i = 0; i < this.pileMaxContain; i++) {
            //随机奖池品质
            let randomQuality: number = math.randomRange(this.minPercent, 1) * this.qualityPool.length;
            let propQuality: string = XYMJ_Constant.QualityType[Math.floor(randomQuality)];
            //随机抽一个稀有度池子
            let qualityPool = XYMJ_GameManager.Instance.propPoolMap.get(propQuality);
            //从池子中随机抽一个道具
            let propData = qualityPool[Math.floor(Math.random() * qualityPool.length)];
            //创建道具并赋值    

            let Pile = this.node.getChildByName("Pile");
            if (Pile && !Pile.active) {
                Pile.active = true;
            }

            let prop = instantiate(this.propPrefab);
            prop.parent = Pile;
            let propTs = prop.getComponent(XYMJ_Prop);
            propTs.initData(propData);

            this.pilePropTsArr.push(propTs);

            this.pilePropTsArr[i].node?.once(NodeEventType.TOUCH_END, () => {
                this.getProp(i);
            }, this);

            console.log("第一个道具为" + propData.Name + "，品质为" + propQuality + "，价值为" + propData.value);

        }

        this.isSearch = true;

        let title = this.node.getChildByName("pileName");
        title.active = true;
    }

    hidePile(flag: boolean) {
        if (this.node?.isValid) {
            this.node.getChildByName("Pile").active = flag;
            this.node.getChildByName("pileName").active = flag;
        }
    }

    getProp(index: number) {

        if (XYMJ_GameData.Instance.pushKnapsackData(this.pilePropTsArr[index].propName, 1)) {
            console.log("成功装入" + this.pilePropTsArr[index].propName);
            XYMJ_AudioManager.globalAudioPlay("捡东西");
            this.pilePropTsArr[index].getProp();
            this.getNum++;
            XYMJ_GameData.Instance.GameData[1] += 1;
            director.getScene().emit("校园摸金_获得道具", this.pilePropTsArr[index].propName, 1);

            if (this.getNum >= this.pileMaxContain) {
                this.node.children[1].destroy();
                this.node.children[2].destroy();
                this.showSearchEnd();
            }

        } else {
            UIManager.ShowTip("背包空间已满!");
        }
    }

    showSearchEnd() {

        let searchNode = this.node.getChildByName("searchEnd");
        searchNode.active = true;
        let title = this.node.getChildByName("pileName");
        title.active = false;

        tween(searchNode)
            .to(0.8, { scale: v3(2, 2, 2) })
            .to(0.3, { scale: v3(1, 1, 1), eulerAngles: v3(0, 0, 360) })
            .call(() => {
                let effectNode = instantiate(searchNode);
                effectNode.parent = this.node;

                let randomX = math.randomRange(-1, 1) * 50;

                tween(effectNode)
                    .by(2, { eulerAngles: v3(0, 0, 2160) })
                    .start();

                tween(effectNode)
                    .by(0.5, { position: v3(randomX, 50, 0) }, { easing: "backInOut" })
                    .by(1, { position: v3(0, -2500, 0) }, { easing: "circIn" })
                    .call(() => {
                        effectNode.destroy();
                    })
                    .start();

            })
            .start();

    }

    getPool() {
        switch (XYMJ_Constant.level) {
            case 1:
                this.qualityPool = Array.from(XYMJ_Constant.QualityType);
                this.qualityPool.splice(this.qualityPool.length - 1, 1);
                this.qualityPool.splice(this.qualityPool.length - 1, 1);
                this.minPercent = 0.01;
                return this.qualityPool;
            case 2:
                this.qualityPool = Array.from(XYMJ_Constant.QualityType);
                this.qualityPool.splice(this.qualityPool.length - 1, 1);
                this.qualityPool.splice(this.qualityPool.length - 1, 1);
                this.minPercent = 0.02;
                return this.qualityPool;
            case 3:
                this.qualityPool = Array.from(XYMJ_Constant.QualityType);
                this.qualityPool.splice(this.qualityPool.length - 1, 1);
                this.minPercent = 0.04;
                return this.qualityPool;
            case 4:
                this.qualityPool = Array.from(XYMJ_Constant.QualityType);
                this.minPercent = 0.05;
                return this.qualityPool;
            case 5:
                this.qualityPool = Array.from(XYMJ_Constant.QualityType);
                this.minPercent = 0.06;
                return this.qualityPool;

        }
    }
}
