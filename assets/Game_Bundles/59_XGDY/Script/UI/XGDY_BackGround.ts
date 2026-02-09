import { _decorator, Component, Node, Sprite, SpriteFrame, Vec3, director, UITransform, view } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BackgroundScroll')
export class BackgroundScroll extends Component {
    // 背景移动速度（像素/秒，负数表示向左移动，模拟坐车向后的视觉）
    @property({ tooltip: "背景移动速度（负数向左，正数向右）" })
    public moveSpeed: number = -100;

    // 背景图的 SpriteFrame（赋值后自动适配尺寸）
    @property({ type: SpriteFrame })
    public bgSpriteFrame: SpriteFrame = null!;

    // 两个背景节点
    private bg1: Node = null!;
    private bg2: Node = null!;
    // 背景图宽度（自动计算）
    private bgWidth: number = 0;

    onLoad() {
        // 获取两个背景节点
        this.bg1 = this.node.getChildByName('Bg1')!;
        this.bg2 = this.node.getChildByName('Bg2')!;

        // 初始化背景图
        this.initBgSprite();

        // 计算背景图宽度（Sprite 的实际显示宽度）
        // this.bgWidth = this.bgSpriteFrame.width * this.bg1.getComponent(Sprite)!.sizeMode === 0 
        //     ? this.bg1.getComponent(UITransform)!.width 
        //     : this.bgSpriteFrame.width;

         this.bgWidth =this.bg1.getComponent(UITransform)!.width 

         this.bg2.setPosition(new Vec3(this.bg1.position.x + this.bgWidth, this.bg1.position.y, 0));

        // // 初始化两个背景的位置（Bg1 在左，Bg2 紧贴 Bg1 右侧）
        // this.bg1.setPosition(Vec3.ZERO);
        // this.bg2.setPosition(new Vec3(this.bgWidth, 0, 0));
    }

    update(deltaTime: number) {
        // 计算每帧移动的距离
        const moveDistance = this.moveSpeed * deltaTime;

        // 移动两个背景节点
        this.bg1.setPosition(this.bg1.position.x + moveDistance, this.bg1.position.y);
        this.bg2.setPosition(this.bg2.position.x + moveDistance, this.bg2.position.y);


        // 边界检测：当背景完全移出左侧时，重置到右侧
        if (this.bg1.position.x <= -this.bgWidth) {
            this.bg1.setPosition(this.bg2.position.x + this.bgWidth, this.bg1.position.y);
        }
        if (this.bg2.position.x <= -this.bgWidth) {
            this.bg2.setPosition(this.bg1.position.x + this.bgWidth, this.bg2.position.y);
        }
    }

    // 初始化背景 Sprite 组件
    private initBgSprite() {
        const sprite1 = this.bg1.getComponent(Sprite)!;
        const sprite2 = this.bg2.getComponent(Sprite)!;
        
        sprite1.spriteFrame = this.bgSpriteFrame;
        sprite2.spriteFrame = this.bgSpriteFrame;

        // 设置 Sprite 尺寸适配（可选，根据需求调整）
        sprite1.sizeMode = Sprite.SizeMode.CUSTOM; // 自定义尺寸
        sprite2.sizeMode = Sprite.SizeMode.CUSTOM;
        // 适配画布高度（可选）
        const canvasWidth = view.getVisibleSize().width;
        this.bg1.getComponent(UITransform).width = canvasWidth;
        this.bg2.getComponent(UITransform).width = canvasWidth;
    }
}