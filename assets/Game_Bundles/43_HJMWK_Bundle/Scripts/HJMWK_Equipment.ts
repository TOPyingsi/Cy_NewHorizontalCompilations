import { _decorator, Component, find, instantiate, Label, Node, Prefab } from 'cc';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { HJMWK_GameData } from './HJMWK_GameData';
import { HJMWK_ItemEquipment } from './HJMWK_ItemEquipment';
import { HJMWK_ItemBackpack } from './HJMWK_ItemBackpack';
const { ccclass, property } = _decorator;

@ccclass('HJMWK_Equipment')
export class HJMWK_Equipment extends Component {
    public static Instance: HJMWK_Equipment = null;

    @property(Node)
    TargetPanel: Node = null;

    @property(Node)
    MoreContent: Node = null;

    @property(Prefab)
    ItemEquipmentPrefab: Prefab = null;

    Content: Node = null;

    MapProp: Map<string, HJMWK_ItemEquipment[]> = new Map();

    protected onLoad(): void {
        HJMWK_Equipment.Instance = this;
        this.Content = find("View/Content", this.node);
    }

    protected start(): void {
        this.showAllProp();
    }

    more() {
        if (!this.TargetPanel.active) {
            this.showMore();
            this.TargetPanel.active = true;
        }
    }

    showAllProp() {
        this.Content.removeAllChildren();
        this.MapProp.clear();
        for (let key in HJMWK_GameData.Instance.Prop) {
            if (!this.MapProp.has(key)) this.MapProp.set(key, []);
            let count = HJMWK_GameData.Instance.Prop[key].Num;
            while (count > 99) {
                count -= 99;
                const item = instantiate(this.ItemEquipmentPrefab);
                item.parent = this.Content;
                const itemEquipment: HJMWK_ItemEquipment = item.getComponent(HJMWK_ItemEquipment);
                itemEquipment.show(key, 99)
                this.MapProp.get(key).push(itemEquipment);
            }
            const item = instantiate(this.ItemEquipmentPrefab);
            item.parent = this.Content;
            const itemEquipment: HJMWK_ItemEquipment = item.getComponent(HJMWK_ItemEquipment);
            itemEquipment.show(key, count)
            if (key === HJMWK_GameData.Instance.CurProp) itemEquipment.onClick();
            this.MapProp.get(key).push(itemEquipment);
        }
    }

    addProp(name: string, count: number = 1) {
        HJMWK_GameData.Instance.AddPropByName(name)
        if (!this.MapProp.has(name)) this.MapProp.set(name, []);
        const items = this.MapProp.get(name);
        if (items.length == 0) {
            const item = instantiate(this.ItemEquipmentPrefab);
            item.parent = this.Content;
            const itemEquipment: HJMWK_ItemEquipment = item.getComponent(HJMWK_ItemEquipment);
            itemEquipment.show(name, count);
            this.MapProp.get(name).push(itemEquipment);
        } else if (items[items.length - 1].Count + count > 99) {
            const maxCount = 99 - items[items.length - 1].Count;
            items[items.length - 1].changeCount(maxCount);

            const item = instantiate(this.ItemEquipmentPrefab);
            item.parent = this.Content;
            const itemEquipment: HJMWK_ItemEquipment = item.getComponent(HJMWK_ItemEquipment);
            itemEquipment.show(name, count - maxCount);
            this.MapProp.get(name).push(itemEquipment);
        } else {
            items[items.length - 1].changeCount(count);
        }
    }

    showMore() {
        this.MoreContent.removeAllChildren();
        for (const [key, items] of this.MapProp) {
            BundleManager.LoadPrefab("43_HJMWK_Bundle", "Item_背包_more").then((prefab: Prefab) => {
                items.forEach(e => {
                    const item = instantiate(prefab);
                    item.parent = this.MoreContent;
                    item.getComponent(HJMWK_ItemBackpack).show(key, e.Count);
                    if (key === HJMWK_GameData.Instance.CurProp) item.getComponent(HJMWK_ItemBackpack).onClick();
                });
            });
        }

        // for (let key in HJMWK_GameData.Instance.Prop) {
        //     BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, "Item_背包_more").then((prefab: Prefab) => {
        //         const item = instantiate(prefab);
        //         item.parent = this.MoreContent;
        //         item.getComponent(HJMWK_ItemBackpack).show(key, HJMWK_GameData.Instance.Prop[key].Num)
        //     })
        // }
    }


}


