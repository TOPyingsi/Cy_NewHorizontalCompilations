import { _decorator, Component, director, Node, Sprite, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('YYB_objectController')
export class YYB_objectController extends Component {
    @property(Boolean)
    canCross: boolean = true;

    @property(SpriteFrame)
    sfs: SpriteFrame[] = [];


    protected start(): void {
        let idx = 4;
        console.log(director.getScene().name);
        this.getComponentInChildren(Sprite).spriteFrame = this.sfs[0];

    }
}


