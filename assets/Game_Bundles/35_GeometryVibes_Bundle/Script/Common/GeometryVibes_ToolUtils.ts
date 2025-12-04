import { _decorator, Component, Node, Rect, SpriteFrame, Texture2D } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GeometryVibes_ToolUtils')
export class GeometryVibes_ToolUtils {
  /**
     * 将传入的图片按指定行列数分割
     * @param {Texture2D} texture 需要分割的SpriteFrame
     * @param {number} rowCount 行数
     * @param {number} colCount 列数
     * @returns {SpriteFrame[]} 返回分割后的SpriteFrame数组
     */
    static splitImage(texture: Texture2D, rowCount = 4, colCount = 4): SpriteFrame[] {
        // 获取图片的Texture对象
        const width = texture.width;
        const height = texture.height;

        // 计算每个帧图像的宽度和高度
        const frameWidth = width / colCount;
        const frameHeight = height / rowCount;

        // 存储生成的SpriteFrame数组
        const spriteFrames: SpriteFrame[] = [];

        // 循环生成每一帧的SpriteFrame
        for (let row = 0; row < rowCount; row++) {
            for (let col = 0; col < colCount; col++) {
                // 计算每个小图的矩形区域位置
                const x = col * frameWidth;
                const y = (rowCount - 1 - row) * frameHeight; // 因为Cocos的Y轴向下，可能需要倒序

                // 创建SpriteFrame
                const rect = new Rect(x, y, frameWidth, frameHeight);
                const spriteFrame = new SpriteFrame();
                spriteFrame.texture = texture;
                spriteFrame.rect = rect;  // 替换弃用的setRect方法

                spriteFrames.push(spriteFrame);
            }
        }

        return spriteFrames;
    }

}


