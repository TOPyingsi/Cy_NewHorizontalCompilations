import { _decorator, Component, Event, Node, Prefab, Sprite, SpriteFrame } from 'cc';
import { DMM_DataManager } from './DMM_DataManager';
import { PoolManager } from 'db://assets/Scripts/Framework/Managers/PoolManager';
import { DMM_Item } from './DMM_Item';
const { ccclass, property } = _decorator;

@ccclass('DMM_MainPanel')
export class DMM_MainPanel extends Component {

    @property([Prefab])
    shopPrefabs: Prefab[] = [];

    @property(Node)
    shopPanel: Node;

    @property(Node)
    subShops: Node;

    @property(Node)
    playerPanel: Node;

    @property(Node)
    players: Node;

    @property([SpriteFrame])
    playerGroupSfs: SpriteFrame[] = [];

    curShop = 0;

    start() {
        this._InitPlayerGroup();
    }

    update(deltaTime: number) {

    }

    _InitPlayerGroup() {
        let data = DMM_DataManager.Instance.getNumberData("PlayerGroup");
        let data2 = DMM_DataManager.Instance.getArrayData("PlayerGroups");
        for (let i = 0; i < this.players.children.length; i++) {
            const element = this.players.children[i].children[0].getComponent(Sprite);
            element.spriteFrame = this.playerGroupSfs[data == i ? 0 : data2[i] == 1 ? 1 : 2];
        }
    }

    _InitShop(num = 0) {
        this.subShops.children[this.curShop].active = false;
        this.curShop = num;
        this.subShops.children[this.curShop].active = true;
        let data = DMM_DataManager.Instance.getArrayData<number[]>("ShopItems")[num];
        let shop = this.subShops.children[this.curShop].children[0].children[0];
        for (let i = 0; i < data.length; i++) {
            const element = shop.children[i];
            if (!element) PoolManager.GetNodeByPrefab(this.shopPrefabs[num], shop);
            element.getComponent(DMM_Item)._Init(i, num);
        }
    }

    Shop() {
        this.shopPanel.active = true;
        this._InitShop();
    }

    SubShop(event: Event) {
        let target: Node = event.target;
        let num = target.getSiblingIndex();
        this._InitShop(num);
    }

    Player() {
        this.playerPanel.active = true;
    }

    ChoosePlayer(event: Event) {
        let target: Node = event.target;
        let num = target.getSiblingIndex();
        DMM_DataManager.Instance.setNumberData("PlayerGroup", num);
        this._InitPlayerGroup();
    }

}


