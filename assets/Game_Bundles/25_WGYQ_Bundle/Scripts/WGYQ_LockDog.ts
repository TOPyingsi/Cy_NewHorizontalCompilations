import { _decorator, Component, Node, Sprite, SpriteFrame } from 'cc';
import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
const { ccclass, property } = _decorator;

@ccclass('WGYQ_LockDog')
export class WGYQ_LockDog extends Component {

    dogNumber: number;
    dogName: string;
    dogType: string;
    dogProperty: string;

    @property([SpriteFrame])
    dogSfs: SpriteFrame[] = [];

    sprite: Sprite;

    isAtk = false;

    onLoad() {
        this.sprite = this.node.children[0].getComponent(Sprite);
    }

    update(deltaTime: number) {

    }

    Init(dog: { dogNumber: number, dogName: string, dogType: string, dogProperty: string }, bool = false) {
        this.dogNumber = dog.dogNumber;
        this.dogName = dog.dogName;
        this.dogType = dog.dogType;
        this.dogProperty = dog.dogProperty;
        this.isAtk = bool;
        this.sprite.spriteFrame = this.dogSfs.find((value, index, obj) => { if (value.name == this.dogType + "笼子") return value; });
    }

    Battle() {
        UIManager.ShowPanel(Panel.LoadingPanel, "WGYQ_Battle");
    }

}
