import { _decorator, Node, Component, EventTouch, Input, Label, resources, Sprite, SpriteFrame, tween, UITransform, v3, Vec3, UIOpacity, Tween, find, NodePool, Widget, director } from 'cc';
import NodeUtil from 'db://assets/Scripts/Framework/Utils/NodeUtil';
import { XGTS_ItemData, XGTS_ItemType } from '../XGTS_Data';
import { XGTS_Constant, XGTS_Quality } from '../XGTS_Constant';
import { XGTS_GameManager } from '../XGTS_GameManager';
import { EasingType } from 'db://assets/Scripts/Framework/Utils/TweenUtil';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import XGTS_Inventory from './XGTS_Inventory';
import { XGTS_Audio, XGTS_AudioManager } from '../XGTS_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XGTS_Item')
export default class XGTS_Item extends Component {
    trans: UITransform = null;
    Background: Sprite | null = null;
    BackgroundTrans: UITransform | null = null;
    BackgroundWidget: Widget | null = null;
    Unsearch: Node | null = null;
    UnsearchWidget: Widget | null = null;
    ItemDetail: UIOpacity | null = null;
    Icon_Display: Sprite | null = null;
    Icon: Sprite | null = null;
    NameLabel: Label | null = null;
    NameLabelTrans: UITransform = null;
    DescLabel: Label | null = null;
    SearchIcon: Node | null = null;

    data: XGTS_ItemData = null;
    offset: Vec3 = v3();
    searchTimer: number = 0;
    angle: number = 0;
    canDrag: boolean = true;
    isShopItem: boolean = false;
    touchCallback: Function = null;

    belongInventory: XGTS_Inventory = null;

    public get Center(): Vec3 {
        return v3(this.data.Size.width / 2 * XGTS_Constant.itemSize - XGTS_Constant.itemSize / 2, -(this.data.Size.height / 2 * XGTS_Constant.itemSize - XGTS_Constant.itemSize / 2));
    }

    onLoad() {
        this.trans = this.node.getComponent(UITransform);
        this.Background = NodeUtil.GetComponent("Background", this.node, Sprite);
        this.BackgroundTrans = this.Background.getComponent(UITransform);
        this.BackgroundWidget = this.Background.getComponent(Widget);
        this.Unsearch = NodeUtil.GetNode("Unsearch", this.node);
        this.UnsearchWidget = this.Unsearch.getComponent(Widget);
        this.ItemDetail = NodeUtil.GetComponent("ItemDetail", this.node, UIOpacity);
        this.Icon_Display = NodeUtil.GetComponent("Icon_Display", this.node, Sprite);
        this.Icon = NodeUtil.GetComponent("Icon", this.node, Sprite);
        this.NameLabel = NodeUtil.GetComponent("NameLabel", this.node, Label);
        this.NameLabelTrans = this.NameLabel.getComponent(UITransform);
        this.DescLabel = NodeUtil.GetComponent("DescLabel", this.node, Label);
        this.SearchIcon = NodeUtil.GetNode("SearchIcon", this.node);
    }

    Init(data: XGTS_ItemData) {
        this.trans = this.node.getComponent(UITransform);
        this.Background = NodeUtil.GetComponent("Background", this.node, Sprite);
        this.BackgroundTrans = this.Background.getComponent(UITransform);
        this.BackgroundWidget = this.Background.getComponent(Widget);
        this.Unsearch = NodeUtil.GetNode("Unsearch", this.node);
        this.UnsearchWidget = this.Unsearch.getComponent(Widget);
        this.ItemDetail = NodeUtil.GetComponent("ItemDetail", this.node, UIOpacity);
        this.Icon_Display = NodeUtil.GetComponent("Icon_Display", this.node, Sprite);
        this.Icon = NodeUtil.GetComponent("Icon", this.node, Sprite);
        this.NameLabel = NodeUtil.GetComponent("NameLabel", this.node, Label);
        this.NameLabelTrans = this.NameLabel.getComponent(UITransform);
        this.DescLabel = NodeUtil.GetComponent("DescLabel", this.node, Label);
        this.SearchIcon = NodeUtil.GetNode("SearchIcon", this.node);


        this.data = data;
        this.NameLabel.string = data.Name;
        this.DescLabel.string = ``;

        // 根据是否旋转来设置物品大小
        if (data.Rotated) {
            this.trans.setContentSize(XGTS_Constant.itemSize * data.Size.height, XGTS_Constant.itemSize * data.Size.width);
        } else {
            this.trans.setContentSize(XGTS_Constant.itemSize * data.Size.width, XGTS_Constant.itemSize * data.Size.height);
        }
        
        // this.BackgroundTrans.setContentSize(XGTS_Constant.itemSize * data.Size.width, XGTS_Constant.itemSize * data.Size.height);
        // 修正锚点设置，确保旋转后位置正确
        if (data.Rotated) {
            this.trans.setAnchorPoint(0.5, 0.5);
        } else {
            this.trans.setAnchorPoint(0.5, 0.5);
        }
        this.BackgroundWidget.updateAlignment();
        this.UnsearchWidget.updateAlignment();

        this.NameLabelTrans.setContentSize(this.trans.contentSize.width * 2 - 20, this.NameLabelTrans.contentSize.height);

        BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Items/${data.ImageId}`).then((sf: SpriteFrame) => {
            this.Icon_Display.spriteFrame = sf;
            this.Icon.spriteFrame = sf;
            this.Icon_Display.node.setPosition(Vec3.ZERO);
            this.Icon.node.setPosition(Vec3.ZERO);
            XGTS_Item.SetItemImageScale(this.Icon_Display, data.Size.width, data.Size.height);
            XGTS_Item.SetItemImageScale(this.Icon, data.Size.width, data.Size.height);
            
            // 根据是否旋转来设置物品图片的旋转角度
            if (data.Rotated) {
                this.Icon_Display.node.angle = -90;
                this.Icon.node.angle = -90;
            } else {
                this.Icon_Display.node.angle = 0;
                this.Icon.node.angle = 0;
            }
        });

        this.canDrag = data.Searched;
        this.NameLabel.node.active = data.Searched;
        this.SearchIcon.active = false;
        this.Unsearch.active = !data.Searched;
        this.ItemDetail.node.active = data.Searched;

        //没有搜索过
        if (!data.Searched) {
            this.angle = 0;
            this.SearchIcon.setPosition(this.Center);
        } else {
            this.Background.color = XGTS_GameManager.GetColorHexByQuality(data.Quality);

            if (this.data.Type == XGTS_ItemType.Ammo) {
                this.DescLabel.string = `${this.data.Count}`;
            }
        }

        this.isShopItem = false;
        this.touchCallback = null;
    }

    RemoveItemFromAndResetLastInventory() {
        if (this.belongInventory) {
            this.belongInventory.RemoveItemFromArray(this.data);
            this.belongInventory = null;
        }
    }

    InitShopItem(data: XGTS_ItemData, callback: Function) {
        this.onLoad();
        this.Init(data);
        this.isShopItem = true;
        this.touchCallback = callback;
    }

    /**显示搜索物资的动画 */
    Search(end: Function = null) {
        clearInterval(this.searchTimer);
        this.SearchIcon.active = true;
        this.searchTimer = setInterval(this.SearchAni.bind(this), 20);
        this.scheduleOnce(() => {
            clearInterval(this.searchTimer);
            this.data.Searched = true;
            this.Unsearch.active = false;
            this.SearchIcon.active = false;
            this.Background.color = XGTS_GameManager.GetColorHexByQuality(this.data.Quality);

            this.ItemDetail.node.active = true;
            this.NameLabel.node.active = true;
            this.ItemDetail.node.setScale(1.5, 1.5, 1.5)

            Tween.stopAllByTarget(this.ItemDetail.node);
            // tween(this.ItemDetail.node).to(0.1, { scale: Vec3.ONE }, { easing: EasingType.quartIn }).call(() => {
            tween(this.ItemDetail.node).to(0.05, { scale: Vec3.ONE }).call(() => {
                this.canDrag = true;
            }).start();
            if (this.data.Quality < 3) {
                XGTS_AudioManager.Instance.PlaySFX(XGTS_Audio.蓝);
                if (Math.random() < 0.2) {
                    XGTS_AudioManager.Instance.PlaySFX(XGTS_Audio.难过);
                    director.getScene().emit("修勾逃生_展示表情", "难过");
                }
            } else if (this.data.Quality < 5) {
                XGTS_AudioManager.Instance.PlaySFX(XGTS_Audio.紫);
                if (Math.random() < 0.3) {
                    XGTS_AudioManager.Instance.PlaySFX(XGTS_Audio.一般);
                    director.getScene().emit("修勾逃生_展示表情", "一般");
                }
            } else {
                XGTS_AudioManager.Instance.PlaySFX(XGTS_Audio.红);
                if (this.data.Quality == 5) {
                    if (Math.random() < 0.3) {
                        XGTS_AudioManager.Instance.PlaySFX(XGTS_Audio.开心);
                        director.getScene().emit("修勾逃生_展示表情", "开心");
                    }
                }
                if (this.data.Quality == 6) {
                    XGTS_AudioManager.Instance.PlaySFX(XGTS_Audio.开心);
                    director.getScene().emit("修勾逃生_展示表情", "开心");
                }
            }
            end && end();
        }, XGTS_Constant.SearchTime[this.data.Quality]);
    }

    SearchAni() {
        this.angle += 10 * 0.02;

        const x = this.Center.x + 10 * Math.sin(this.angle);
        const y = this.Center.y + 10 * Math.cos(this.angle);

        this.SearchIcon.setPosition(new Vec3(x, y, 0));
    }

    onTouchStart(event: EventTouch) {
        if (!this.canDrag || this.isShopItem) return;
        let position = this.Icon.node.worldPosition.clone();
        this.Icon.node.setParent(find("Canvas"));
        this.Icon.node.setWorldPosition(position);

        EventManager.Scene.emit(XGTS_Constant.Event.ON_ITEM_DRAGSTART, this, event.touch.getUILocation());
    }

    onTouchMove(event: EventTouch) {
        if (!this.canDrag || this.isShopItem) return;
        const touch = event.touch!;
        const touchPos = touch.getUILocation();
        const offset = v3(this.data.Size.width / 2 * XGTS_Constant.itemSize - XGTS_Constant.itemSize / 2, -(this.data.Size.height / 2 * XGTS_Constant.itemSize - XGTS_Constant.itemSize / 2));
        this.Icon.node.setWorldPosition(v3(touchPos.x + offset.x, touchPos.y + offset.y));

        EventManager.Scene.emit(XGTS_Constant.Event.ON_ITEM_DRAGGING, this, event.touch.getUILocation());
    }

    onTouchEnd(event: EventTouch) {
        if (this.isShopItem) {
            this.touchCallback && this.touchCallback(this.data);
            return;
        }

        if (!this.canDrag) return;
        this.Icon.node.setParent(this.Icon_Display.node.parent);
        this.Icon.node.setPosition(this.Icon_Display.node.position);
        const touchPos = event.touch.getUILocation();

        EventManager.Scene.emit(XGTS_Constant.Event.ON_ITEM_DRAGEND, this, touchPos);
    }

    onTouchCancel(event: EventTouch) {
        if (!this.canDrag) return;
        this.Icon.node.setParent(this.Icon_Display.node.parent);
        this.Icon.node.setPosition(this.Icon_Display.node.position);
        const touchPos = event.touch.getUILocation();

        EventManager.Scene.emit(XGTS_Constant.Event.ON_ITEM_DRAGEND, this, touchPos);
    }

    protected onEnable(): void {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    }

    protected onDisable(): void {
        clearInterval(this.searchTimer);

        this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    }

    //设置图片不超过格子范围
    public static SetItemImageScale(image: Sprite, gridWidth: number, girdHeight: number) {
        // 获取原图尺寸（单位：像素）
        let originalWidth = image.getComponent(UITransform).contentSize.width;
        let originalHeight = image.getComponent(UITransform).contentSize.height;

        // 边距
        let padding = 25;

        // 获取目标容器（格子）尺寸
        let targetWidth = gridWidth * XGTS_Constant.itemSize - padding;
        let targetHeight = girdHeight * XGTS_Constant.itemSize - padding;

        // 计算缩放比例
        let scaleX = targetWidth / originalWidth;
        let scaleY = targetHeight / originalHeight;

        // 取最小缩放比例，保持比例同时不超出格子
        let scale = scaleX > scaleY ? scaleY : scaleX;
        image.node.setScale(scale, scale, 1);
    }
}