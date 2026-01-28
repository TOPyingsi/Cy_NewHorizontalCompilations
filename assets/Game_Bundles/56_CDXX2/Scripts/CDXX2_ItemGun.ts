import { _decorator, Component, Enum, find, Node, Label } from 'cc';
import { CDXX2_PICKAXE } from './CDXX2_Constant';
import { CDXX2_Tool } from './CDXX2_Tool';
import { CDXX2_GameData } from './CDXX2_GameData';
import { CDXX2_Equipment } from './CDXX2_Equipment';
import { CDXX2_UIController } from './CDXX2_UIController';
const { ccclass, property } = _decorator;

// 商品类型枚举
export enum CDXX2_SHOP_ITEM_TYPE {
    武器,
    丹药,
    道具,
    货币兑换,
}

// 货币类型枚举
export enum CDXX2_CURRENCY_TYPE {
    碎片,
    灵石,
    仙石,
}

//"商店物品"根据类型和价格配置，点击购买按钮扣除对应货币并获得物品

@ccclass('CDXX2_ItemGun')
export class CDXX2_ItemGun extends Component {

    @property({ type: Enum(CDXX2_SHOP_ITEM_TYPE) })
    ItemType: CDXX2_SHOP_ITEM_TYPE = CDXX2_SHOP_ITEM_TYPE.武器;

    @property({ type: Enum(CDXX2_PICKAXE) })
    WeaponType: CDXX2_PICKAXE = CDXX2_PICKAXE.良品影刀;

    @property
    ItemName: string = "";  // 物品名称（丹药/道具用）

    @property({ type: Enum(CDXX2_CURRENCY_TYPE) })
    CurrencyType: CDXX2_CURRENCY_TYPE = CDXX2_CURRENCY_TYPE.仙石;

    @property
    Price: number = 0;  // 价格

    @property
    RewardCount: number = 1;  // 获得数量（货币兑换用）

    Mask: Node = null;
    BuyButton: Node = null;
    PriceLabel: Label = null;
    Name: string = "";

    private _isHave: boolean = false;

    protected onLoad(): void {
        this.Mask = find("Mask", this.node);
        this.BuyButton = find("购买", this.node);
        
        // 获取物品名称
        if (this.ItemType === CDXX2_SHOP_ITEM_TYPE.武器) {
            this.Name = CDXX2_Tool.GetEnumKeyByValue(CDXX2_PICKAXE, this.WeaponType);
        } else {
            this.Name = this.ItemName;
        }

        // 绑定购买按钮点击事件
        if (this.BuyButton) {
            this.BuyButton.on(Node.EventType.TOUCH_END, this.OnBuyClick, this);
        }
    }

    protected start(): void {
        this.Show();
    }

    Show() {
        // 武器类型检查是否已拥有
        if (this.ItemType === CDXX2_SHOP_ITEM_TYPE.武器) {
            this._isHave = CDXX2_GameData.Instance.Pickaxe.hasOwnProperty(this.Name);
            if (this.Mask) this.Mask.active = this._isHave;
        }
    }

    // 获取货币名称
    getCurrencyName(): string {
        switch (this.CurrencyType) {
            case CDXX2_CURRENCY_TYPE.碎片: return "碎片";
            case CDXX2_CURRENCY_TYPE.灵石: return "灵石";
            case CDXX2_CURRENCY_TYPE.仙石: return "仙石";
            default: return "未知";
        }
    }

    // 获取当前货币数量
    getCurrencyAmount(): number {
        const currencyName = this.getCurrencyName();
        return CDXX2_GameData.Instance.userData[currencyName] || 0;
    }

    // 扣除货币
    deductCurrency(): boolean {
        const currencyName = this.getCurrencyName();
        const currentAmount = CDXX2_GameData.Instance.userData[currencyName] || 0;
        
        if (currentAmount < this.Price) {
            return false;
        }
        
        CDXX2_GameData.Instance.userData[currencyName] -= this.Price;
        CDXX2_GameData.DateSave();
        return true;
    }

    OnBuyClick() {
        // 武器已拥有则不能再买
        if (this.ItemType === CDXX2_SHOP_ITEM_TYPE.武器 && this._isHave) {
            CDXX2_UIController.Instance.TipsPanel.show("已拥有该武器");
            return;
        }

        // 检查货币是否足够
        if (this.getCurrencyAmount() < this.Price) {
            // 如果是碎片类型，显示特殊提示
            if (this.CurrencyType === CDXX2_CURRENCY_TYPE.碎片) {
                CDXX2_UIController.Instance.TipsPanel.show("碎片不足，请打怪获取");
            } else {
                CDXX2_UIController.Instance.TipsPanel.show(`${this.getCurrencyName()}不足`);
            }
            return;
        }

        // 扣除货币
        if (!this.deductCurrency()) {
            // 如果是碎片类型，显示特殊提示
            if (this.CurrencyType === CDXX2_CURRENCY_TYPE.碎片) {
                CDXX2_UIController.Instance.TipsPanel.show("碎片不足，请打怪获取");
            } else {
                CDXX2_UIController.Instance.TipsPanel.show(`${this.getCurrencyName()}不足`);
            }
            return;
        }

        // 根据类型给予物品
        switch (this.ItemType) {
            case CDXX2_SHOP_ITEM_TYPE.武器:
                this.buyWeapon();
                break;
            case CDXX2_SHOP_ITEM_TYPE.丹药:
                this.buyElixir();
                break;
            case CDXX2_SHOP_ITEM_TYPE.道具:
                this.buyProp();
                break;
            case CDXX2_SHOP_ITEM_TYPE.货币兑换:
                this.exchangeCurrency();
                break;
        }
    }

    // 购买武器
    buyWeapon() {
        CDXX2_Equipment.Instance.addPickaxe(this.Name);
        if (this.Mask) this.Mask.active = true;
        this._isHave = true;
        CDXX2_UIController.Instance.TipsPanel.show(`获得武器：${this.Name}`);
    }

    // 购买丹药
    buyElixir() {
        CDXX2_Equipment.Instance.addElixir(this.Name, this.RewardCount);
        CDXX2_UIController.Instance.TipsPanel.show(`获得丹药：${this.Name} x${this.RewardCount}`);
        CDXX2_UIController.Instance.refreshCurrency();
    }

    // 购买道具
    buyProp() {
        CDXX2_GameData.AddSpecialProp(this.Name, this.RewardCount);
        CDXX2_Equipment.Instance.addProp(this.Name, this.RewardCount);
        CDXX2_UIController.Instance.TipsPanel.show(`获得道具：${this.Name} x${this.RewardCount}`);
        CDXX2_UIController.Instance.refreshCurrency();
    }

    // 货币兑换
    exchangeCurrency() {
        // 根据ItemName判断兑换什么货币
        if (this.Name === "灵石") {
            CDXX2_GameData.Instance.userData["灵石"] += this.RewardCount;
        } else if (this.Name === "仙石") {
            CDXX2_GameData.Instance.userData["仙石"] += this.RewardCount;
        }
        CDXX2_GameData.DateSave();
        CDXX2_UIController.Instance.TipsPanel.show(`获得${this.Name} x${this.RewardCount}`);
        CDXX2_UIController.Instance.refreshCurrency();
    }
}
