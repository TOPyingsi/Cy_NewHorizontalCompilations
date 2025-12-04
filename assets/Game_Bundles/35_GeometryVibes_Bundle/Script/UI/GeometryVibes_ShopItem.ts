import { _decorator, Button, Component, Label, Node, Sprite, SpriteFrame, Texture2D, resources, Color } from 'cc';  
import { GeometryVibes_DataManager, GeometryVibes_ItemSource, GeometryVibes_ItemType, GeometryVibes_ShopItemConfig } from '../Manager/GeometryVibes_DataManager';
import { GeometryVibes_AudioManager } from '../Manager/GeometryVibes_AudioManager';



const { ccclass, property } = _decorator;

// 物品项UI组件
@ccclass('GeometryVibes_ShopItem')
export class GeometryVibes_ShopItem extends Component {
    @property(Sprite)
    iconSprite: Sprite = null;

    @property(Label)
    priceLabel: Label = null;

    // @property(Sprite)
    // priceIcon: Sprite = null;

    // @property(Node)
    // ownedMark: Node = null;

    // @property(Node)
    // selectedMark: Node = null;

    @property(Node)
    coinIconNode: Node = null;

    @property(Node)
    videoIconNode: Node = null;

    // @property([SpriteFrame])
    // planeIcons: SpriteFrame[] = [];

    // @property([SpriteFrame])
    // trailIcons: SpriteFrame[] = [];

    // @property([SpriteFrame])
    // colorIcons: SpriteFrame[] = [];


    private itemData: GeometryVibes_ShopItemConfig = null;
    private onClickCallback: (itemId: string) => void = null;

    // 初始化物品项
    public init(item: GeometryVibes_ShopItemConfig, isOwned: boolean, isSelected: boolean, callback: (itemId: string) => void,sprite?:SpriteFrame) {

        this.itemData = item;
        this.onClickCallback = callback;

        // // 加载图标
        // this.loadIcon(item.icon);
         // 根据类型和索引设置图标
         if(sprite){
            this.iconSprite.spriteFrame = sprite;
         }
         else{
            // 颜色使用白图并修改颜色
            this.iconSprite.color = new Color(item.color);
         }

        // if (item.type === GeometryVibes_ItemType.PLANE && this.planeIcons[item.style]) {
        //     this.iconSprite.spriteFrame = this.planeIcons[item.style];
        // } else if (item.type === GeometryVibes_ItemType.TRAIL && this.trailIcons[item.tail]) {
        //     this.iconSprite.spriteFrame = this.trailIcons[item.tail];
        // } else if (item.type === GeometryVibes_ItemType.COLOR) {
        //     // 颜色使用白图并修改颜色
        //     this.iconSprite.color = new Color(item.color);
        // }


        if (item.source === GeometryVibes_ItemSource.COIN) {
            this.coinIconNode.active = true;
            this.videoIconNode.active = false;
                    // 设置价格和图标
            this.priceLabel.string = item.price.toString();
        } else if (item.source === GeometryVibes_ItemSource.VIDEO) {
            this.videoIconNode.active = true;
            this.coinIconNode.active = false;
            if (item.source === GeometryVibes_ItemSource.VIDEO) {
                const counts = GeometryVibes_DataManager.getInstance().getVideoWatchedCount(item.id);
                this.priceLabel.string  = `${counts.watched}/${counts.total}`;
            }
        }

        if(isOwned){
            this.videoIconNode.active = false;
            this.coinIconNode.active = false;
        }
        

        // 更新状态
        this.updateStatus(isOwned, isSelected);

        // 添加点击事件
        this.addButtonClick(this.node.getComponent(Button), this.onItemClick, this);
    }

    // 加载图标资源
    private loadIcon(path: string) {
        resources.load(path, Texture2D, (err, texture) => {
            if (!err && this.iconSprite) {
                const spriteFrame = new SpriteFrame();
                spriteFrame.texture = texture;
                this.iconSprite.spriteFrame = spriteFrame;
            }
        });
    }

    // 更新物品状态
    public updateStatus(isOwned: boolean, isSelected: boolean) {
        // this.ownedMark.active = isOwned;
        // this.selectedMark.active = isSelected;
        
        // 如果已拥有，隐藏价格
        this.priceLabel.node.active = !isOwned;
        // this.priceIcon.node.active = !isOwned;
    }

    // 物品点击事件
    private onItemClick() {
        //  GeometryVibes_AudioManager.globalAudioPlay("Item Touch Collect");
         if(GeometryVibes_DataManager.getInstance().isSoundEnabled()){
            GeometryVibes_AudioManager.getInstance().playSound("Item Touch Collect");
         }
        if (this.onClickCallback && this.itemData) {
            this.onClickCallback(this.itemData.id);
        }
    }

    // 添加按钮点击事件
    private addButtonClick(button: Button, callback: Function, target: any) {
        if (button) {
            button.node.on(Button.EventType.CLICK, callback, target);
        }
    }
}