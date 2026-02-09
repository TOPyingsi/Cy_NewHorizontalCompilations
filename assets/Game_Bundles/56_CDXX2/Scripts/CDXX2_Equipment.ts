import { _decorator, Component, find, instantiate, Label, Node, Prefab, Sprite, SpriteFrame, tween, Tween, UIOpacity } from 'cc';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { CDXX2_ItemEquipment } from './CDXX2_ItemEquipment';
import { CDXX2_GameData } from './CDXX2_GameData';
import { CDXX2_ItemBackpack } from './CDXX2_ItemBackpack';
import { CDXX2_ELIXIR } from './CDXX2_Constant';
import { CDXX2_EventManager, CDXX2_MyEvent } from './CDXX2_EventManager';
const { ccclass, property } = _decorator;

//“装备界面”单例统一管理镐子与丹药的背包展示、堆叠（单格≤99）、获得/消耗、批量吃丹药加属性，并支持弹出物品详情与一键整理到二级面板。

@ccclass('CDXX2_Equipment')
export class CDXX2_Equipment extends Component {
    public static Instance: CDXX2_Equipment = null;

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

    MapPickaxeEquipment: Map<string, CDXX2_ItemEquipment[]> = new Map();
    MapElixirEquipment: Map<string, CDXX2_ItemEquipment[]> = new Map();
    MapPropEquipment: Map<string, CDXX2_ItemEquipment[]> = new Map(); // 新增：道具Map

    private _backpackParticularsIcon: Sprite = null;
    private _backpackParticularsName: Label = null;
    private _backpackParticularsIntroduce: Label = null;

    protected onLoad(): void {
        CDXX2_Equipment.Instance = this;
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

    // 需要在背包中显示的道具列表（灵石仙石在上方UI显示，不在背包）
    // 速度面包、灵兽boss属性丹、仙兽boss属性丹、倍率丹作为丹药处理，可以一键吃丹
    private static DISPLAY_PROPS: string[] = ["碎片"];

    showAllProp() {
        this.Content.removeAllChildren();
        this.MapPickaxeEquipment.clear();
        for (let key in CDXX2_GameData.Instance.Pickaxe) {
            if (!this.MapPickaxeEquipment.has(key)) this.MapPickaxeEquipment.set(key, []);
            let count = CDXX2_GameData.Instance.Pickaxe[key].Num;

            const item = instantiate(this.ItemEquipmentPrefab);
            item.parent = this.Content;
            const itemEquipment: CDXX2_ItemEquipment = item.getComponent(CDXX2_ItemEquipment);
            itemEquipment.show(key, count);
            if (key === CDXX2_GameData.Instance.CurHold) itemEquipment.onClick();
            this.MapPickaxeEquipment.get(key).push(itemEquipment);
        }

        this.MapElixirEquipment.clear();
        for (const key in CDXX2_GameData.Instance.Elixir) {
            if (!this.MapElixirEquipment.has(key)) this.MapElixirEquipment.set(key, []);
            let count = CDXX2_GameData.Instance.Elixir[key].Count;
            while (count > 99) {
                count -= 99;
                const item = instantiate(this.ItemEquipmentPrefab);
                item.parent = this.Content;
                const itemEquipment: CDXX2_ItemEquipment = item.getComponent(CDXX2_ItemEquipment);
                itemEquipment.showElixir(key, 99)
                this.MapElixirEquipment.get(key).push(itemEquipment);
            }

            const item = instantiate(this.ItemEquipmentPrefab);
            item.parent = this.Content;
            const itemEquipment: CDXX2_ItemEquipment = item.getComponent(CDXX2_ItemEquipment);
            itemEquipment.showElixir(key, count);
            if (key === CDXX2_GameData.Instance.CurHold) itemEquipment.onClick();
            this.MapElixirEquipment.get(key).push(itemEquipment);
        }

        // 将速度面包、灵兽boss属性丹、兽王boss属性丹、仙兽boss属性丹、内丹、倍率丹、哈基米南北绿豆作为丹药显示（可一键吃丹）
        const elixirLikeProps = ["速度面包", "灵兽boss属性丹", "兽王boss属性丹", "仙兽boss属性丹", "内丹", "倍率丹", "哈基米南北绿豆"];
        for (const key of elixirLikeProps) {
            const count = CDXX2_GameData.Instance.userData[key] || 0;
            if (count <= 0) continue;
            
            if (!this.MapElixirEquipment.has(key)) this.MapElixirEquipment.set(key, []);
            
            let remaining = count;
            while (remaining > 99) {
                remaining -= 99;
                const item = instantiate(this.ItemEquipmentPrefab);
                item.parent = this.Content;
                const itemEquipment: CDXX2_ItemEquipment = item.getComponent(CDXX2_ItemEquipment);
                itemEquipment.showElixir(key, 99);
                this.MapElixirEquipment.get(key).push(itemEquipment);
            }

            if (remaining > 0) {
                const item = instantiate(this.ItemEquipmentPrefab);
                item.parent = this.Content;
                const itemEquipment: CDXX2_ItemEquipment = item.getComponent(CDXX2_ItemEquipment);
                itemEquipment.showElixir(key, remaining);
                this.MapElixirEquipment.get(key).push(itemEquipment);
            }
        }

        // 显示道具（碎片、灵石、仙石等）
        this.MapPropEquipment.clear();
        for (const key of CDXX2_Equipment.DISPLAY_PROPS) {
            const count = CDXX2_GameData.Instance.userData[key] || 0;
            if (count <= 0) continue;
            
            if (!this.MapPropEquipment.has(key)) this.MapPropEquipment.set(key, []);
            
            let remaining = count;
            while (remaining > 99) {
                remaining -= 99;
                const item = instantiate(this.ItemEquipmentPrefab);
                item.parent = this.Content;
                const itemEquipment: CDXX2_ItemEquipment = item.getComponent(CDXX2_ItemEquipment);
                itemEquipment.showProp(key, 99);
                this.MapPropEquipment.get(key).push(itemEquipment);
            }

            if (remaining > 0) {
                const item = instantiate(this.ItemEquipmentPrefab);
                item.parent = this.Content;
                const itemEquipment: CDXX2_ItemEquipment = item.getComponent(CDXX2_ItemEquipment);
                itemEquipment.showProp(key, remaining);
                this.MapPropEquipment.get(key).push(itemEquipment);
            }
        }
    }

    addPickaxe(name: string, count: number = 1) {
        CDXX2_GameData.AddPickaxeByName(name);
        if (!this.MapPickaxeEquipment.has(name)) this.MapPickaxeEquipment.set(name, []);
        const items = this.MapPickaxeEquipment.get(name);
        if (items.length == 0) {
            const item = instantiate(this.ItemEquipmentPrefab);
            item.parent = this.Content;
            const itemEquipment: CDXX2_ItemEquipment = item.getComponent(CDXX2_ItemEquipment);
            itemEquipment.show(name, count);
            itemEquipment.onClick();
            this.MapPickaxeEquipment.get(name).push(itemEquipment);
        } else if (items[items.length - 1].Count + count > 99) {
            const maxCount = 99 - items[items.length - 1].Count;
            items[items.length - 1].changeCount(maxCount);

            const item = instantiate(this.ItemEquipmentPrefab);
            item.parent = this.Content;
            const itemEquipment: CDXX2_ItemEquipment = item.getComponent(CDXX2_ItemEquipment);
            itemEquipment.show(name, count - maxCount);
            itemEquipment.onClick();
            this.MapPickaxeEquipment.get(name).push(itemEquipment);
        } else {
            items[items.length - 1].changeCount(count);
        }
    }

    addElixir(name: string, count: number = 1) {
        // 如果是特殊道具（速度面包、boss属性丹、倍率丹、内丹、哈基米南北绿豆），不添加到Elixir对象，只更新userData
        const specialProps = ["速度面包", "灵兽boss属性丹", "兽王boss属性丹", "仙兽boss属性丹", "内丹", "倍率丹", "哈基米南北绿豆"];
        if (specialProps.includes(name)) {
            // 更新userData
            CDXX2_GameData.Instance.userData[name] = (CDXX2_GameData.Instance.userData[name] || 0) + count;
            CDXX2_GameData.DateSave();
        } else {
            // 普通丹药添加到Elixir对象
            for (let i = 0; i < count; i++) {
                CDXX2_GameData.AddElixirByName(name);
            }
        }
        
        if (!this.MapElixirEquipment.has(name)) this.MapElixirEquipment.set(name, []);
        const items = this.MapElixirEquipment.get(name);
        if (items.length == 0) {
            const item = instantiate(this.ItemEquipmentPrefab);
            item.parent = this.Content;
            const itemEquipment: CDXX2_ItemEquipment = item.getComponent(CDXX2_ItemEquipment);
            itemEquipment.showElixir(name, count);
            this.MapElixirEquipment.get(name).push(itemEquipment);
        } else if (items[items.length - 1].Count + count > 99) {
            const maxCount = 99 - items[items.length - 1].Count;
            items[items.length - 1].changeCount(maxCount);

            const item = instantiate(this.ItemEquipmentPrefab);
            item.parent = this.Content;
            const itemEquipment: CDXX2_ItemEquipment = item.getComponent(CDXX2_ItemEquipment);
            itemEquipment.showElixir(name, count - maxCount);
            this.MapElixirEquipment.get(name).push(itemEquipment);
        } else {
            items[items.length - 1].changeCount(count);
        }
    }

    // 添加道具到背包显示
    addProp(name: string, count: number = 1) {
        if (!this.MapPropEquipment.has(name)) this.MapPropEquipment.set(name, []);
        const items = this.MapPropEquipment.get(name);
        if (items.length == 0) {
            const item = instantiate(this.ItemEquipmentPrefab);
            item.parent = this.Content;
            const itemEquipment: CDXX2_ItemEquipment = item.getComponent(CDXX2_ItemEquipment);
            itemEquipment.showProp(name, count);
            this.MapPropEquipment.get(name).push(itemEquipment);
        } else if (items[items.length - 1].Count + count > 99) {
            const maxCount = 99 - items[items.length - 1].Count;
            items[items.length - 1].changeCount(maxCount);

            const item = instantiate(this.ItemEquipmentPrefab);
            item.parent = this.Content;
            const itemEquipment: CDXX2_ItemEquipment = item.getComponent(CDXX2_ItemEquipment);
            itemEquipment.showProp(name, count - maxCount);
            this.MapPropEquipment.get(name).push(itemEquipment);
        } else {
            items[items.length - 1].changeCount(count);
        }
    }

    // 更新道具显示（用于货币兑换等场景）
    updatePropDisplay(name: string) {
        const currentCount = CDXX2_GameData.Instance.userData[name] || 0;
        
        // 如果道具不存在于Map中，或者数量为0，需要重新显示
        if (!this.MapPropEquipment.has(name) || currentCount === 0) {
            // 移除旧的显示
            if (this.MapPropEquipment.has(name)) {
                const items = this.MapPropEquipment.get(name);
                items.forEach(item => item.node.destroy());
                this.MapPropEquipment.delete(name);
            }
            
            // 如果数量大于0，重新创建
            if (currentCount > 0) {
                this.MapPropEquipment.set(name, []);
                let remaining = currentCount;
                
                while (remaining > 99) {
                    remaining -= 99;
                    const item = instantiate(this.ItemEquipmentPrefab);
                    item.parent = this.Content;
                    const itemEquipment: CDXX2_ItemEquipment = item.getComponent(CDXX2_ItemEquipment);
                    itemEquipment.showProp(name, 99);
                    this.MapPropEquipment.get(name).push(itemEquipment);
                }
                
                if (remaining > 0) {
                    const item = instantiate(this.ItemEquipmentPrefab);
                    item.parent = this.Content;
                    const itemEquipment: CDXX2_ItemEquipment = item.getComponent(CDXX2_ItemEquipment);
                    itemEquipment.showProp(name, remaining);
                    this.MapPropEquipment.get(name).push(itemEquipment);
                }
            }
            return;
        }
        
        // 更新现有显示
        const items = this.MapPropEquipment.get(name);
        let remaining = currentCount;
        let itemIndex = 0;
        
        // 更新现有的item
        while (remaining > 0 && itemIndex < items.length) {
            const displayCount = Math.min(remaining, 99);
            items[itemIndex].Count = displayCount;
            items[itemIndex].Num.string = displayCount.toString();
            remaining -= displayCount;
            itemIndex++;
        }
        
        // 如果还有剩余，创建新的item
        while (remaining > 0) {
            const displayCount = Math.min(remaining, 99);
            const item = instantiate(this.ItemEquipmentPrefab);
            item.parent = this.Content;
            const itemEquipment: CDXX2_ItemEquipment = item.getComponent(CDXX2_ItemEquipment);
            itemEquipment.showProp(name, displayCount);
            items.push(itemEquipment);
            remaining -= displayCount;
        }
        
        // 如果item多了，删除多余的
        while (itemIndex < items.length) {
            const item = items.pop();
            item.node.destroy();
        }
    }

    loseElixir(name: string, count: number = 1) {
        CDXX2_GameData.LoseElixirByName(name, count);
        if (!this.MapElixirEquipment.has(name)) return;
        const items: CDXX2_ItemEquipment[] = this.MapElixirEquipment.get(name);
        let item: CDXX2_ItemEquipment = items.pop();
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
            const equipment: CDXX2_ItemEquipment = e.getComponent(CDXX2_ItemEquipment);
            const backpack = instantiate(this.ItemBackpackPrefab);
            backpack.parent = this.MoreContent;
            backpack.getComponent(CDXX2_ItemBackpack).show(equipment.Name, equipment.Count, equipment.Icon.spriteFrame, equipment.IsPickaxe, equipment.IsProp);
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
    private _elixir: CDXX2_ELIXIR = null;
    EatElixir() {
        // 获取轮回吃丹收益倍率
        const elixirBonus = CDXX2_GameData.Instance.ElixirBonus || 1;
        
        this.MapElixirEquipment.forEach(e => {
            if (e && e.length > 0) {
                this._elixirCount = 0;
                e.forEach(elixir => this._elixirCount += elixir.Count)
                this._elixirName = e[0].Name;
                
                // 处理特殊道具
                if (this._elixirName === "速度面包") {
                    // 速度面包：增加速度0.5
                    CDXX2_GameData.Instance.userData["速度加成"] += 0.5 * this._elixirCount;
                    CDXX2_GameData.Instance.userData["速度面包"] -= this._elixirCount;
                    if (CDXX2_GameData.Instance.userData["速度面包"] < 0) {
                        CDXX2_GameData.Instance.userData["速度面包"] = 0;
                    }
                } else if (this._elixirName === "倍率丹") {
                    // 倍率丹：丹药掉落数量+1（每个倍率丹+1）
                    CDXX2_GameData.Instance.userData["丹药倍率"] += this._elixirCount;
                    CDXX2_GameData.Instance.userData["倍率丹"] -= this._elixirCount;
                    if (CDXX2_GameData.Instance.userData["倍率丹"] < 0) {
                        CDXX2_GameData.Instance.userData["倍率丹"] = 0;
                    }
                } else if (this._elixirName === "灵兽boss属性丹" || this._elixirName === "内丹") {
                    // 灵兽boss属性丹/内丹：生命值和攻击力+1%
                    for (let i = 0; i < this._elixirCount; i++) {
                        CDXX2_GameData.Instance.HP = Math.floor(CDXX2_GameData.Instance.HP * 1.01);
                        CDXX2_GameData.Instance.Harm = Math.floor(CDXX2_GameData.Instance.Harm * 1.01);
                        // 累加加成记录
                        CDXX2_GameData.Instance.userData["生命加成"] *= 1.01;
                        CDXX2_GameData.Instance.userData["攻击加成"] *= 1.01;
                    }
                    CDXX2_GameData.Instance.userData[this._elixirName] -= this._elixirCount;
                    if (CDXX2_GameData.Instance.userData[this._elixirName] < 0) {
                        CDXX2_GameData.Instance.userData[this._elixirName] = 0;
                    }
                } else if (this._elixirName === "兽王boss属性丹") {
                    // 兽王boss属性丹：生命值和攻击力+3%
                    for (let i = 0; i < this._elixirCount; i++) {
                        CDXX2_GameData.Instance.HP = Math.floor(CDXX2_GameData.Instance.HP * 1.03);
                        CDXX2_GameData.Instance.Harm = Math.floor(CDXX2_GameData.Instance.Harm * 1.03);
                        // 累加加成记录
                        CDXX2_GameData.Instance.userData["生命加成"] *= 1.03;
                        CDXX2_GameData.Instance.userData["攻击加成"] *= 1.03;
                    }
                    CDXX2_GameData.Instance.userData["兽王boss属性丹"] -= this._elixirCount;
                    if (CDXX2_GameData.Instance.userData["兽王boss属性丹"] < 0) {
                        CDXX2_GameData.Instance.userData["兽王boss属性丹"] = 0;
                    }
                } else if (this._elixirName === "仙兽boss属性丹") {
                    // 仙兽boss属性丹：生命值和攻击力+5%
                    for (let i = 0; i < this._elixirCount; i++) {
                        CDXX2_GameData.Instance.HP = Math.floor(CDXX2_GameData.Instance.HP * 1.05);
                        CDXX2_GameData.Instance.Harm = Math.floor(CDXX2_GameData.Instance.Harm * 1.05);
                        // 累加加成记录
                        CDXX2_GameData.Instance.userData["生命加成"] *= 1.05;
                        CDXX2_GameData.Instance.userData["攻击加成"] *= 1.05;
                    }
                    CDXX2_GameData.Instance.userData["仙兽boss属性丹"] -= this._elixirCount;
                    if (CDXX2_GameData.Instance.userData["仙兽boss属性丹"] < 0) {
                        CDXX2_GameData.Instance.userData["仙兽boss属性丹"] = 0;
                    }
                } else if (this._elixirName === "哈基米南北绿豆") {
                    // 哈基米南北绿豆：生命值和攻击力随机+1%-10%
                    for (let i = 0; i < this._elixirCount; i++) {
                        // 随机1-10的整数，对应1%-10%
                        const randomPercent = Math.floor(Math.random() * 10) + 1;
                        const multiplier = 1 + randomPercent / 100;
                        CDXX2_GameData.Instance.HP = Math.floor(CDXX2_GameData.Instance.HP * multiplier);
                        CDXX2_GameData.Instance.Harm = Math.floor(CDXX2_GameData.Instance.Harm * multiplier);
                        // 累加加成记录
                        CDXX2_GameData.Instance.userData["生命加成"] *= multiplier;
                        CDXX2_GameData.Instance.userData["攻击加成"] *= multiplier;
                    }
                    CDXX2_GameData.Instance.userData["哈基米南北绿豆"] -= this._elixirCount;
                    if (CDXX2_GameData.Instance.userData["哈基米南北绿豆"] < 0) {
                        CDXX2_GameData.Instance.userData["哈基米南北绿豆"] = 0;
                    }
                } else {
                    // 普通丹药
                    this._elixir = CDXX2_GameData.Instance.Elixir[this._elixirName];
                    if (this._elixir) {
                        // 应用轮回吃丹收益倍率
                        CDXX2_GameData.Instance.HP += this._elixir.Amp_HP * this._elixirCount * elixirBonus;
                        CDXX2_GameData.Instance.Harm += this._elixir.Amp_HARM * this._elixirCount * elixirBonus;
                        CDXX2_GameData.AddExp(this._elixir.Amp_JY * this._elixirCount * elixirBonus);
                        CDXX2_GameData.LoseElixirByName(this._elixirName, this._elixirCount);
                    }
                }
            }
            e.forEach(elixir => elixir.node.destroy());
        })
        this.MapElixirEquipment.clear();
        CDXX2_GameData.DateSave();
        CDXX2_EventManager.Scene.emit(CDXX2_MyEvent.CDXX2_STATE_SHOW);
    }

    // show() {
    //     this.Content.removeAllChildren();
    //     for (let key in CDXX2_GameData.Instance.Pickaxe) {
    //         console.log(`${key}:${CDXX2_GameData.Instance.Pickaxe[key].Num}`);
    //         BundleManager.LoadPrefab("56_CDXX2", "Item_背包").then((prefab: Prefab) => {
    //             const item = instantiate(prefab);
    //             item.parent = this.Content;
    //             item.getComponent(CDXX2_ItemEquipment).show(key, CDXX2_GameData.Instance.Pickaxe[key].Num)
    //         })
    //     }

    //     for (let key in CDXX2_GameData.Instance.userData) {
    //         // console.log(`${key}:${CDXX2_GameData.Instance.userData[key]}`);
    //         if (key == "金币" || key == "奖杯" || key == "使用增益" || key == "等级" || key == "经验" || key == "当日积分" ||
    //             CDXX2_GameData.Instance.userData[key] <= 0) continue;
    //         BundleManager.LoadPrefab("56_CDXX2", "Item_背包").then((prefab: Prefab) => {
    //             const item = instantiate(prefab);
    //             item.parent = this.Content;
    //             item.getComponent(CDXX2_ItemEquipment).showProp(key, CDXX2_GameData.Instance.userData[key])
    //         })
    //     }
    // }
}


