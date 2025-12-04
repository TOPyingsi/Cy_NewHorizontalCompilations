import { _decorator, Color, Component, director, instantiate, Node, Prefab, Sprite, v3 } from 'cc';
import { ZSTSB_Pixel } from './ZSTSB_Pixel';
import { ZSTSB_GameMgr } from './ZSTSB_GameMgr';
const { ccclass, property } = _decorator;

@ccclass('ZSTSB_PixelPool')
export class ZSTSB_PixelPool extends Component {

    @property(Prefab)
    pixelPrefab: Prefab | null = null;
    @property(Prefab)
    spritePrefab: Prefab | null = null;

    // 在类中添加对象池相关属性
    private pixelPool: Node[] = [];
    private usedPixels: Node[] = [];

    private spritePool: Sprite[] = [];
    private usedSprites: Sprite[] = [];
    start() {
        this.CreatePixels(2500);
    }

    async CreatePixels(num: number) {
        const batchSize = 50; // 每批创建50个节点
        const interval = 0.01; // 每批间隔0.01秒
        const effectTarget = ZSTSB_GameMgr.instance.Target.getChildByName("特效");
        const spriteTarget = ZSTSB_GameMgr.instance.Target.getChildByName("图片");

        for (let i = 0; i < num; i += batchSize) {
            // 计算当前批次需要创建的节点数量
            const currentBatchSize = Math.min(batchSize, num - i);

            // 创建当前批次的节点
            for (let j = 0; j < currentBatchSize; j++) {
                const pixel = instantiate(this.pixelPrefab);
                const spriteNode = instantiate(this.spritePrefab);

                pixel.setParent(effectTarget);
                spriteNode.setParent(spriteTarget);

                const sprite = spriteNode.getComponent(Sprite);

                this.pixelPool.push(pixel);
                this.spritePool.push(sprite);
            }

            // 如果还有下一批，等待指定时间
            if (i + batchSize < num) {
                await new Promise(resolve => this.scheduleOnce(resolve, interval));
            }
        }

        console.log(`对象池初始化完成，总共创建 ${num} 个像素节点`);
    }

    // 添加获取对象池节点的方法
    public getPixelFromPool(): Node {
        if (this.pixelPool.length > 0) {
            return this.pixelPool.pop();
        } else {
            return instantiate(this.pixelPrefab);
        }
    }

    public getSpriteFromPool(): Sprite {
        if (this.spritePool.length > 0) {
            return this.spritePool.pop();
        } else {
            return instantiate(this.spritePrefab).getComponent(Sprite);
        }
    }

    // 添加回收节点到对象池的方法
    public returnPixelToPool(pixel: Node): void {
        // 重置节点状态

        // pixel.removeFromParent();
        pixel.position = v3(0, 0, 0);
        // pixel.active = false;

        // 重置像素组件状态
        const pixelComponent = pixel.getComponent(ZSTSB_Pixel);
        if (pixelComponent) {
            pixelComponent.reset(); // 假设ZSTSB_Pixel组件有reset方法
        }

        this.pixelPool.push(pixel);
    }

    public returnSpriteToPool(sprite: Sprite): void {
        // 重置节点状态
        sprite.color = Color.WHITE;

        this.spritePool.push(sprite);
    }

    public usePixel(pixel: Node) {
        // pixel.active = true;
        this.usedPixels.push(pixel);
    }

    public useSprite(sprite: Sprite) {
        // sprite.active = true;
        this.usedSprites.push(sprite);
    }

    totalPixels = 0;
    finishPixels = 0;
    public loading() {
        this.totalPixels = Array.from(this.usedPixels).length;
    }
    public recyclePixel() {
        const batchSize = 30; // 每批处理30个节点

        // 取出一批节点进行处理
        const pixelbatch = this.usedPixels.splice(0, Math.min(batchSize, this.usedPixels.length));
        const spritebatch = this.usedSprites.splice(0, Math.min(batchSize, this.usedSprites.length));

        for (let sprite of spritebatch) {
            let sp = sprite.getComponent(Sprite);
            this.returnSpriteToPool(sp);
        }

        // 处理当前批次的节点
        for (let pixel of pixelbatch) {
            this.returnPixelToPool(pixel);
            this.finishPixels++;
            let process = this.finishPixels / this.totalPixels;
            // console.log("已处理" + process + "%");
            director.getScene().emit("钻石填色本_加载进度", process);
        }

        // 如果还有剩余节点需要处理，则在下一帧继续处理
        if (this.usedPixels.length > 0) {
            this.scheduleOnce(() => {
                this.recyclePixel();
            }, 0.01);
        } else {
            console.log("对象池回收完成");
            // console.log(this);
            // console.log(ZSTSB_GameMgr.instance);
            this.finishPixels = 0;
        }
    }

    preloadPixels(count: number) {
        for (let i = 0; i < count; i++) {
            const node = instantiate(this.pixelPrefab);
            this.pixelPool.push(node);
        }
    }

    getPoolSize(): number {
        return this.pixelPool.length;
    }
}


