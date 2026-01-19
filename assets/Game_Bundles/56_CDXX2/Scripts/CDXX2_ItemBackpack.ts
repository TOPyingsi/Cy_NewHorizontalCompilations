import { _decorator, Component, director, error, EventTouch, find, Label, Node, Sprite, SpriteFrame } from 'cc';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { CDXX2_GameData } from './CDXX2_GameData';
import { CDXX2_EventManager, CDXX2_MyEvent } from './CDXX2_EventManager';
import { CDXX2_Equipment } from './CDXX2_Equipment';
import { CDXX2_ELIXIR, CDXX2_INTRODUCE, CDXX2_SPECIAL_PROP_CONFIG } from './CDXX2_Constant';
const { ccclass, property } = _decorator;

//"背包格子"负责显示道具图标与数量
//点击后高亮自身、广播隐藏其他格子边框，并弹出详情面板：若是镐子则同时切换为当前持有武器，若是丹药则显示属性加成文本。

@ccclass('CDXX2_ItemBackpack')
export class CDXX2_ItemBackpack extends Component {

    Icon: Sprite = null;
    Num: Label = null;
    Border: Node = null;

    Name: string = "";

    IsPickaxe: boolean = false;
    IsProp: boolean = false;  // 是否是道具

    protected onLoad(): void {
        this.Icon = find("Icon/Icon", this.node).getComponent(Sprite);
        this.Num = find("Num", this.node).getComponent(Label);
        this.Border = find("背包框金", this.node);

        this.node.on(Node.EventType.TOUCH_END, this.onClick, this);
    }

    show(name: string, num: number, sf: SpriteFrame, _isPickaxe: boolean, _isProp: boolean = false) {
        this.Name = name;
        this.Icon.spriteFrame = sf;
        this.IsPickaxe = _isPickaxe;
        this.IsProp = _isProp;
        this.Num.string = "x" + num.toString();
        this.hideBorder();
        if (this.Name == CDXX2_GameData.Instance.CurHold) this.Border.active = true;
    }

    onClick(event: EventTouch = null) {
        CDXX2_EventManager.Scene.emit(CDXX2_MyEvent.CDXX2_HIDE_BACKPACK_BORDER);
        this.Border.active = true;
        let introduce: string = "";
        
        if (this.IsPickaxe) {
            // 武器
            introduce = CDXX2_INTRODUCE.has(this.Name) ? CDXX2_INTRODUCE.get(this.Name) : "";
        } else if (this.IsProp) {
            // 道具
            const propConfig = CDXX2_SPECIAL_PROP_CONFIG.get(this.Name);
            introduce = propConfig ? propConfig.Description : "不可装备";
        } else {
            // 丹药：先检查是否是特殊丹药
            const specialPropConfig = CDXX2_SPECIAL_PROP_CONFIG.get(this.Name);
            if (specialPropConfig) {
                introduce = specialPropConfig.Description;
            } else {
                // 普通丹药
                const elixir: CDXX2_ELIXIR = CDXX2_GameData.Instance.Elixir[this.Name];
                if (elixir) {
                    introduce = `${elixir.Name}增加${elixir.Amp_JY}点经验值、${elixir.Amp_HP}点血量、${elixir.Amp_HARM}点攻击力`;
                } else {
                    introduce = "未知物品";
                }
            }
        }
        CDXX2_Equipment.Instance.showBackpackParticulars(this.Icon.spriteFrame, this.Name, introduce);

        if (this.IsPickaxe) {
            if (CDXX2_GameData.Instance.CurHold !== this.Name) {
                CDXX2_GameData.Instance.CurHold = this.Name;
                CDXX2_EventManager.Scene.emit(CDXX2_MyEvent.CDXX2_SHOW_EQUIPMENT_BORDER, this.Name);
            }
        }
    }

    hideBorder() {
        this.Border.active = false;
    }

    protected onEnable(): void {
        CDXX2_EventManager.on(CDXX2_MyEvent.CDXX2_HIDE_BACKPACK_BORDER, this.hideBorder, this);
    }
}
