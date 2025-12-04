import { _decorator, Component, Sprite, Node, BoxCollider2D, SpriteFrame, Layers, v3, Vec3, view, Collider2D, IPhysics2DContact, Contact2DType, instantiate, Prefab, Enum } from 'cc';
import NodeUtil from 'db://assets/Scripts/Framework/Utils/NodeUtil';
import { SJZ_ContainerData, SJZ_ContainerType } from './SJZ_Data';
import { SJZ_Constant } from './SJZ_Constant';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { SJZ_DataManager } from './SJZ_DataManager';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import { SJZ_LootManager } from './SJZ_LootManager';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import SJZ_ContainerInventory from './UI/SJZ_ContainerInventory';
import { SJZ_UIManager } from './UI/SJZ_UIManager';
import { SJZ_LvManager } from './SJZ_LvManager';
const { ccclass, property } = _decorator;


@ccclass('SJZ_Supplies')
export default class SJZ_Supplies extends Component {

    @property({ type: Enum(SJZ_ContainerType) })
    type: SJZ_ContainerType = SJZ_ContainerType.BirdNest;

    @property
    generateBox: boolean = true;

    Icon: Sprite | null = null;
    collider: BoxCollider2D | null = null;

    data: SJZ_ContainerData = null;

    isOpened: boolean = false;

    onLoad() {
        this.Icon = NodeUtil.GetComponent("Icon", this.node, Sprite);
        this.collider = this.node.getComponent(BoxCollider2D);
    }
    start() {
        if (this.generateBox) {
            this.Init(this.type);
        }
    }

    Init(type: SJZ_ContainerType) {
        this.Icon.spriteFrame = null;
        this.type = type;
        this.data = Tools.Clone(SJZ_DataManager.ContainerData.find(e => e.Type == type));

        //第一次搜索保险箱必出大红
        if (type == SJZ_ContainerType.SafeBox && SJZ_LvManager.Instance.matchData.MapName == "训练场") {
            let data = [];
            for (let i = 0; i < SJZ_Constant.FirstOpenSafeBox.length; i++) {
                let d = SJZ_DataManager.GetItemDataByName(SJZ_Constant.FirstOpenSafeBox[i]);
                d.Searched = false;
                if (d) {
                    data.push(d);
                }
            }

            this.data.ItemData = data;
        } else if (type == SJZ_ContainerType.WeaponCase && SJZ_LvManager.Instance.matchData.MapName == "训练场") {
            let data = [];
            for (let i = 0; i < SJZ_Constant.FirstOpenWeaponBox.length; i++) {
                let d = SJZ_DataManager.GetItemDataByName(SJZ_Constant.FirstOpenWeaponBox[i]);
                d.Searched = false;
                if (d) {
                    data.push(d);
                }
            }

            this.data.ItemData = data;
        } else {
            this.data.ItemData = SJZ_LootManager.GetContainerResult(type);
        }

        this.Refresh();
    }

    InitCharacterCase(isBoss: boolean) {
        this.Icon.spriteFrame = null;

        this.type = SJZ_ContainerType.CharactorCase;
        if (isBoss) {
            this.data = Tools.Clone(SJZ_DataManager.ContainerData.find(e => e.Type == SJZ_ContainerType.SafeBox));
            this.data.Name = "赛喵德";
            this.data.ItemData = SJZ_LootManager.GetContainerResult(SJZ_ContainerType.SafeBox);
        } else {
            this.data = Tools.Clone(SJZ_DataManager.ContainerData.find(e => e.Type == SJZ_ContainerType.BirdNest));
            this.data.Name = "小兵";
            this.data.ItemData = SJZ_LootManager.GetContainerResult(SJZ_ContainerType.BirdNest);
        }

        this.Refresh();
    }

    Refresh() {
        BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Supplies/${this.type}_${this.isOpened ? 1 : 0}`).then((sf: SpriteFrame) => {
            this.Icon.spriteFrame = sf;
        });
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.group == SJZ_Constant.Group.Player) {
            EventManager.Scene.emit(SJZ_Constant.Event.SHOW_INTERACT_BUTTON, true, () => {

                const showPanel = () => {
                    if ((this.type == SJZ_ContainerType.SafeBox || this.type == SJZ_ContainerType.WeaponCase) && SJZ_LvManager.Instance.matchData.MapName == "训练场") {
                        SJZ_LvManager.Instance.AddGuideIndex();
                    }

                    BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, `UI/ContainerInventory`).then((prefab: Prefab) => {
                        this.isOpened = true;
                        this.Refresh();

                        const spawnInverntory = (parent: Node) => {
                            let node = instantiate(prefab);
                            node.setParent(parent);
                            node.setPosition(Vec3.ZERO);
                            let inventory = node.getComponent(SJZ_ContainerInventory);
                            inventory.InitContainer(this.data);
                            return inventory;
                        }

                        SJZ_UIManager.Instance.ShowPanel(SJZ_Constant.Panel.InventoryPanel, [spawnInverntory]);
                    });
                }

                if (this.type == SJZ_ContainerType.SafeBox && !this.isOpened) {
                    SJZ_UIManager.Instance.ShowPanel(SJZ_Constant.Panel.SafeBoxPanel, [() => {
                        showPanel();
                    }]);
                } else {
                    showPanel();
                }
            });
        }
    }

    onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.group == SJZ_Constant.Group.Player) {
            EventManager.Scene.emit(SJZ_Constant.Event.SHOW_INTERACT_BUTTON, false);
        }
    }

    protected onEnable(): void {
        this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        this.collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
    }

    protected onDisable(): void {
        this.collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        this.collider.off(Contact2DType.END_CONTACT, this.onEndContact, this);
    }
}