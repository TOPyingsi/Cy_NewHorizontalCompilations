import { _decorator, BoxCollider2D, Component, Sprite, SpriteFrame, tween, v3 } from 'cc';
const { ccclass, property } = _decorator;

import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
import NodeUtil from '../../../Scripts/Framework/Utils/NodeUtil';
import { GameManager } from '../../../Scripts/GameManager';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import { XGTW_ItemData, XGTW_战利品 } from './Datas/XGTW_Data';
import { XGTW_DataManager } from './Framework/Managers/XGTW_DataManager';

@ccclass('XGTW_DroppedItem')
export default class XGTW_DroppedItem extends Component {
    Icon: Sprite | null = null;
    collider: BoxCollider2D | null = null;
    goodsDatas: XGTW_战利品[] = [];
    itemData: any = null;
    @property
    generateGun: boolean = false;
    onLoad() {
        this.Icon = NodeUtil.GetComponent("Icon", this.node, Sprite);
        this.collider = this.node.getComponent(BoxCollider2D);

        if (this.generateGun) {
            let type = XGTW_ItemData.GunTypes[Tools.GetRandomInt(0, XGTW_ItemData.GunTypes.length)];
            let data = Tools.Clone(XGTW_DataManager.ItemDatas.get(type)[Tools.GetRandomInt(0, XGTW_DataManager.ItemDatas.get(type).length)]);
            data.BulletCount = 500;
            this.Init(data);

            // let data = ZTool.DeepCopy(XGTW_DataManager.itemDatas.get(ItemType.冲锋枪).find(e => e.Name == "MAC10"));
            // data.BulletCount = 500;
            // this.Init(data);
        }
    }
    Init(data) {
        tween(this.node).to(1, { position: v3(this.node.position.x, this.node.position.y + 30) })
            .to(1, { position: v3(this.node.position.x, this.node.position.y) }).union().repeatForever().start();

        this.itemData = data;

        if (data) {
            BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Sprites/Items/${data.Type}/${data.Name.replace(/^\./, '')}`).then((sf: SpriteFrame) => {
                this.Icon.spriteFrame = sf;
            })
        }
    }
}