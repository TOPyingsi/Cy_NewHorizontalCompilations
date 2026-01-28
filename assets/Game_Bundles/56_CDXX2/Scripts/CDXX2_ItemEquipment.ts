import { _decorator, Component, EventTouch, find, Label, Node, Sprite, SpriteFrame, tween, Tween, UIOpacity, UITransform, v3 } from 'cc';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { CDXX2_EventManager, CDXX2_MyEvent } from './CDXX2_EventManager';
import { CDXX2_UIController } from './CDXX2_UIController';
import CDXX2_PlayerController from './CDXX2_PlayerController';
import { CDXX2_GameData } from './CDXX2_GameData';
import { CDXX2_Equipment } from './CDXX2_Equipment';
import { CDXX2_ELIXIR, CDXX2_SPECIAL_PROP_CONFIG } from './CDXX2_Constant';
const { ccclass, property } = _decorator;

//“装备格子”根据类型（镐子/丹药/素材）加载对应图标与数量
//点击后若是镐子则切换武器并高亮自身，若是丹药仅弹提示不可装备；同时响应事件统一控制边框显隐。

@ccclass('CDXX2_ItemEquipment')
export class CDXX2_ItemEquipment extends Component {

    Icon: Sprite = null;
    Num: Label = null;
    Border: Node = null;

    Name: string = "";
    Count: number = 0;

    // private _width: number = 100;
    IsPickaxe: boolean = false;
    IsProp: boolean = false;  // 是否是道具（碎片、倍率丹等）

    protected onLoad(): void {
        this.Icon = find("Icon", this.node).getComponent(Sprite);
        this.Num = find("Num", this.node).getComponent(Label);
        this.Border = find("金框边", this.node);

        this.node.on(Node.EventType.TOUCH_END, this.onClick, this);
    }

    protected onEnable(): void {
        CDXX2_EventManager.on(CDXX2_MyEvent.CDXX2_HIDEBORDER, this.hideBorder, this);
        CDXX2_EventManager.on(CDXX2_MyEvent.CDXX2_SHOW_EQUIPMENT_BORDER, this.showByName, this);
    }

    protected onDisable(): void {
        CDXX2_EventManager.off(CDXX2_MyEvent.CDXX2_HIDEBORDER, this.hideBorder, this);
        CDXX2_EventManager.off(CDXX2_MyEvent.CDXX2_SHOW_EQUIPMENT_BORDER, this.showByName, this);
    }

    show(name: string, num: number = 99) {
        if (typeof name !== 'string' || name === '') {
            throw new Error(
                `[CDXX2_ItemEquipment] 启动时就收到非法 name：${name}\n` +
                `调用栈：\n${new Error().stack}`
            );
        }
        this.Name = name;
        this.IsPickaxe = true;
        if (CDXX2_PlayerController.Instance.GunName == name) {
            this.Border.active = true;
        }
        BundleManager.LoadSpriteFrame("56_CDXX2", `Sprites/刀/${name}`).then((sf: SpriteFrame) => {
            if (sf) {
                this.Icon.spriteFrame = sf;
            }
        }).catch((err) => {
            console.warn(`加载武器图片失败：Sprites/刀/${name}`, err);
        });
        this.Num.string = num.toString();
        this.Count = num;
    }

    showElixir(name: string, num: number = 99) {
        this.Name = name;
        this.IsPickaxe = false;
        BundleManager.LoadSpriteFrame("56_CDXX2", `Sprites/UI/丹药/${name}`).then((sf: SpriteFrame) => {
            this.Icon.spriteFrame = sf;
        })
        this.Num.string = num.toString();
        this.Count = num;
    }

    showProp(name: string, num: number = 99) {
        this.Name = name;
        this.IsPickaxe = false;
        this.IsProp = true;
        this.Count = num;
        BundleManager.LoadSpriteFrame("56_CDXX2", `Sprites/UI/道具/${name}`).then((sf: SpriteFrame) => {
            if (sf) this.Icon.spriteFrame = sf;
        }).catch((err) => {
            console.warn(`加载道具图片失败：Sprites/UI/道具/${name}`, err);
        });
        this.Num.string = num.toString();
    }

    changeCount(change: number) {
        this.Count += change;
        this.Num.string = this.Count.toString();
    }

    /**隐藏金框 */
    hideBorder() {
        this.Border.active = false;
    }

    showByName(name: string) {
        if (this.Name !== name) return;
        this.onClick();
    }


    onClick() {
        // 道具：显示道具说明
        if (this.IsProp) {
            const propConfig = CDXX2_SPECIAL_PROP_CONFIG.get(this.Name);
            if (propConfig) {
                CDXX2_Equipment.Instance.ShowTips(`${propConfig.Name}：${propConfig.Description}`);
            } else {
                CDXX2_Equipment.Instance.ShowTips(`${this.Name}：不可装备`);
            }
            return;
        }
        
        // 丹药：显示丹药属性
        if (!this.IsPickaxe) {
            // 先检查是否是特殊丹药
            const specialPropConfig = CDXX2_SPECIAL_PROP_CONFIG.get(this.Name);
            if (specialPropConfig) {
                CDXX2_Equipment.Instance.ShowTips(`${specialPropConfig.Name}：${specialPropConfig.Description}`);
                return;
            }
            
            // 普通丹药
            const elixir: CDXX2_ELIXIR = CDXX2_GameData.Instance.Elixir[this.Name];
            if (elixir) {
                CDXX2_Equipment.Instance.ShowTips(`${elixir.Name}增加${elixir.Amp_JY}点经验值、${elixir.Amp_HP}点血量、${elixir.Amp_HARM}点攻击力`);
            }
            return;
        }
        
        // 武器：装备
        CDXX2_EventManager.Scene.emit(CDXX2_MyEvent.CDXX2_HIDEBORDER);
        this.Border.active = true;
        CDXX2_GameData.Instance.CurHold = this.Name;
        CDXX2_UIController.Instance.TipsPanel.show(`装备了${this.Name}`)
        CDXX2_PlayerController.Instance.SwitchSkin(this.Name);
    }
}


