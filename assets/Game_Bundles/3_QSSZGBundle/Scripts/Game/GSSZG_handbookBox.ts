import { _decorator, Component, Node, Sprite, SpriteFrame, UITransform } from 'cc';
import { QSSZG_Incident } from '../QSSZG_Incident';
const { ccclass, property } = _decorator;

@ccclass('GSSZG_handbookBox')
export class GSSZG_handbookBox extends Component {
    id: number = 0;
    Init() {
        QSSZG_Incident.LoadSprite("FishSprite/" + this.id + "_fish").then((sprite: SpriteFrame) => {
            this.node.getChildByName("sprite").getComponent(Sprite).spriteFrame = sprite;
        });
    }


}


