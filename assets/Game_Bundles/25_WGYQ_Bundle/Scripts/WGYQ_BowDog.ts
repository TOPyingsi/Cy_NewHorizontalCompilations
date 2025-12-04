import { _decorator, Component, Node, Sprite, SpriteFrame } from 'cc';
import { WGYQ_GameData } from './WGYQ_GameData';
import { WGYQ_YardManager } from './WGYQ_YardManager';
import { PoolManager } from 'db://assets/Scripts/Framework/Managers/PoolManager';
import { UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
const { ccclass, property } = _decorator;

@ccclass('WGYQ_BowDog')
export class WGYQ_BowDog extends Component {

    dogNumber: number;
    dogName: string;
    dogType: string;
    dogProperty: string;

    @property([SpriteFrame])
    dogSfs: SpriteFrame[] = [];

    sprite: Sprite;

    onLoad() {
        this.sprite = this.node.children[0].getComponent(Sprite);
    }

    update(deltaTime: number) {

    }

    Init(dog: { dogNumber: number, dogName: string, dogType: string, dogProperty: string }) {
        this.dogNumber = dog.dogNumber;
        this.dogName = dog.dogName;
        this.dogType = dog.dogType;
        this.dogProperty = dog.dogProperty;
        this.sprite.spriteFrame = this.dogSfs.find((value, index, obj) => { if (value.name == "Bow" + this.dogType) return value; });
    }

    GetDog() {
        let dog = {
            dogNumber: this.dogNumber,
            dogName: this.dogName,
            dogType: this.dogType,
            hp: 1000,
            coinTime: 30
        }
        if (WGYQ_YardManager.Instance.AddDog(dog)) {
            let data = WGYQ_GameData.Instance.getArrayData("Dog");
            data.push(dog);
            WGYQ_GameData.Instance.setArrayData("Dog", data);
            WGYQ_GameData.Instance.setObjectData("CurrentDog", {});
            WGYQ_GameData.Instance.setNumberData("IsCatch", 0);
            WGYQ_YardManager.Instance.InitString();
            this.scheduleOnce(() => { PoolManager.PutNode(this.node); });
        }
        else UIManager.ShowTip("狗窝不足");
    }

}
