import { _decorator, Button, Component, Label, Node, Sprite, SpriteFrame, Texture2D, resources, instantiate, Color, tween, Vec3, MotionStreak, ParticleSystem2D } from 'cc';  
const { ccclass, property } = _decorator;


import { GeometryVibes_BasePanel } from '../Common/GeometryVibes_BasePanel';
import { GeometryVibes_DataManager, GeometryVibes_GameMode, GeometryVibes_ItemSource, GeometryVibes_ItemType, GeometryVibes_PlaneStyle, GeometryVibes_ShopItemConfig } from '../Manager/GeometryVibes_DataManager';
import { GeometryVibes_ShopItem } from './GeometryVibes_ShopItem';
import { GeometryVibes_UIManager } from '../Manager/GeometryVibes_UIManager';
import { GeometryVibes_GameManager } from '../Manager/GeometryVibes_GameManager';
import Banner from 'db://assets/Scripts/Banner';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';

// 商店面板主组件
@ccclass('GeometryVibes_ShopPanel')
export class GeometryVibes_ShopPanel extends GeometryVibes_BasePanel {

    @property(Button)
    planeTabButton: Button = null;

    @property(Button)
    trailTabButton: Button = null;

    @property(Button)
    colorTabButton: Button = null;

    @property(Node)
    planeContent: Node = null;

    @property(Node)
    trailContent: Node = null;

    @property(Node)
    colorContent: Node = null;

    @property(Label)
    coinLabel: Label = null;

    @property(Node)
    planePreview: Node = null;

    @property(Sprite)
    planePreviewSprite: Sprite = null;

    @property(Node)
    itemPrefab: Node = null;

    @property(Button)
    startButton: Button = null;

    @property(Button)
    BackButton: Button = null;
    
    @property(Node)
    selectedNode: Node = null;

    // @property(SpriteFrame)
    // tabActiveSprite: SpriteFrame = null;

    // @property(SpriteFrame)
    // tabInactiveSprite: SpriteFrame = null;

    @property([SpriteFrame])
    planeIcons: SpriteFrame[] = [];

    @property([SpriteFrame])
    trailIcons: SpriteFrame[] = [];

    @property([Texture2D])
    trailTexture: Texture2D[] = [];

    private currentTab: GeometryVibes_ItemType = GeometryVibes_ItemType.PLANE;
    private dataManager: GeometryVibes_DataManager = null;

    public init(): void {
        super.init();
        this.dataManager = GeometryVibes_DataManager.getInstance();
        this.setupUI();
        this.refreshShopContent(this.currentTab);

        this.selectedNode.active = false;
        ProjectEventManager.emit(ProjectEvent.弹出窗口, "几何冲刺");
    }

    // 设置UI内容
    private setupUI(): void {
        // 更新金币显示
        this.coinLabel.string = this.dataManager.getCoins().toString();

        // 设置页签点击事件
        this.addButtonClick(this.planeTabButton, () => this.onTabClick(GeometryVibes_ItemType.PLANE), this);
        this.addButtonClick(this.trailTabButton, () => this.onTabClick(GeometryVibes_ItemType.TRAIL), this);
        this.addButtonClick(this.colorTabButton, () => this.onTabClick(GeometryVibes_ItemType.COLOR), this);
        
        // 设置开始按钮点击事件
        this.addButtonClick(this.startButton, this.onStartClick, this);
        this.addButtonClick(this.BackButton, this.onBackClick, this);

        

        this.initTab();

        // 初始化页签状态
        this.updateTabStatus();

        // 初始化预览飞机
        this.updatePlanePreview();
    }

    initTab(){
        let planeTab = this.planeTabButton.node.getChildByName("selected");
        let trailTab = this.trailTabButton.node.getChildByName("selected");
        let colorTab = this.colorTabButton.node.getChildByName("selected");
        planeTab.active = false;
        trailTab.active = false;
        colorTab.active = false;
    }

    // 页签点击事件
    private onTabClick(type: GeometryVibes_ItemType): void {
        if (this.currentTab !== type) {
            this.currentTab = type;
            this.updateTabStatus();
            this.refreshShopContent(type);
        }
    }

    private updateTabStatus(): void {
        // 更新按钮状态
        this.setTabButtonState(this.planeTabButton, this.currentTab === GeometryVibes_ItemType.PLANE);
        this.setTabButtonState(this.trailTabButton, this.currentTab === GeometryVibes_ItemType.TRAIL);
        this.setTabButtonState(this.colorTabButton, this.currentTab === GeometryVibes_ItemType.COLOR);
    
        // 更新内容显示
        this.planeContent.active = this.currentTab === GeometryVibes_ItemType.PLANE;
        this.trailContent.active = this.currentTab === GeometryVibes_ItemType.TRAIL;
        this.colorContent.active = this.currentTab === GeometryVibes_ItemType.COLOR;
    }
    
    // 修改后的设置页签按钮状态方法
    private setTabButtonState(button: Button, isActive: boolean): void {
        // const sprite = button.node.getComponent(Sprite);
        // if (sprite) {
        //     sprite.spriteFrame = isActive ? this.tabActiveSprite : this.tabInactiveSprite;
        // }
        
        // 控制 selected 节点显示状态
        const selectedNode = button.node.getChildByName('selected');
        if (selectedNode) {
            selectedNode.active = isActive;
        }
    }

    // 刷新商店内容
    private refreshShopContent(type: GeometryVibes_ItemType): void {
        // 获取对应类型的内容容器
        const contentNode = this.getContentNodeByType(type);
        if (!contentNode) return;

        // 清空现有内容
        this.clearContent(contentNode);

        // 获取物品配置和玩家物品数据
        const itemsConfig = this.dataManager.getShopItemsByType(type);
        const playerItems = this.dataManager.getPlayerItems();

        // 创建物品项
        itemsConfig.forEach(itemConfig => {
            const itemData = playerItems[itemConfig.id];
            if (itemData) {
                const itemNode = this.createItemNode(contentNode);
                let iconSp :SpriteFrame= null;
                  if (itemConfig.type === GeometryVibes_ItemType.PLANE) {
                    iconSp = this.planeIcons[itemConfig.style];
                } else if (itemConfig.type === GeometryVibes_ItemType.TRAIL) {
                    iconSp = this.trailIcons[itemConfig.tail];
                } else if (itemConfig.type === GeometryVibes_ItemType.COLOR) {
                    // 颜色使用白图并修改颜色
                    iconSp = null;
                }

                const itemComponent = itemNode.getComponent(GeometryVibes_ShopItem);
                if (itemComponent) {
                    itemComponent.init(
                        itemConfig, 
                        itemData.isOwned, 
                        itemData.isSelected,
                        this.onItemSelected.bind(this),
                        iconSp
                    );
                }
            }
        });

        // 更新预览
        this.updatePlanePreview();
    }

    // 根据类型获取内容容器
    private getContentNodeByType(type: GeometryVibes_ItemType): Node {
        switch (type) {
            case GeometryVibes_ItemType.PLANE:
                return this.planeContent;
            case GeometryVibes_ItemType.TRAIL:
                return this.trailContent;
            case GeometryVibes_ItemType.COLOR:
                return this.colorContent;
            default:
                return null;
        }
    }


    // 清空内容容器
    private clearContent(contentNode: Node): void {
        for (let i = contentNode.children.length - 1; i >= 0; i--) {
            contentNode.children[i].destroy();
        }
    }

    // 创建物品节点
    private createItemNode(parent: Node): Node {
        if (!this.itemPrefab) return null;

        const itemNode = instantiate(this.itemPrefab);
        itemNode.parent = parent;
        itemNode.active = true;
        return itemNode;
    }

    // 物品选中处理
    private onItemSelected(itemId: string): void {
        const itemsConfig = this.shopItemsConfig;
        const itemConfig = itemsConfig.find(item => item.id === itemId);
        if (!itemConfig) return;

        const playerItems = this.dataManager.getPlayerItems();
        const itemData = playerItems[itemId];

        // 如果已拥有，直接选择
        if (itemData.isOwned) {
            this.dataManager.selectItem(itemId);
            this.refreshShopContent(this.currentTab);
            this.updatePlanePreview();
            return;
        }

        // 处理购买
        if (itemConfig.source === GeometryVibes_ItemSource.COIN) {
            const success = this.dataManager.buyItemWithCoin(itemId);
            if (success) {
                this.coinLabel.string = this.dataManager.getCoins().toString();
                this.dataManager.selectItem(itemId);
                this.refreshShopContent(this.currentTab);
                this.updatePlanePreview();
                // 显示购买成功提示
            } else {
                EventManager.on("CoinChange",this.onCoinChange,this);

                // 显示金币不足提示
                GeometryVibes_UIManager.getInstance().showUI("TipPanel",)
            }
        } else if (itemConfig.source === GeometryVibes_ItemSource.VIDEO) {
            // 这里应该调用视频广告接口
            Banner.Instance.ShowVideoAd(()=>{
                // 假设视频播放完成
                const success = this.dataManager.buyItemWithVideo(itemId);
                if (success) {
                    this.dataManager.selectItem(itemId);
                    this.refreshShopContent(this.currentTab);
                    this.updatePlanePreview();
                    // 显示获取成功提示
                } else {
                    // 显示视频次数用完提示
                }
            });
    
        }
    }

    // onAdFail(){

    // }

    private onCoinChange(){
        this.coinLabel.string = this.dataManager.getCoins().toString();
        this.refreshShopContent(this.currentTab);
        this.updatePlanePreview();
        EventManager.off("CoinChange",this.onCoinChange,this);
    }


    // 更新飞机预览
    private updatePlanePreview(): void {
        const selectedPlaneId = this.dataManager.getSelectedItemIdByType(GeometryVibes_ItemType.PLANE);
        const planeConfig = this.shopItemsConfig.find(item => item.id === selectedPlaneId);

        this.selectedNode.active = true;
        tween(this.selectedNode)
            .delay(1)
            .call(()=>{
                this.selectedNode.active = false;
            })
            .start();

        //tail
        const selectedTailId = this.dataManager.getSelectedItemIdByType(GeometryVibes_ItemType.TRAIL);
        const tailConfig = this.shopItemsConfig.find(item => item.id === selectedTailId);
        if (tailConfig && this.planePreview.getChildByName("tail")) {
            // 新增拖尾效果设置
            const tileNode = this.planePreview.getChildByName('tail');
            if (tileNode) {
                let trailSprite = tileNode.getComponentInChildren(Sprite);
                if(trailSprite){
                    trailSprite.spriteFrame = this.trailIcons[tailConfig.tail];
                }

                // const motionStreak = tileNode.getComponent(MotionStreak);
                // if (motionStreak && this.trailTexture[planeConfig.tail]) {
                //     motionStreak.texture = this.trailTexture[planeConfig.tail];
                    
                //     // 停止之前的动画
                //     tween(tileNode).stop();
                    
                //     // 记录原始位置
                //     const originalPos = tileNode.position.clone();
                //     // 生成随机移动距离（不超过100）
                //     const randomDistance = Math.random() * 100;
                //     // 计算45度方向偏移
                //     const offset = new Vec3(100, 100, 0);
    
                //     // 创建循环动画
                //     tween(tileNode)
                //         .to(1, { position: originalPos.add(offset) })
                //         // .to(1, { position: originalPos })
                //         // .union()
                //         // .repeatForever()
                //         .start();
                // }
            }
            // if (tileNode) {
            //     const motionStreak = tileNode.getComponent(MotionStreak);
            //     if (motionStreak && this.trailTexture[planeConfig.tail]) {
            //         motionStreak.texture = this.trailTexture[planeConfig.tail];
                    
            //         // 初始化动画参数
            //         this._tileOriginalPos = tileNode.position.clone();
            //         this._tileMoveDistance = Math.random() * 100;
            //         this._tileMoveSpeed = this._tileMoveDistance / 0.2; // 0.2秒完成单程
            //         this._tileCurrentOffset = 0;
            //         this._tileMoveDirection = 1;
            //     }
            // }
        }

        //飞机样式
        if (planeConfig && this.planePreviewSprite) {
            // 加载飞机预览图
            this.planePreviewSprite.spriteFrame = this.planeIcons[planeConfig.style];
        }
        let planeCountainr = this.planePreview.getChildByName("plane");
         const tileNode = this.planePreview.getChildByName('tail');
         switch(planeConfig.style){
                case GeometryVibes_PlaneStyle.Square:
                     planeCountainr.children.forEach(child => {
                        child.active = false;
                    });
                    let planeNode1 = planeCountainr.getChildByName("plane_2");
                    planeNode1.active = true;
                    // planeNode1.getChildByName("TailSnow").getComponent(ParticleSystem2D).resetSystem();
                    // tileNode.active = false;
                    return;
                case GeometryVibes_PlaneStyle.Circle:
                    planeCountainr.children.forEach(child => {
                        child.active = false;
                    });
                    let planeNode2 = planeCountainr.getChildByName("plane_3");
                    planeNode2.active = true;
                    // planeNode2.getChildByName("TailSnow").getComponent(ParticleSystem2D).resetSystem();
                    //  tileNode.active = false;
                    return;
                default:
                    planeCountainr.children.forEach(child => {
                        child.active = false;
                    });
                     tileNode.active = true;
                    planeCountainr.getChildByName("plane_1").active = true;
                    let spriteCom = planeCountainr.getChildByName("plane_1").getComponent(Sprite);
                    spriteCom.spriteFrame = this.planeIcons[planeConfig.style];
                    break;
            }

         //color
         const selectedColorId = this.dataManager.getSelectedItemIdByType(GeometryVibes_ItemType.COLOR);
         const colorConfig = this.shopItemsConfig.find(item => item.id === selectedColorId);
         if (colorConfig && this.planePreviewSprite) {
              this.planePreviewSprite.color = new Color(colorConfig.color)
         }
        // 如果需要更新颜色或拖尾效果，在这里处理
        // ...
    }

    // 在类中添加成员变量
private _tileOriginalPos: Vec3 = new Vec3();
private _tileMoveSpeed: number = 0;
private _tileMoveDistance: number = 0;
private _tileCurrentOffset: number = 0;
private _tileMoveDirection: number = 1;


// 在 update 方法中添加动画逻辑（需要先在类中添加 update 方法）
update(dt: number) {
    if (this._tileMoveDistance > 0) {
        const delta = this._tileMoveDirection * this._tileMoveSpeed * dt;
        this._tileCurrentOffset += delta;

        // 方向反转判断
        if (Math.abs(this._tileCurrentOffset) >= this._tileMoveDistance) {
            this._tileMoveDirection *= -1;
            this._tileCurrentOffset = this._tileMoveDistance * this._tileMoveDirection;
        }

        // 应用45度方向偏移
        const tileNode = this.planePreview.getChildByName('tile');
        if (tileNode) {
            const offset = new Vec3(
                -this._tileCurrentOffset,
                -this._tileCurrentOffset,
                0
            );
            tileNode.position = this._tileOriginalPos.add(offset);
        }
    }
}

    // 开始按钮点击事件
    private onStartClick(): void {

        // 进入游戏
        GeometryVibes_GameManager.getInstance().startGame();
        // 这里可以添加进入游戏的逻辑
    }

    // 开始按钮点击事件
     private onBackClick(): void {
        let mode = GeometryVibes_DataManager.getInstance().getCurrentGameMode();

        if(mode == GeometryVibes_GameMode.ENDLESS){
            GeometryVibes_UIManager.getInstance().showUI("MainMenuPanel",()=>{
                GeometryVibes_UIManager.getInstance().hideUI("ShopPanel")
            }); 
        }else{
            // 进入游戏
            GeometryVibes_UIManager.getInstance().showUI("LevelSelectPanel",()=>{
                GeometryVibes_UIManager.getInstance().hideUI("ShopPanel")
                // GeometryVibes_GameManager.getInstance().startGame();
            });
        }

        // 这里可以添加进入游戏的逻辑
    }


    // 获取商店物品配置（实际应该从DataManager获取，这里为了简化代码）
    private get shopItemsConfig(): GeometryVibes_ShopItemConfig[] {
        return this.dataManager.getShopItemsByType(GeometryVibes_ItemType.PLANE)
            .concat(this.dataManager.getShopItemsByType(GeometryVibes_ItemType.TRAIL))
            .concat(this.dataManager.getShopItemsByType(GeometryVibes_ItemType.COLOR));
    }
}

// // 辅助函数：实例化节点（Cocos Creator 中常用的工具函数）
// function instantiate(node: Node): Node {
//     const newNode = new Node(node.name);
//     const parent = node.parent;
//     if (parent) {
//         newNode.parent = parent;
//     }
//     newNode.setPosition(node.position);
//     newNode.setRotation(node.rotation);
//     newNode.setScale(node.scale);
//     newNode.setSiblingIndex(node.getSiblingIndex() + 1);
    
//     // 复制组件
//     const components = node.getComponents(Component);
//     for (const comp of components) {
//         const newComp = newNode.addComponent(comp.constructor.name as any);
//         const props = comp["__props__"];
//         if (props) {
//             for (const prop of props) {
//                 (newComp as any)[prop] = (comp as any)[prop];
//             }
//         }
//     }
    
//     return newNode;
// }
