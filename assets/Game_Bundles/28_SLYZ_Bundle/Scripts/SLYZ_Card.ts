import { _decorator, AudioClip, Component, director, Label, Node, Sprite, SpriteFrame, Vec3 } from 'cc';
import { SLYZ_CardHolder } from './SLYZ_CardHolder';
import { SLYZ_AudioManager } from './SLYZ_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('SLYZ_Card')
export class SLYZ_Card extends Component {

    @property(AudioClip)
    private cardSound: AudioClip = null;

    @property([SpriteFrame])
    private cardBottom: SpriteFrame[] = [];

    @property([SpriteFrame])
    private cardRarity: SpriteFrame[] = [];

    @property([SpriteFrame])
    private cardType: SpriteFrame[] = [];

    private cardName: string[] =
        ["可达", "宝石兽", "寒冰幼龙", "小白马", "布诺", "毒蛋", "水潭蜥蜴", "水狼", "火尾狼", "灰狐", "熔岩刺猬", "独角兽", "白狼", "胖兔", "花精灵",
            "花草兽", "蓝梦", "蝴蝶蜂", "音速犬", "魔法小羊", "剧毒甲狼", "剧毒白虎", "变色兽", "挪亚", "暗夜狼", "火焰兽", "火鹰龙", "烈焰", "烈焰蜥", "符文兽",
            "紫纹白狼", "紫翼飞龙", "紫荆兽", "闪电鲨", "暗夜", "火晶犬", "火角龙", "烈焰虎", "角狼", "重水精灵", "金甲蓝龙", "闪电龙", "霹雳鼠", "飞龙", "七彩翼狼",
            "光龙", "冰原龙", "冰晶神兽", "圣甲战龙", "烈焰龙", "圣堂天使", "恶魔撒旦", "水晶兽", "精灵王"];

    private nodePosY: number = -300;

    public cardDataID: number = -1;

    public isNormal: boolean = false;

    public isHaveCard: boolean = false;

    private _isStationary: boolean = false;
    protected onLoad(): void {
        // this.nameData();
    }
    start() {
    }

    update(deltaTime: number) {

    }

    public isStationary(): boolean {
        return this._isStationary;
    }
    cardSpawn(cardID: number, cardRarityID: number) {
        this.node.getChildByName("卡片底").getComponent(Sprite).spriteFrame = this.cardBottom[cardRarityID];
        this.node.getChildByName("稀有度").getComponent(Sprite).spriteFrame = this.cardRarity[cardRarityID];
        this.node.getChildByName("立绘").getComponent(Sprite).spriteFrame = this.cardType[cardID];
        this.node.getChildByName("卡片名").getComponent(Label).string = this.cardName[cardID];
        // console.log(this.cardName[cardID]);
    }

    haveCard() {
        if (!this.isHaveCard) return;
        this.node.getChildByName("新").active = false;
        this.node.getChildByName("出售提示").active = true;
    }
    //抽卡状态
    cardDrawState() {
        let startX = 0;
        let currentX = 0;
        const rotateSpeed = 0.2; // 旋转速度系数
        const moveSpeed = 1;//移动速度系数
        const hideThreshold = 300; // 隐藏阈值（像素）
        this.node.on(Node.EventType.TOUCH_START, (event) => {
            startX = event.getUILocation().x;
            SLYZ_AudioManager.instance.playSound(this.cardSound);
        });
        this.node.on(Node.EventType.TOUCH_MOVE, (event) => {
            currentX = event.getUILocation().x;
            const deltaX = currentX - startX;
            // 向右滑动时旋转节点
            if (deltaX > 0) {
                const rotation = deltaX * rotateSpeed;
                const position = deltaX * moveSpeed;
                this.node.setRotationFromEuler(0, 0, -rotation);
                this.node.setPosition(position, this.nodePosY, 0)
                // 超过阈值隐藏节点
                if (deltaX > hideThreshold) {
                    this.node.active = false;
                    const cardHolder = this.node.parent.parent.getComponent(SLYZ_CardHolder);
                    if (cardHolder) {
                        cardHolder.cardSelect();
                        // console.log(this.cardDataID);
                        director.emit("cardData", this.cardDataID);
                        if (this.isHaveCard) {
                            director.emit("AddCoin", 50);
                        }

                    }

                }
            }
        });
        this.node.on(Node.EventType.TOUCH_END, () => {
            // // 滑动结束复位旋转位移
            // this.node.setRotationFromEuler(0, 0, 0);
            // this.node.setPosition(0, this.nodePosY, 0);
            this.node.active = false;
            const cardHolder = this.node.parent.parent.getComponent(SLYZ_CardHolder);
            if (cardHolder) {
                cardHolder.cardSelect();
                // console.log(this.cardDataID);
                director.emit("cardData", this.cardDataID);
                if (this.isHaveCard) {
                    director.emit("AddCoin", 50);
                }

            }
        });
    }
    //滑动状态
    cardSlidState(spawnPoint: Vec3) {
        const startY = spawnPoint.y + 300;
        const targetPos = spawnPoint;// 目标位置
        // 初始化位置
        this.node.setPosition(spawnPoint.x, startY, spawnPoint.z);
        let touchStartY = 0;
        let progress = 0;
        this.node.getChildByName("手势").active = true;
        this.node.getChildByName("新").active = false;
        this.node.getChildByName("出售提示").active = false;
        this.node.on(Node.EventType.TOUCH_MOVE, (event) => {
            if (this.isNormal) return;
            const deltaY = touchStartY - event.getUILocation().y;
            progress = Math.min(Math.max(deltaY / 400, 0), 1);
            const currentY = startY - (targetPos.y - startY) * progress;
            this.node.setPosition(targetPos.x, -currentY, targetPos.z);
            // console.log(currentY);
            if (currentY >= 295) {
                director.emit("normalState", this.cardDataID);
                this.cardNormalState();
            }
        });

        this.node.on(Node.EventType.TOUCH_START, (event) => {
            if (touchStartY == 0) {
                touchStartY = event.getUILocation().y;
            }

        });

        this.node.on(Node.EventType.TOUCH_END, () => {

        });
    }


    //静止状态
    cardNormalState() {
        this.isNormal = true;
        this.node.getChildByName("新").active = false;
        console.log("静止状态");
        this.node.getChildByName("手势").active = false;
        let Touched = false;
        const rigNode = this.node.parent.parent.parent;
        const currParent = this.node.parent;

        this._isStationary = true;
        this.node.on(Node.EventType.TOUCH_START, (event) => {
            if (!Touched) {
                rigNode.getChildByName("卡片展示节点").addChild(this.node);
                rigNode.getChildByName("卡片展示节点").active = true;
                Touched = true;
            } else {
                currParent.addChild(this.node);
                rigNode.getChildByName("卡片展示节点").active = false;
                Touched = false;
            }

        });
    }
}


