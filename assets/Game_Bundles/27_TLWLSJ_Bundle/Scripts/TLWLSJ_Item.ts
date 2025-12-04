import { _decorator, Component, Enum, EventTouch, find, instantiate, Label, Node, Prefab } from 'cc';
import { TLWLSJ_ITEM } from './TLWLSJ_Constant';
import { TLWLSJ_Backpack } from './TLWLSJ_Backpack';
import { TLWLSJ_GameData } from './TLWLSJ_GameData';
import { TLWLSJ_GameManager } from './TLWLSJ_GameManager';
import { TLWLSJ_HintController } from './TLWLSJ_HintController';
import { TLWLSJ_Bullet } from './TLWLSJ_Bullet';
import { Audios, TLWLSJ_AudioManager } from './TLWLSJ_AudioManager';
import { TLWLSJ_TipsController } from './TLWLSJ_TipsController';
import { TLWLSJ_Magazine } from './TLWLSJ_Magazine';
import { TLWLSJ_EventManager, TLWLSJ_MyEvent } from './TLWLSJ_EventManager';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
import { GameManager } from '../../../Scripts/GameManager';
const { ccclass, property } = _decorator;

@ccclass('TLWLSJ_Item')
export class TLWLSJ_Item extends Component {

    @property({ type: Enum(TLWLSJ_ITEM) })
    ItemType: TLWLSJ_ITEM = TLWLSJ_ITEM.WEAPON;

    @property({ type: Boolean, displayName: "是否有弹匣" })
    HaveMagazine: boolean = false;

    @property({ type: Boolean, displayName: "是否是新建弹匣" })
    IsNewMagazine: boolean = false;

    Name: string = "";
    IsChecked: boolean = false;
    Checked: Node = null;

    private _type: string;
    private _isClick: boolean = false;

    protected onLoad(): void {
        this.Checked = this.node.getChildByName("选中框");
        this.node.on(Node.EventType.TOUCH_END, this.onTouchend, this);
        if (this.IsNewMagazine) {
            return;
        }
        if (this.ItemType == TLWLSJ_ITEM.WEAPON) {
            TLWLSJ_EventManager.on(TLWLSJ_MyEvent.TLWLSJ_WEAPON_UNCHECKED, this.uncheckedWeapon, this);
        } else if (this.ItemType == TLWLSJ_ITEM.MAGAZINE) {
            TLWLSJ_EventManager.on(TLWLSJ_MyEvent.TLWLSJ_MAGAZINE_UNCHECKED, this.uncheckedMagazine, this);
        } else if (this.ItemType == TLWLSJ_ITEM.BULLET) {
            TLWLSJ_EventManager.on(TLWLSJ_MyEvent.TLWLSJ_BULLET_UNCHECKED, this.uncheckedBullet, this);
        }
    }

    protected start(): void {
        if (this.ButtonNode) {
            this.ButtonNode.getChildByName("加1").on(Node.EventType.TOUCH_END, this.addBullet, this);
            this.ButtonNode.getChildByName("减1").on(Node.EventType.TOUCH_END, this.subBullet, this);
            this.ButtonNode.getChildByName("装满").on(Node.EventType.TOUCH_END, this.fillBullet, this);
        }
    }

    show(checked: boolean) {
        this.IsChecked = true;
        this.Checked.active = checked;
    }

    showMagazine() {
        this.IsChecked = true;
        this.Checked.active = true;
        this.ButtonNode.active = true;
    }

    onTouchend(event: EventTouch) {
        TLWLSJ_AudioManager.PlaySound(Audios.ButtonClick);
        if (TLWLSJ_TipsController.Instance.IsPack && this.node.name == "背包_武器_自动手枪" && !this._isClick) {
            this._isClick = true;
            TLWLSJ_TipsController.Instance.nextTips2D(1);
        }

        if (this.IsNewMagazine) {
            TLWLSJ_Backpack.Instance.newMagazine();
            if (TLWLSJ_TipsController.Instance.IsPack && !this._isClick) {
                this._isClick = true;
                TLWLSJ_TipsController.Instance.nextTips2D(2);
            }
        } else if (!this.IsChecked) {
            if (this.ItemType == TLWLSJ_ITEM.WEAPON) {
                TLWLSJ_EventManager.Scene.emit(TLWLSJ_MyEvent.TLWLSJ_WEAPON_UNCHECKED);
                this.IsChecked = true;
                this.Checked.active = true;
                TLWLSJ_Backpack.Instance.switchWeapon(this);
            } else if (this.ItemType == TLWLSJ_ITEM.MAGAZINE) {
                TLWLSJ_EventManager.Scene.emit(TLWLSJ_MyEvent.TLWLSJ_MAGAZINE_UNCHECKED);
                this.IsChecked = true;
                this.Checked.active = true;
                this.ButtonNode.active = true;
            } else if (this.ItemType == TLWLSJ_ITEM.BULLET) {
                TLWLSJ_EventManager.Scene.emit(TLWLSJ_MyEvent.TLWLSJ_BULLET_UNCHECKED);
                this.IsChecked = true;
                this.Checked.active = true;
                TLWLSJ_Backpack.Instance.CheckedBullet = this;
            }
        }
    }

    uncheckedWeapon() {
        TLWLSJ_AudioManager.PlaySound(Audios.ButtonClick);
        this.Checked.active = false;
        this.IsChecked = false;
    }

    uncheckedMagazine() {
        TLWLSJ_AudioManager.PlaySound(Audios.ButtonClick);
        this.Checked.active = false;
        this.IsChecked = false;
        this.ButtonNode.active = false;
    }

    uncheckedBullet() {
        TLWLSJ_AudioManager.PlaySound(Audios.ButtonClick);
        this.Checked.active = false;
        this.IsChecked = false;
    }

    //#region 弹匣包
    @property(Label)
    HaveLabel: Label = null;

    @property(Label)
    TotalLabel: Label = null;

    @property(Node)
    ButtonNode: Node = null;

    private _have: number = 0;
    private _total: number = 0;
    private _addNode: Node = null;
    private _subNode: Node = null;
    private _fillNode: Node = null;

    private _magazine: TLWLSJ_Magazine = null;

    // showMagazine(haveNumber: number, totalLabel: number) {
    //     this._have = haveNumber;
    //     this._total = totalLabel;
    //     this.HaveLabel.string = this._have.toString();
    //     this.TotalLabel.string = this._total.toString();
    // }

    addMagazine(magazine: TLWLSJ_Magazine) {
        this._magazine = magazine;
        this.showMagazineData();
    }

    showMagazineData() {
        this.HaveLabel.string = this._magazine.Bullets.length.toString();
        this.TotalLabel.string = this._magazine.Capacity.toString();
    }

    addBullet(event: EventTouch) {
        TLWLSJ_AudioManager.PlaySound(Audios.ButtonClick);
        if (!TLWLSJ_Backpack.Instance.CheckedBullet) {
            BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, "Hint").then((prefab: Prefab) => {
                const node: Node = instantiate(prefab);
                node.parent = TLWLSJ_GameManager.Instance.Canvas;
                const hint: string = `没有与之相匹配的子弹！`;
                node.getComponent(TLWLSJ_HintController).showHint(hint);
            })
        } else if (this._magazine.Bullets.length >= this._magazine.Capacity) {
            BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, "Hint").then((prefab: Prefab) => {
                const node: Node = instantiate(prefab);
                node.parent = TLWLSJ_GameManager.Instance.Canvas;
                const hint: string = `弹匣已满！`;
                node.getComponent(TLWLSJ_HintController).showHint(hint);
            })
        } else {
            this._magazine.Bullets.push(TLWLSJ_Backpack.Instance.CheckedBullet.Name);
            TLWLSJ_Backpack.Instance.CheckedBullet.subNumBullet();
            TLWLSJ_GameData.DateSave();
            this.showMagazineData();
        }
    }

    subBullet(event: EventTouch) {
        TLWLSJ_AudioManager.PlaySound(Audios.ButtonClick);
        if (this._magazine.Bullets.length <= 0) {
            BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, "Hint").then((prefab: Prefab) => {
                const node: Node = instantiate(prefab);
                node.parent = TLWLSJ_GameManager.Instance.Canvas;
                const hint: string = `弹匣中没有子弹！`;
                node.getComponent(TLWLSJ_HintController).showHint(hint);
            })
        } else {
            const name: string = this._magazine.Bullets.pop();
            TLWLSJ_GameData.addBulletByName(name);
            this.scheduleOnce(() => {
                TLWLSJ_Backpack.Instance.showBullet();
                TLWLSJ_GameData.DateSave();
                this.showMagazineData();
            })
        }
    }

    fillBullet(event: EventTouch) {
        TLWLSJ_AudioManager.PlaySound(Audios.ButtonClick);
        if (!TLWLSJ_Backpack.Instance.CheckedBullet) {
            BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, "Hint").then((prefab: Prefab) => {
                const node: Node = instantiate(prefab);
                node.parent = TLWLSJ_GameManager.Instance.Canvas;
                const hint: string = `没有与之相匹配的子弹！`;
                node.getComponent(TLWLSJ_HintController).showHint(hint);
            })
        } else if (this._magazine.Bullets.length >= this._magazine.Capacity) {
            BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, "Hint").then((prefab: Prefab) => {
                const node: Node = instantiate(prefab);
                node.parent = TLWLSJ_GameManager.Instance.Canvas;
                const hint: string = `弹匣已满！`;
                node.getComponent(TLWLSJ_HintController).showHint(hint);
            })
        } else {
            const need: number = this._magazine.Capacity - this._magazine.Bullets.length;
            const have: number = TLWLSJ_Backpack.Instance.CheckedBullet.HaveBulletCount;
            let count: number = need > have ? have : need;

            for (let index = 0; index < count; index++) {
                this._magazine.Bullets.push(TLWLSJ_Backpack.Instance.CheckedBullet.Name);
            }
            TLWLSJ_Backpack.Instance.CheckedBullet.subNumBullet(count);
            TLWLSJ_GameData.DateSave();
            this.showMagazineData();
        }
        if (TLWLSJ_TipsController.Instance.IsPack && !this._isClick) {
            this._isClick = true;
            TLWLSJ_TipsController.Instance.nextTips2D(3);
        }
    }

    //#region 子弹包
    @property(Label)
    CountLabel: Label = null;

    HaveBulletCount: number = 0;
    private _bullet: TLWLSJ_Bullet = null;

    addBulletTs(bullet: TLWLSJ_Bullet) {
        this.Name = bullet.Name;
        this._bullet = bullet;
        this.showBulletCount();
    }

    subNumBullet(num: number = 1) {
        const isExist: boolean = TLWLSJ_GameData.subBulletByName(this.Name, num);
        if (!isExist) {
            TLWLSJ_Backpack.Instance.showBullet();
            return;
        }
        this.showBulletCount();
    }

    showBulletCount() {
        this.HaveBulletCount = this._bullet.Count;
        this.CountLabel.string = this._bullet.Count.toString();
    }

}


