import { _decorator, Component, Sprite, Node, BoxCollider2D, SpriteFrame, Layers, v3, Vec3, view, Collider2D, IPhysics2DContact, Contact2DType, instantiate, Prefab, Enum } from 'cc';
import NodeUtil from 'db://assets/Scripts/Framework/Utils/NodeUtil';
import { XGTS_ContainerData, XGTS_ContainerType } from './XGTS_Data';
import { XGTS_Constant } from './XGTS_Constant';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XGTS_DataManager } from './XGTS_DataManager';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import { XGTS_LootManager } from './XGTS_LootManager';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import XGTS_ContainerInventory from './UI/XGTS_ContainerInventory';
import { XGTS_UIManager } from './UI/XGTS_UIManager';
import { XGTS_LvManager } from './XGTS_LvManager';
import { XGTS_GameManager } from './XGTS_GameManager';
const { ccclass, property } = _decorator;


@ccclass('XGTS_Supplies')
export default class XGTS_Supplies extends Component {

    @property({ type: Enum(XGTS_ContainerType) })
    type: XGTS_ContainerType = XGTS_ContainerType.BirdNest;

    @property
    generateBox: boolean = true;

    Icon: Sprite | null = null;
    collider: BoxCollider2D | null = null;

    data: XGTS_ContainerData = null;

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

    Init(type: XGTS_ContainerType) {
        this.Icon.spriteFrame = null;
        this.type = type;
        this.data = Tools.Clone(XGTS_DataManager.ContainerData.find(e => e.Type == type));

        //第一次搜索保险箱必出大红
        if (type == XGTS_ContainerType.SafeBox && XGTS_LvManager.Instance.matchData.MapName == "训练场") {
            let data = [];
            for (let i = 0; i < XGTS_Constant.FirstOpenSafeBox.length; i++) {
                let d = XGTS_DataManager.GetItemDataByName(XGTS_Constant.FirstOpenSafeBox[i]);
                d.Searched = false;
                if (d) {
                    data.push(d);
                }
            }

            this.data.ItemData = data;
        } else if (type == XGTS_ContainerType.WeaponCase && XGTS_LvManager.Instance.matchData.MapName == "训练场") {
            let data = [];
            for (let i = 0; i < XGTS_Constant.FirstOpenWeaponBox.length; i++) {
                let d = XGTS_DataManager.GetItemDataByName(XGTS_Constant.FirstOpenWeaponBox[i]);
                d.Searched = false;
                if (d) {
                    data.push(d);
                }
            }

            this.data.ItemData = data;
        } else {
            this.data.ItemData = XGTS_LootManager.GetContainerResult(type);
        }

        this.Refresh();
    }

    InitCharacterCase(isBoss: boolean) {
        this.Icon.spriteFrame = null;

        this.type = XGTS_ContainerType.CharactorCase;
        if (isBoss) {
            this.data = Tools.Clone(XGTS_DataManager.ContainerData.find(e => e.Type == XGTS_ContainerType.SafeBox));
            this.data.Name = "赛喵德";
            this.data.ItemData = XGTS_LootManager.GetContainerResult(XGTS_ContainerType.SafeBox);
        } else {
            this.data = Tools.Clone(XGTS_DataManager.ContainerData.find(e => e.Type == XGTS_ContainerType.BirdNest));
            this.data.Name = "小兵";
            this.data.ItemData = XGTS_LootManager.GetContainerResult(XGTS_ContainerType.BirdNest);
        }

        this.Refresh();
    }

    Refresh() {
        BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Supplies/${this.type}_${this.isOpened ? 1 : 0}`).then((sf: SpriteFrame) => {
            this.Icon.spriteFrame = sf;
        });
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.group == XGTS_Constant.Group.Player) {
            let eventLaseName = ""
            let playerNum = 0;
            if(XGTS_GameManager.IsDoubleMode){
                eventLaseName = "_"+otherCollider.node.name.split("_")[1];
                playerNum = Number(eventLaseName.split("_")[1]);
            }

            XGTS_GameManager.Instance.suppliesNodes.set(playerNum,this.node.uuid);

            if(XGTS_GameManager.IsDoubleMode){
                let num = playerNum == 1 ? 2 : 1;
                if( XGTS_GameManager.Instance.suppliesNodes.get(num) == this.node.uuid){
                    return;
                }
            }
  
            
            EventManager.Scene.emit(XGTS_Constant.Event.SHOW_INTERACT_BUTTON + eventLaseName, true, () => {

                const showPanel = () => {
                    if ((this.type == XGTS_ContainerType.SafeBox || this.type == XGTS_ContainerType.WeaponCase) && XGTS_LvManager.Instance.matchData.MapName == "训练场") {
                        XGTS_LvManager.Instance.AddGuideIndex();
                    }

                    BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, `UI/ContainerInventory`).then((prefab: Prefab) => {
                        this.isOpened = true;
                        this.Refresh();

                        const spawnInverntory = (parent: Node) => {
                            let node = instantiate(prefab);
                            node.setParent(parent);
                            if(XGTS_GameManager.IsDoubleMode){
                                if(this.type == XGTS_ContainerType.AviationCrate){
                                    node.setScale(v3(0.7,0.7,1))
                                }
                                else{
                                    node.setScale(v3(0.8,0.8,1))
                                }
                            }
                            node.setPosition(Vec3.ZERO);
                            let inventory = node.getComponent(XGTS_ContainerInventory);
                            inventory.InitContainer(this.data);
                            return inventory;
                        }

                        if(XGTS_GameManager.IsDoubleMode){
                            if(playerNum == 1){
                                XGTS_UIManager.Instance.ShowPanel(XGTS_Constant.Panel.InventoryPanel_Left, [spawnInverntory,playerNum]);
                            }
                            else{
                                XGTS_UIManager.Instance.ShowPanel(XGTS_Constant.Panel.InventoryPanel_Right, [spawnInverntory,playerNum]);
                            }
                        }
                        else{
                            XGTS_UIManager.Instance.ShowPanel(XGTS_Constant.Panel.InventoryPanel, [spawnInverntory]);
                        }
                    });
                }

                if (this.type == XGTS_ContainerType.SafeBox && !this.isOpened) {
                    XGTS_UIManager.Instance.ShowPanel(XGTS_Constant.Panel.SafeBoxPanel, [() => {
                        showPanel();
                    }]);
                } else {
                    showPanel();
                }
            });
        }
    }

    onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.group == XGTS_Constant.Group.Player) {
            let eventLaseName = ""
            let playerNum = 0;
            if(XGTS_GameManager.IsDoubleMode){
                eventLaseName = "_"+otherCollider.node.name.split("_")[1];
                playerNum = Number(eventLaseName.split("_")[1]);
            }
            
             XGTS_GameManager.Instance.suppliesNodes.set(playerNum,null);
            EventManager.Scene.emit(XGTS_Constant.Event.SHOW_INTERACT_BUTTON + eventLaseName, false);
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