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
        ZSTSB_GameMgr.instance.isPoolInit = true;
    }

    async CreatePixels(num: number) {
        const batchSize = 50; // 增大批处理数量
        const interval = 0.05;    // 可以考虑完全移除延迟或使用 requestAnimationFrame
        const effectTarget = ZSTSB_GameMgr.instance.Target.getChildByName("特效");
        const spriteTarget = ZSTSB_GameMgr.instance.Target.getChildByName("图片");
        let curNum: number = 0;

        for (let i = 0; i < num; i += batchSize) {
            const currentBatchSize = Math.min(batchSize, num - i);

            // 使用数组预分配优化
            const pixels: Node[] = new Array(currentBatchSize);
            const sprites: Sprite[] = new Array(currentBatchSize);

            for (let j = 0; j < currentBatchSize; j++) {
                const pixel = instantiate(this.pixelPrefab);
                const spriteNode = instantiate(this.spritePrefab);

                pixel.setParent(effectTarget);
                spriteNode.setParent(spriteTarget);

                pixels[j] = pixel;
                sprites[j] = spriteNode.getComponent(Sprite);

                curNum++;
                let process = curNum / num;
                director.getScene().emit("钻石填色本_加载进度", process);
            }

            // 批量添加到对象池
            this.pixelPool.push(...pixels);
            this.spritePool.push(...sprites);

            // 使用更高效的延迟方式
            if (i + batchSize < num) {
                await new Promise(resolve => setTimeout(resolve, interval));
            }
        }

        // console.log(`对象池初始化完成，总共创建 ${num} 个像素节点`);
    }

    // 添加获取对象池节点的方法
    public getPixelFromPool(): Node {
        if (this.pixelPool.length > 0) {
            return this.pixelPool.pop();
        } else {
            const pixel = instantiate(this.pixelPrefab);
            // 预先获取组件并缓存
            const pixelComponent = pixel.getComponent(ZSTSB_Pixel);
            if (pixelComponent) {
                this.pixelComponentCache.set(pixel, pixelComponent);
            }
            return pixel;
        }
    }

    public getSpriteFromPool(): Sprite {
        if (this.spritePool.length > 0) {
            return this.spritePool.pop();
        } else {
            return instantiate(this.spritePrefab).getComponent(Sprite);
        }
    }

    private pixelComponentCache: WeakMap<Node, ZSTSB_Pixel> = new WeakMap();

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
        const batchSize = 50; // 增大批处理数量
        const effectTarget = ZSTSB_GameMgr.instance.Target.getChildByName("特效");
        const spriteTarget = ZSTSB_GameMgr.instance.Target.getChildByName("图片");
        const maxPoolSize = 5500; // 控制对象池最大容量
        const processBatch = () => {
            // 批量处理
            // const pixelBatch = this.usedPixels.splice(0, Math.min(batchSize, this.usedPixels.length));
            // const spriteBatch = this.usedSprites.splice(0, Math.min(batchSize, this.usedSprites.length));

            const pixelBatch = this.usedPixels.splice(0, Math.min(batchSize, this.usedPixels.length));
            const spriteBatch = this.usedSprites.splice(0, Math.min(batchSize, this.usedSprites.length));

            console.log(this.usedPixels);
            // 批量重置像素
            for (let i = 0; i < pixelBatch.length; i++) {
                const pixel = pixelBatch[i];
                pixel.position = v3(0, 0, 0);

                const pixelComponent = pixel.getComponent(ZSTSB_Pixel);
                if (pixelComponent) {
                    pixelComponent.reset();
                }
            }

            // 批量重置精灵
            for (let i = 0; i < spriteBatch.length; i++) {
                const sprite = spriteBatch[i];
                sprite.color = Color.WHITE;
            }

            // 控制对象池大小，避免无限增长
            if (this.pixelPool.length < maxPoolSize) {
                const availableSpace = maxPoolSize - this.pixelPool.length;
                const pixelsToAdd = Math.min(pixelBatch.length, availableSpace);
                this.pixelPool.push(...pixelBatch.slice(0, pixelsToAdd));

                const spritesToAdd = Math.min(spriteBatch.length, availableSpace);
                this.spritePool.push(...spriteBatch.slice(0, spritesToAdd));

                // 销毁超出对象池容量的对象
                for (let i = pixelsToAdd; i < pixelBatch.length; i++) {
                    pixelBatch[i].destroy();
                }
                for (let i = spritesToAdd; i < spriteBatch.length; i++) {
                    spriteBatch[i].node.destroy();
                }
            } else {
                // 对象池已满，直接销毁所有回收的对象
                for (let i = 0; i < pixelBatch.length; i++) {
                    pixelBatch[i].destroy();
                }
                for (let i = 0; i < spriteBatch.length; i++) {
                    spriteBatch[i].node.destroy();
                }
            }

            this.finishPixels += Math.min(pixelBatch.length, maxPoolSize);

            if (this.totalPixels > 0) {
                const process = this.finishPixels / this.totalPixels;
                director.getScene().emit("钻石填色本_加载进度", process);
            }

            // 如果还有剩余节点，安排下一批处理
            if (this.usedPixels.length > 0 || this.usedSprites.length > 0) {
                // 使用 setTimeout 而不是 scheduleOnce 以获得更精确的控制
                setTimeout(processBatch, 0);
            } else {
                console.log("对象池回收完成");
                this.finishPixels = 0;
                console.log(effectTarget.children.length);
                // console.log(this);
                // console.log(this.pixelPool.length);
                // console.log(this.spritePool.length);

            }

            // // 批量返回对象池
            // this.pixelPool.push(...pixelBatch);
            // this.spritePool.push(...spriteBatch);

            // this.finishPixels += pixelBatch.length;

            // if (this.totalPixels > 0) {
            //     const process = this.finishPixels / this.totalPixels;
            //     director.getScene().emit("钻石填色本_加载进度", process);
            // }

            // // 如果还有剩余节点，安排下一批处理
            // if (this.usedPixels.length > 0 || this.usedSprites.length > 0) {
            //     // 使用 setTimeout 而不是 scheduleOnce 以获得更精确的控制
            //     setTimeout(processBatch, 0);
            // } else {
            //     console.log("对象池回收完成");

            //     for (let i = 3400; i < this.pixelPool.length; i++) {
            //         effectTarget.children[i - 1].destroy();
            //         spriteTarget.children[i - 1].destroy();
            //     }

            //     if (this.totalPixels > 3400) {
            //         this.spritePool.length = 3400;
            //         this.pixelPool.length = 3400;
            //     }

            //     this.finishPixels = 0;

            //     console.log(this);
            // }
        };

        processBatch();
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


