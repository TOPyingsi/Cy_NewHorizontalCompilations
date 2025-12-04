import { _decorator, Component, Label, Node, Sprite, SpriteFrame } from 'cc';
import { DMM_DataManager } from './DMM_DataManager';
const { ccclass, property } = _decorator;

@ccclass('DMM_Item')
export class DMM_Item extends Component {

    @property(Sprite)
    itemSprite: Sprite;

    @property(Label)
    nameLabel: Label;

    @property(Label)
    numLabel: Label;

    @property(Node)
    itemStates: Node;

    @property([SpriteFrame])
    itemSfs: SpriteFrame[] = [];

    start() {

    }

    update(deltaTime: number) {

    }

    _Init(num: number, type: number) {
        this.itemSprite.spriteFrame = this.itemSfs[num];
        this.nameLabel && (this.nameLabel.string = DMM_DataManager.mapNames[num]);
        let num2 = DMM_DataManager.Instance.getArrayData<number[]>("ShopItems")[type][num];
        this.numLabel.string = "X" + num2;
        if (this.itemStates) {
            for (let i = 0; i < this.itemStates.children.length; i++) {
                const element = this.itemStates.children[i];
                element.active = num2 == i;
            }
        }
    }
}


