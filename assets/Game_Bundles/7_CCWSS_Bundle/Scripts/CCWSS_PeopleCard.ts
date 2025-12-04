import { _decorator, Component, Node, Sprite, SpriteFrame, SpriteRenderer, tween, v3 } from 'cc';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
const { ccclass, property } = _decorator;

@ccclass('CCWSS_PeopleCard')
export class CCWSS_PeopleCard extends Component {

    IsPass: boolean = false;

    start() {
        if (this.node.parent.name == "CardBase") {
            BundleManager.GetBundle("7_CCWSS_Bundle").load("UI/人物/" + (this.node.getSiblingIndex() + 1) + "/spriteFrame", SpriteFrame, (err, spf) => {
                if (err) console.log(err);
                this.node.getChildByName("Face").getComponent(SpriteRenderer).spriteFrame = spf;
            })
        }
    }

    Pass() {
        this.IsPass = true;
        tween(this.node)
            .to(1, { eulerAngles: v3(90, 0, 0) })
            .start()
    }

    NoPass() {
        this.IsPass = false;
        tween(this.node)
            .to(1, { eulerAngles: v3(-10, 0, 0) })
            .start()
    }

    InitGuessCard(selectIndex: number) {
        BundleManager.GetBundle("7_CCWSS_Bundle").load("UI/人物/" + (selectIndex + 1) + "/spriteFrame", SpriteFrame, (err, spf) => {
            if (err) console.log(err);
            this.node.getChildByName("Face").getComponent(SpriteRenderer).spriteFrame = spf;
        })
    }
}


