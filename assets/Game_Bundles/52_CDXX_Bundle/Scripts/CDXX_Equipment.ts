import { _decorator, Component, find, instantiate, Label, Node, Prefab, Sprite, SpriteFrame, tween, Tween, UIOpacity } from 'cc';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { CDXX_ItemEquipment } from './CDXX_ItemEquipment';
import { CDXX_GameData } from './CDXX_GameData';
import { CDXX_ItemBackpack } from './CDXX_ItemBackpack';
import { CDXX_ELIXIR } from './CDXX_Constant';
import { CDXX_EventManager, CDXX_MyEvent } from './CDXX_EventManager';
const { ccclass, property } = _decorator;

@ccclass('CDXX_Equipment')
export class CDXX_Equipment extends Component {
    public static Instance: CDXX_Equipment = null;

    @property(Node)
    TargetPanel: Node = null;

    @property(Node)
    MoreContent: Node = null;

    @property(Prefab)
    ItemEquipmentPrefab: Prefab = null;

    @property(Prefab)
    ItemBackpackPrefab: Prefab = null;

    @property(Node)
    BackpackParticulars: Node = null;

    Content: Node = null;
    TipsLabel: Label = null;
    TipsUIOpacity: UIOpacity = null;

    MapPickaxeEquipment: Map<string, CDXX_ItemEquipment[]> = new Map();
    MapElixirEquipment: Map<string, CDXX_ItemEquipment[]> = new Map();

    private _backpackParticularsIcon: Sprite = null;
    private _backpackParticularsName: Label = null;
    private _backpackParticularsIntroduce: Label = null;

    protected onLoad(): void {
        CDXX_Equipment.Instance = this;
        this.Content = find("View/Content", this.node);
        this.TipsLabel = find("Tips", this.node).getComponent(Label);
        this.TipsUIOpacity = find("Tips", this.node).getComponent(UIOpacity);

        this._backpackParticularsIcon = find("Icon", this.BackpackParticulars).getComponent(Sprite);
        this._backpackParticularsName = find("Name", this.BackpackParticulars).getComponent(Label);
        this._backpackParticularsIntroduce = find("Introduce", this.BackpackParticulars).getComponent(Label);
    }

    protected start(): void {
        this.showAllProp();
        // this.updateGrade();
    }

    showAllProp() {
        this.Content.removeAllChildren();
        this.MapPickaxeEquipment.clear();
        for (let key in CDXX_GameData.Instance.Pickaxe) {
            if (!this.MapPickaxeEquipment.has(key)) this.MapPickaxeEquipment.set(key, []);
            let count = CDXX_GameData.Instance.Pickaxe[key].Num;

            const item = instantiate(this.ItemEquipmentPrefab);
            item.parent = this.Content;
            const itemEquipment: CDXX_ItemEquipment = item.getComponent(CDXX_ItemEquipment);
            itemEquipment.show(key, count);
            if (key === CDXX_GameData.Instance.CurHold) itemEquipment.onClick();
            this.MapPickaxeEquipment.get(key).push(itemEquipment);
        }

        this.MapElixirEquipment.clear();
        for (const key in CDXX_GameData.Instance.Elixir) {
            if (!this.MapElixirEquipment.has(key)) this.MapElixirEquipment.set(key, []);
            let count = CDXX_GameData.Instance.Elixir[key].Count;
            while (count > 99) {
                count -= 99;
                const item = instantiate(this.ItemEquipmentPrefab);
                item.parent = this.Content;
                const itemEquipment: CDXX_ItemEquipment = item.getComponent(CDXX_ItemEquipment);
                itemEquipment.showElixir(key, 99)
                this.MapElixirEquipment.get(key).push(itemEquipment);
            }

            const item = instantiate(this.ItemEquipmentPrefab);
            item.parent = this.Content;
            const itemEquipment: CDXX_ItemEquipment = item.getComponent(CDXX_ItemEquipment);
            itemEquipment.showElixir(key, count);
            if (key === CDXX_GameData.Instance.CurHold) itemEquipment.onClick();
            this.MapElixirEquipment.get(key).push(itemEquipment);
        }
    }

    addPickaxe(name: string, count: number = 1) {
        CDXX_GameData.AddPickaxeByName(name);
        if (!this.MapPickaxeEquipment.has(name)) this.MapPickaxeEquipment.set(name, []);
        const items = this.MapPickaxeEquipment.get(name);
        if (items.length == 0) {
            const item = instantiate(this.ItemEquipmentPrefab);
            item.parent = this.Content;
            const itemEquipment: CDXX_ItemEquipment = item.getComponent(CDXX_ItemEquipment);
            itemEquipment.show(name, count);
            itemEquipment.onClick();
            this.MapPickaxeEquipment.get(name).push(itemEquipment);
        } else if (items[items.length - 1].Count + count > 99) {
            const maxCount = 99 - items[items.length - 1].Count;
            items[items.length - 1].changeCount(maxCount);

            const item = instantiate(this.ItemEquipmentPrefab);
            item.parent = this.Content;
            const itemEquipment: CDXX_ItemEquipment = item.getComponent(CDXX_ItemEquipment);
            itemEquipment.show(name, count - maxCount);
            itemEquipment.onClick();
            this.MapPickaxeEquipment.get(name).push(itemEquipment);
        } else {
            items[items.length - 1].changeCount(count);
        }
    }

    addElixir(name: string, count: number = 1) {
        CDXX_GameData.AddElixirByName(name);
        if (!this.MapElixirEquipment.has(name)) this.MapElixirEquipment.set(name, []);
        const items = this.MapElixirEquipment.get(name);
        if (items.length == 0) {
            const item = instantiate(this.ItemEquipmentPrefab);
            item.parent = this.Content;
            const itemEquipment: CDXX_ItemEquipment = item.getComponent(CDXX_ItemEquipment);
            itemEquipment.showElixir(name, count);
            this.MapElixirEquipment.get(name).push(itemEquipment);
        } else if (items[items.length - 1].Count + count > 99) {
            const maxCount = 99 - items[items.length - 1].Count;
            items[items.length - 1].changeCount(maxCount);

            const item = instantiate(this.ItemEquipmentPrefab);
            item.parent = this.Content;
            const itemEquipment: CDXX_ItemEquipment = item.getComponent(CDXX_ItemEquipment);
            itemEquipment.showElixir(name, count - maxCount);
            this.MapElixirEquipment.get(name).push(itemEquipment);
        } else {
            items[items.length - 1].changeCount(count);
        }
    }

    loseElixir(name: string, count: number = 1) {
        CDXX_GameData.LoseElixirByName(name, count);
        if (!this.MapElixirEquipment.has(name)) return;
        const items: CDXX_ItemEquipment[] = this.MapElixirEquipment.get(name);
        let item: CDXX_ItemEquipment = items.pop();
        while (count > 0) {
            if (item.Count > count) {
                count = 0;
                item.changeCount(-count);
                items.push(item);
            } else {
                count -= item.Count;
                item.node.destroy();
                if (items.length > 0) item = items.pop();
                break;
            }
        }
    }
    more() {
        if (!this.TargetPanel.active) {
            this.closeBackpackParticulars();
            this.TargetPanel.active = true;
            this.showMore();
        }
    }

    showMore() {
        this.MoreContent.removeAllChildren();
        this.Content.children.forEach(e => {
            const equipment: CDXX_ItemEquipment = e.getComponent(CDXX_ItemEquipment);
            const backpack = instantiate(this.ItemBackpackPrefab);
            backpack.parent = this.MoreContent;
            backpack.getComponent(CDXX_ItemBackpack).show(equipment.Name, equipment.Count, equipment.Icon.spriteFrame, equipment.IsPickaxe);
        })
    }

    showBackpackParticulars(sf: SpriteFrame, name: string, Introduce: string) {
        this.BackpackParticulars.active = true;
        this._backpackParticularsIcon.spriteFrame = sf;
        this._backpackParticularsName.string = name;
        this._backpackParticularsIntroduce.string = Introduce;
    }

    closeBackpackParticulars() {
        this.BackpackParticulars.active = false;
    }

    ShowTips(tips: string) {
        this.TipsLabel.string = tips;
        Tween.stopAllByTarget(this.TipsUIOpacity);
        this.TipsUIOpacity.opacity = 255;
        tween(this.TipsUIOpacity)
            .delay(1)
            .to(0.5, { opacity: 0 }, { easing: `sineOut` })
            .start();
    }

    private _elixirName: string = "";
    private _elixirCount: number = 0;
    private _elixir: CDXX_ELIXIR = null;
    EatElixir() {
        this.MapElixirEquipment.forEach(e => {
            if (e) {
                this._elixirCount = 0;
                e.forEach(elixir => this._elixirCount += elixir.Count)
                this._elixirName = e[0].Name;
                this._elixir = CDXX_GameData.Instance.Elixir[this._elixirName];

                CDXX_GameData.Instance.HP += this._elixir.Amp_HP * this._elixirCount;
                CDXX_GameData.Instance.Harm += this._elixir.Amp_HARM * this._elixirCount;
                CDXX_GameData.Instance.ZL += this._elixir.Amp_ZL * this._elixirCount;
                CDXX_GameData.AddExp(this._elixir.Amp_JY * this._elixirCount);

                CDXX_GameData.LoseElixirByName(this._elixirName, this._elixirCount);
            }
            e.forEach(elixir => elixir.node.destroy());
        })
        this.MapElixirEquipment.clear();
        CDXX_EventManager.Scene.emit(CDXX_MyEvent.CDXX_STATE_SHOW);

        // if (!this.MapElixirEquipment.has(name)) return;
        // const items: CDXX_ItemEquipment[] = this.MapElixirEquipment.get(name);
        // let item: CDXX_ItemEquipment = items.pop();
        // while (count > 0) {
        //     if (item.Count > count) {
        //         count = 0;
        //         item.changeCount(-count);
        //         items.push(item);
        //     } else {
        //         count -= item.Count;
        //         item.node.destroy();
        //         if (items.length > 0) item = items.pop();
        //         break;
        //     }
        // }
    }

    // show() {
    //     this.Content.removeAllChildren();
    //     for (let key in CDXX_GameData.Instance.Pickaxe) {
    //         console.log(`${key}:${CDXX_GameData.Instance.Pickaxe[key].Num}`);
    //         BundleManager.LoadPrefab("52_CDXX_Bundle", "Item_背包").then((prefab: Prefab) => {
    //             const item = instantiate(prefab);
    //             item.parent = this.Content;
    //             item.getComponent(CDXX_ItemEquipment).show(key, CDXX_GameData.Instance.Pickaxe[key].Num)
    //         })
    //     }

    //     for (let key in CDXX_GameData.Instance.userData) {
    //         // console.log(`${key}:${CDXX_GameData.Instance.userData[key]}`);
    //         if (key == "金币" || key == "奖杯" || key == "使用增益" || key == "等级" || key == "经验" || key == "当日积分" ||
    //             CDXX_GameData.Instance.userData[key] <= 0) continue;
    //         BundleManager.LoadPrefab("52_CDXX_Bundle", "Item_背包").then((prefab: Prefab) => {
    //             const item = instantiate(prefab);
    //             item.parent = this.Content;
    //             item.getComponent(CDXX_ItemEquipment).showProp(key, CDXX_GameData.Instance.userData[key])
    //         })
    //     }
    // }
}


