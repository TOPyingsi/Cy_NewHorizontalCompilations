import { _decorator, Component, director, EventTouch, Label, Node, Sprite, SpriteFrame } from 'cc';
import { HJMSJ_Composition } from './HJMSJ_Composition';
import { HJMSJ_Constant } from '../HJMSJ_Constant';
import { HJMSJ_GameData } from '../HJMSJ_GameData';
import { HJMSJ_BagMgr } from '../Bag/HJMSJ_BagMgr';
import { UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
const { ccclass, property } = _decorator;

@ccclass('HJMSJ_Work')
export class HJMSJ_Work extends Component {
    @property({ type: [SpriteFrame] })
    propSptieFrames: SpriteFrame[] = [];

    @property(Sprite)
    resSprite: Sprite = null;

    @property(Node)
    bagMgr: Node = null;

    @property(Label)
    resNumLabel: Label = null;

    methodSprites: Sprite[] = [];

    public WorkBench: Node = null;
    public Panel: Node = null;

    start() {
        this.WorkBench = this.node.getChildByName("工作台-底版");
        this.Panel = this.node.getChildByName("面板");

        let nodes = this.WorkBench.getChildByName("所需物品").children;
        for (let node of nodes) {
            this.methodSprites.push(node.getComponentInChildren(Sprite));
        }

        director.getScene().on("哈基米世界_交互", (InteractTarget: string) => {
            if (InteractTarget === "工作台") {
                this.Panel.active = true;
            }
        });

    }

    update(deltaTime: number) {

    }

    onBtnClick(event: EventTouch) {
        switch (event.target.name) {
            case "关闭工作台":
                this.WorkBench.active = false;
                this.Panel.active = false;
                break;
            case "开始制作":
                this.makeProp();
                break;
            default:
                let compositionTs = event.target.getComponent(HJMSJ_Composition);
                if (compositionTs.compositionType) {
                    this.WorkBench.active = true;
                    //更换图片
                    this.showMethod(compositionTs);
                }
                else {
                    this.WorkBench.active = false;
                    this.refreshSprite();
                }
                break;
        }
    }

    makeProp() {
        if (!this.curProp) {
            return;
        }

        let flags: boolean[] = [];
        for (let i = 0; i < this.curProp.propNames.length; i++) {
            let dataArr = this.curProp.creatMethod.get(this.curProp.propNames[i]);

            let propName = dataArr[0];
            let needprop = dataArr[1];
            console.log("需要:" + propName + needprop + "个");

            let res = HJMSJ_GameData.Instance.GetPropNum(propName) >= needprop ? true : false;
            flags.push(res);
        }

        let couldMake = true;
        for (let flag of flags) {
            if (!flag) {
                couldMake = false;
                console.log("无法合成");
            }
        }

        if (couldMake) {
            for (let i = 0; i < this.curProp.propNames.length; i++) {
                let dataArr = this.curProp.creatMethod.get(this.curProp.propNames[i]);

                let propName = dataArr[0];
                let needprop = dataArr[1];

                if (HJMSJ_GameData.Instance.getKnapsackLength() >= 36) {
                    UIManager.ShowTip("背包已满,无法添加" + this.curProp.resProp);
                    return;
                }

                if (HJMSJ_GameData.Instance.SubKnapsackData(propName, needprop)) {
                    let bagMgrTs = this.bagMgr.getComponent(HJMSJ_BagMgr);
                    bagMgrTs.subPropByName(propName, needprop);
                    console.log("扣除成功");
                }
                // else {
                //     UIManager.ShowTip("材料不足,无法制作" + this.curProp.resProp);
                //     console.log("扣除失败");
                //     return;
                // }
            }

            //将合成物添加到背包

            if (HJMSJ_GameData.Instance.pushKnapsackData(this.curProp.resProp, this.curProp.resNum, HJMSJ_BagMgr.curBagID)) {
                let bagMgrTs = this.bagMgr.getComponent(HJMSJ_BagMgr);
                bagMgrTs.pushPropByName(this.curProp.resProp, this.curProp.resNum, HJMSJ_BagMgr.curBagID);
                UIManager.ShowTip("制作" + this.curProp.resProp + "成功!");
            }
            console.log(HJMSJ_GameData.Instance.KnapsackData);

        }
        else {
            UIManager.ShowTip("材料不足,无法制作" + this.curProp.resProp);
        }


        // console.log(HJMSJ_GameData.Instance.KnapsackData);
    }



    // HJMSJ_GameData.Instance.pushKnapsackData(this.curProp.node.name, 1, this.curProp.bagID);


    curProp: any = null;
    showMethod(data: HJMSJ_Composition) {
        this.refreshSprite();
        this.curProp = data;
        for (let i = 0; i < data.propNames.length; i++) {
            let dataArr = data.creatMethod.get(data.propNames[i]);

            for (let j = 0; j < dataArr[1]; j++) {
                let posIndex = dataArr[2][j];
                let sp = this.getSprite(data.propNames[i]);
                this.methodSprites[posIndex].spriteFrame = sp;
            }
        }

        let sp = this.getSprite(data.node.name);
        this.resSprite.spriteFrame = sp;

        this.resNumLabel.string = this.curProp.resNum;
    }

    refreshSprite() {
        for (let i = 0; i < this.methodSprites.length; i++) {
            this.methodSprites[i].spriteFrame = null;
        }
        this.resSprite.spriteFrame = null;
    }

    getSprite(name: string): SpriteFrame {
        for (let sp of this.propSptieFrames) {
            if (sp.name == name) {
                return sp;
            }
        }
    }
}


