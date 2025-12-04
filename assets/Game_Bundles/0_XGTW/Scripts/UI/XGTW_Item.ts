import { _decorator, Component, Button, Sprite, Label, Node, SpriteFrame, v3 } from 'cc';
const { ccclass, property } = _decorator;

import { XGTW_AudioManager } from '../XGTW_AudioManager';
import { BundleManager } from '../../../../Scripts/Framework/Managers/BundleManager';
import NodeUtil from '../../../../Scripts/Framework/Utils/NodeUtil';
import { XGTW_ItemType, XGTW_Constant } from '../Framework/Const/XGTW_Constant';
import { GameManager } from '../../../../Scripts/GameManager';
import { XGTW_ItemData, XGTW_冲锋枪, XGTW_头盔, XGTW_子弹, XGTW_射手步枪, XGTW_手枪, XGTW_投掷物, XGTW_栓动步枪, XGTW_突击步枪, XGTW_药品, XGTW_轻机枪, XGTW_防弹衣, XGTW_霰弹枪 } from '../Datas/XGTW_Data';

@ccclass('XGTW_Item')
export default class XGTW_Item extends Component {
    Button: Button | null = null;
    Icon: Sprite | null = null;
    Quality: Sprite | null = null;
    Price: Label | null = null;
    Count: Label | null = null;
    Bottom: Node | null = null;
    Select: Node | null = null;
    data: XGTW_ItemData;
    cb: Function = null;
    preload(): void {
        this.Icon = NodeUtil.GetComponent("Icon", this.node, Sprite);
        this.Quality = NodeUtil.GetComponent("Quality", this.node, Sprite);
        this.Price = NodeUtil.GetComponent("Price", this.node, Label);
        this.Count = NodeUtil.GetComponent("Count", this.node, Label);
        this.Bottom = NodeUtil.GetNode("Bottom", this.node);
        this.Select = NodeUtil.GetNode("Select", this.node);
        this.Button = this.node.getComponent(Button);
    }
    Init(data, cb: Function = null, isInShop: boolean = true) {
        this.preload();
        this.Reset();

        this.data = data;
        this.cb = cb;

        this.Bottom.active = isInShop;
        this.Count.node.active = !isInShop;

        if (isInShop) {
            this.Price.string = `${data.Price}`;
        } else {
            this.Count.string = `${data.Count}`;
        }

        if (data.Type == XGTW_ItemType[XGTW_ItemType.头盔] || data.Type == XGTW_ItemType[XGTW_ItemType.防弹衣] ||
            data.Type == XGTW_ItemType[XGTW_ItemType.背包] || data.Type == XGTW_ItemType[XGTW_ItemType.枪口] ||
            data.Type == XGTW_ItemType[XGTW_ItemType.瞄具] || data.Type == XGTW_ItemType[XGTW_ItemType.子弹] ||
            data.Type == XGTW_ItemType[XGTW_ItemType.弹匣] || data.Type == XGTW_ItemType[XGTW_ItemType.握把] ||
            data.Type == XGTW_ItemType[XGTW_ItemType.药品] || data.Type == XGTW_ItemType[XGTW_ItemType.投掷物] ||
            data.Type == XGTW_ItemType[XGTW_ItemType.枪托] || data.Type == XGTW_ItemType[XGTW_ItemType.枪口] ||
            data.Type == XGTW_ItemType[XGTW_ItemType.热卖新品] || data.Type == XGTW_ItemType[XGTW_ItemType.抽奖礼包] ||
            data.Type == XGTW_ItemType[XGTW_ItemType.战利品]
        ) {
            this.Icon.node.angle = 0;
            this.Icon.node.setScale(1, 1);
        }
        else {
            this.Icon.node.angle = -45;
            let scaleX = XGTW_ItemType.手枪 == XGTW_ItemData.GetItemType(this.data.Type) ? 2.5 : 1;
            this.Icon.node.setScale(-scaleX, scaleX);
        }

        BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Sprites/Quality/Quality_${data.Quality}`).then((sf: SpriteFrame) => {
            this.Quality.spriteFrame = sf;
        });

        BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Sprites/Items/${data.Type}/${data.Name.replace(/^\./, '')}`).then((sf: SpriteFrame) => {
            this.Icon.spriteFrame = sf;
        });
    }
    InitSimple(data, isInShop: boolean = true) {
        this.Init(data, null, isInShop);
        this.Button.enabled = false;
        this.Bottom.active = false;
    }
    Reset() {
        this.Button.enabled = true;
        this.Bottom.active = true;
        this.Select.active = false;
    }
    SetSelect(data: XGTW_ItemData) {
        this.Select.active = this.data == data;
    }
    头盔(data: XGTW_头盔) {
        this.data = data;
        this.Init(data);
        this.Icon.node.setScale(v3(0.5, 0.5));
    }
    防弹衣(data: XGTW_防弹衣) {
        this.data = data;
        this.Init(data);
        this.Icon.node.setScale(v3(0.8, 0.8));
    }
    手枪(data: XGTW_手枪) {
        this.data = data;
        this.Init(data);
        this.Icon.node.setScale(v3(0.8, 0.8));
    }
    突击步枪(data: XGTW_突击步枪) {
        this.data = data;
        this.Init(data);
    }
    冲锋枪(data: XGTW_冲锋枪) {
        this.data = data;
        this.Init(data);
    }
    射手步枪(data: XGTW_射手步枪) {
        this.data = data;
        this.Init(data);
    }
    栓动步枪(data: XGTW_栓动步枪) {
        this.data = data;
        this.Init(data);
    }
    轻机枪(data: XGTW_轻机枪) {
        this.data = data;
        this.Init(data);
    }
    霰弹枪(data: XGTW_霰弹枪) {
        this.data = data;
        this.Init(data);
    }
    投掷物(data: XGTW_投掷物) {
        this.data = data;
        this.Init(data);
    }
    子弹(data: XGTW_子弹) {
        this.data = data;
        this.Init(data);
        this.Icon.node.setScale(v3(0.8, 0.8));
    }
    药品(data: XGTW_药品) {
        this.data = data;
        this.Init(data);
        this.Icon.node.setScale(XGTW_ItemData.GetScale(data.Type));
    }
    OnButtonClick() {
        XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.ButtonClick);
        this.cb && this.cb(this.data);
    }
}