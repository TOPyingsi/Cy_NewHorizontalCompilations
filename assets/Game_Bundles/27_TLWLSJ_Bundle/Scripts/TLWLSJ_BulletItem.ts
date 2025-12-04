import { _decorator, Button, Component, Enum, EventTouch, find, instantiate, JsonAsset, Label, Node, Prefab, Sprite, SpriteFrame } from 'cc';
import { TLWLSJ_BULLET, TLWLSJ_MAXPROPERTY, TLWLSJ_WEAPON } from './TLWLSJ_Constant';
import { TLWLSJ_PrefsManager } from './TLWLSJPrefsManager';
import { TLWLSJ_GameData } from './TLWLSJ_GameData';
import { TLWLSJ_GameManager } from './TLWLSJ_GameManager';
import { TLWLSJ_HintController } from './TLWLSJ_HintController';
import { TLWLSJ_Shop } from './TLWLSJ_Shop';
import { Audios, TLWLSJ_AudioManager } from './TLWLSJ_AudioManager';
import { TLWLSJ_Tool } from './TLWLSJ_Tool';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
import { GameManager } from '../../../Scripts/GameManager';
const { ccclass, property } = _decorator;

@ccclass('TLWLSJ_BulletItem')
export class TLWLSJ_BulletItem extends Component {

    @property({ type: Enum(TLWLSJ_BULLET) })
    BulletType: TLWLSJ_BULLET = TLWLSJ_BULLET.软铅弹头9x19mm;

    // @property({ type: Enum(WEAPON), displayName: "归属于" })
    BelongTo: TLWLSJ_WEAPON[] = [];

    @property
    Price: number = 0;

    @property(Node)
    Have: Node = null;

    @property(Node)
    NoHave: Node = null;

    Name: string = "";
    NameLabel: Label = null;
    IconSprite: Sprite = null;
    HarmLabel: Label = null;
    ArmorPenetrationLabel: Label = null;
    PriceLabel: Label = null;
    NumLabel: Label = null;

    HarmSprite: Sprite = null;
    APSprite: Sprite = null;

    Num: number = 1;

    private _isClick: boolean = false;//能否点击

    init(name: string, json: any) {
        this.NameLabel = find("name", this.node).getComponent(Label);
        this.IconSprite = find("Icon", this.node).getComponent(Sprite);
        this.NumLabel = find("数量", this.node).getComponent(Label);
        this.HarmLabel = find("伤害/伤害", this.node).getComponent(Label);
        this.ArmorPenetrationLabel = find("破甲/破甲", this.node).getComponent(Label);
        this.PriceLabel = find("价格/价格", this.node).getComponent(Label);

        this.HarmSprite = find("伤害/进度条底部/进度条", this.node).getComponent(Sprite);
        this.APSprite = find("破甲/进度条底部/进度条", this.node).getComponent(Sprite);

        this.NameLabel.string = name;
        BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, "BundleSprites/子弹/" + name).then((spriteFrame: SpriteFrame) => {
            this.IconSprite.spriteFrame = spriteFrame;
        })

        this.Name = name;
        this.Num = json.num;
        if (this.Num != 1) this.NumLabel.string = "X" + this.Num;
        const keys: string[] = json.belongTo;
        for (let index = 0; index < keys.length; index++) {
            const key = keys[index];
            this.BelongTo.push(TLWLSJ_WEAPON[key]);
        }
        const harm = json.harm;
        const ap = json.armorPenetration;
        this.Price = json.price;
        this.HarmLabel.string = harm.toString();
        this.ArmorPenetrationLabel.string = ap.toString();
        this.PriceLabel.string = this.Price.toString();

        this.HarmSprite.fillRange = harm / TLWLSJ_MAXPROPERTY.HARM;
        this.APSprite.fillRange = ap / TLWLSJ_MAXPROPERTY.AP;

        this.Have.on(Node.EventType.TOUCH_END, this.onHaveTouchEnd, this);
        this.NoHave.on(Node.EventType.TOUCH_END, this.onNoHaveTouchEnd, this);
        this.show();
    }

    initGrenade(name: string) {
        this.Name = name;
        this.Have.on(Node.EventType.TOUCH_END, this.onHaveTouchEnd, this);
    }

    show() {
        for (let index = 0; index < this.BelongTo.length; index++) {
            const belongTo = this.BelongTo[index];
            if (TLWLSJ_PrefsManager.Instance.userData.HaveWeapon.findIndex(e => e == belongTo) != -1) {
                this._isClick = true;
                this.Have.active = true;
                this.NoHave.active = false;
                return;
            } else {
                this._isClick = false;
                this.Have.active = false;
                this.NoHave.active = true;
            }
        }
    }

    onHaveTouchEnd(event: EventTouch) {
        TLWLSJ_AudioManager.PlaySound(Audios.ButtonClick);
        if (TLWLSJ_PrefsManager.Instance.userData.Gold >= this.Price) {
            TLWLSJ_GameData.addBulletByName(this.Name, this.Num);
            TLWLSJ_Shop.Instance.showGold(this.Price);
            TLWLSJ_PrefsManager.Instance.saveData();
            BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, "Hint").then((prefab: Prefab) => {
                const node: Node = instantiate(prefab);
                node.parent = TLWLSJ_GameManager.Instance.Canvas;
                const bulletNum: number = TLWLSJ_GameData.getBulletNumByName(this.Name);
                const hint: string = `购买成功！ ${this.Name}: X${bulletNum}`;
                node.getComponent(TLWLSJ_HintController).showHint(hint);
            })
        } else {
            BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, "Hint").then((prefab: Prefab) => {
                const node: Node = instantiate(prefab);
                node.parent = TLWLSJ_GameManager.Instance.Canvas;
                const hint: string = `余额不足！`;
                node.getComponent(TLWLSJ_HintController).showHint(hint);
            })
        }
    }
    onNoHaveTouchEnd(event: EventTouch) {
        BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, "Hint").then((prefab: Prefab) => {
            const node: Node = instantiate(prefab);
            node.parent = TLWLSJ_GameManager.Instance.Canvas;
            let hint: string = "没有武器：";
            for (let index = 0; index < this.BelongTo.length; index++) {
                const weapon: TLWLSJ_WEAPON = this.BelongTo[index];
                const weaponName: string = TLWLSJ_Tool.GetEnumKeyByValue(TLWLSJ_WEAPON, weapon);
                if (index == 0) {
                    hint += weaponName;
                } else {
                    hint += "或者" + weaponName;
                }
            }
            node.getComponent(TLWLSJ_HintController).showHint(hint);
        })
    }

    protected onEnable(): void {
        if (this.BulletType == TLWLSJ_BULLET.高爆手雷 || this.BulletType == TLWLSJ_BULLET.破片手雷) return;
        this.show();
    }
}


