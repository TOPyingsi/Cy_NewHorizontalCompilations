import { _decorator, Color, Component, director, DynamicAtlasManager, dynamicAtlasManager, EventTouch, ImageAsset, instantiate, macro, Node, ParticleSystem2D, Prefab, ScrollView, Sprite, SpriteFrame, Texture2D, tween, UITransform, v3, Vec3 } from 'cc';
import { ZSTSB_Pixel } from './ZSTSB_Pixel';
import { ZSTSB_Incident } from './ZSTSB_Incident';
import { ZSTSB_FillColor } from './ColorScene/ZSTSB_FillColor';
import { ZSTSB_GameData } from './ZSTSB_GameData';
import { ZSTSB_AudioManager } from './ZSTSB_AudioManager';
import { ZSTSB_PixelPool } from './ZSTSB_PixelPool';
import { ZSTSB_ParticlePool } from './ZSTSB_ParticlePool';
const { ccclass, property } = _decorator;

macro.CLEANUP_IMAGE_CACHE = false;
DynamicAtlasManager.instance.enabled = true;

@ccclass('ZSTSB_GameMgr')
export class ZSTSB_GameMgr extends Component {

    @property(ZSTSB_PixelPool)
    PixelPoolCtrl: ZSTSB_PixelPool = null;

    @property(ZSTSB_ParticlePool)
    ParticlePoolCtrl: ZSTSB_ParticlePool = null;

    @property(Prefab)
    colorBoxPrefab: Prefab | null = null;

    @property(Node)
    selectNode: Node | null = null;

    @property(Node)
    CourseNode: Node | null = null;

    @property(Node)
    ControlNode: Node | null = null;

    @property(Node)
    Target: Node | null = null;

    selectNodeRoot: Node | null = null;

    //填涂图片资源
    targetImage: ImageAsset | null = null;

    startPos: Vec3 = v3(250, 0, 0);

    public curMapID: number = 0;
    public curBuildingName: string = "";

    //当前选中的颜色
    public curColor: Color = new Color(211, 249, 188, 255);
    public curColorIndex: number = 1;
    public preColorIndex: number = -1;

    public fillNodes: Node[] = [];
    public posNodes: Node[] = [];

    public isUseProp: boolean = false;
    public isLock: boolean = false;

    public static instance: ZSTSB_GameMgr = null;

    private pixelData2D: Array<Array<{ r: number, g: number, b: number, a: number }>> = [];

    public start() {
        ZSTSB_GameMgr.instance = this;

        this.LockBtn = this.ControlNode.getChildByName("锁定视角");
        this.winNode = this.ControlNode.getChildByName("完成");

        director.getScene().on("钻石填色本_开始填色", (touchPos: Vec3) => {
            this.onFill(touchPos);
        }, this);

        director.getScene().on("钻石填色本_结束填色", () => {
            if (this.isTruePos) {
                this.isTruePos = false;
                this.useProp();
            }
        }, this);

    }

    public startGame() {
        let levelName = "关卡" + this.curMapID;
        let path = "Sprites/关卡/" + levelName + "/" + this.curBuildingName;
        ZSTSB_Incident.LoadImageAsset(path).then((imageAsset: ImageAsset) => {
            this.targetImage = imageAsset;
            this.loadImage();
        });
    }

    SelectColor() {
        this.selectNode.parent = this.ControlNode.getChildByName("填色").getComponent(ScrollView).view.node;
        this.selectNode.setSiblingIndex(0);
    }

    SelectProp() {
        this.selectNode.parent = this.ControlNode;
    }

    LockBtn: Node = null;
    onBtnClick(event: EventTouch) {
        ZSTSB_AudioManager.instance.playSFX("按钮");

        switch (event.target.name) {
            case "锁定视角":
                this.isLock = !this.isLock;
                console.log("锁定视角:", this.isLock);
                let sprite = event.target.getComponent(Sprite);
                if (!this.isLock) { sprite.color = new Color(255, 255, 255, 150); }
                else { sprite.color = new Color(255, 255, 255, 255); }
                break;
            case "教程按钮":
                this.CourseNode.active = true;
                break;
            case "复位":
                this.restoration();
                break;
            case "道具":

                break;
        }
    }

    winNode: Node = null;
    Win() {
        this.fillOver();

        this.selectNode.active = false;
        this.selectNodeRoot = null;

        this.scheduleOnce(() => {
            this.WinAni();
            ZSTSB_AudioManager.instance.playSFX("胜利");
        }, 0.6);
    }

    WinAni() {
        this.winNode.active = true;

        let winSprite = this.winNode.getChildByName("图片").getChildByName("完成图").getComponent(Sprite);
        let WinEffect = this.winNode.getChildByName("WinEffect").getComponent(ParticleSystem2D);

        let levelName = "关卡" + ZSTSB_GameMgr.instance.curMapID;
        let path = "Sprites/关卡/" + levelName + "/" + this.curBuildingName;
        ZSTSB_Incident.LoadSprite(path).then((spriteFrame: SpriteFrame) => {
            winSprite.spriteFrame = spriteFrame;
            tween(winSprite.node.parent)
                .to(0.5, { scale: v3(1, 1, 1) })
                .call(() => {
                    WinEffect.resetSystem();
                })
                .start();
        });
    }

    public onFill(touchPos: Vec3) {

        if (this.isUseProp) {
            this.posCheck(this.Target, touchPos, this.fillNodes);
        }
        else {
            this.posCheck(this.Target, touchPos, this.posNodes);
        }

    }

    posCheck(Target: Node, touchPos: Vec3, arr: Node[]) {
        const scaleX = Target.scale.x;
        const scaleY = Target.scale.y;
        // 遍历所有可填充节点
        for (let j = 0; j < arr.length; j++) {
            let target = arr[j];
            const uiTrans = target.getComponent(UITransform);

            // 计算目标节点的边界框（考虑缩放）
            const halfWidth = uiTrans.width * scaleX / 2;
            const halfHeight = uiTrans.height * scaleY / 2;

            const minX = target.worldPosition.x - halfWidth;
            const minY = target.worldPosition.y - halfHeight;
            const maxX = minX + uiTrans.width * scaleX;
            const maxY = minY + uiTrans.height * scaleY;

            // 检查触摸点是否在当前节点范围内
            if (touchPos.x > minX && touchPos.x < maxX &&
                touchPos.y > minY && touchPos.y < maxY) {
                const boxTs = target.getComponent(ZSTSB_Pixel);

                if (this.isUseProp) {
                    this.propBoxTs = boxTs;
                    if (this.propBoxTs?.ColorIndex === 0) {
                        this.propBoxTs = null;
                        this.isTruePos = false;
                        break;
                    }
                    this.isTruePos = true;
                } else {
                    // 触发填充逻辑
                    boxTs.onFill();
                }

                // 找到目标节点后立即退出循环
                break;
            }
        }
    }

    isTruePos: boolean = false;
    isUsingPorp: boolean = false;
    propBoxTs: ZSTSB_Pixel = null;
    propName: string = "";
    async useProp() {
        if (this.propBoxTs && !this.propBoxTs.getLabelActive()) {
            return;
        }

        if (this.isUsingPorp) {
            return;
        }

        if (this.propBoxTs?.ColorIndex === 0) {
            this.isUsingPorp = false;
            return;
        }

        let index = this.propBoxTs?.ColorIndex?.toString();
        //  判断颜色是否已经全部填涂
        let colorIndexArr = this.colorIndexMap.get(index);
        if (colorIndexArr[0] === colorIndexArr[1]) {
            return;
        }

        let curPosNode = this.posNodeMap.get(index);
        this.isUsingPorp = true;

        // 减少批处理大小并增加间隔以避免卡顿
        const batchSize = 20; // 减小批处理大小
        const interval = 0.05; // 增加间隔时间

        for (let i = 0; i < curPosNode.length; i += batchSize) {
            // 获取当前批次的节点
            const batch = curPosNode.slice(i, i + batchSize);

            // 处理当前批次
            for (let box of batch) {
                let boxTs = box.getComponent(ZSTSB_Pixel);
                if (!boxTs.IsFilled) {
                    boxTs.onPropFill();
                }
            }

            ZSTSB_AudioManager.instance.playSFX("填涂");

            // 如果还有下一批，等待更长时间避免卡顿
            if (i + batchSize < curPosNode.length) {
                await new Promise(resolve => this.scheduleOnce(resolve, interval));
            }
            else {
                director.getScene().emit("钻石填色本_使用道具", this.propName);
                this.propBoxTs = null;
                this.isUsingPorp = false;
            }
        }


    }

    finishColorNum: number = 4;
    //实时更新当前填涂颜色的格子数量
    fillColor(index: number) {

        let curColor = this.colorIndexMap.get(index.toString());

        curColor[0]++;

        //填充完当前颜色的所有格子后自动切换下一个颜色
        if (curColor[0] >= curColor[1]) {
            let isWin = true;

            director.getScene().emit("钻石填色本_颜色填充完毕", index);
            for (let i = 1; i <= this.colorIndexMap.size; i++) {
                let curColor = this.colorIndexMap.get(i.toString());
                if (curColor[0] < curColor[1]) {
                    isWin = false;
                    this.curColorIndex = i;

                    break;
                }
            }

            if (isWin) {
                this.Win();
                return;
            }

            this.ParticlePoolCtrl.recycleParticle();
            this.finishColorNum++;
            director.getScene().emit("钻石填色本_颜色填充加一", this.finishColorNum);
            this.SelectColor();

            let color = this.colorMap.get(this.curColorIndex.toString());
            console.log("当前填充颜色为：" + color + ",填充完毕");
            // console.log(curColor);
            this.SwitchColorNodes(color);
        }
    }

    //粒子特效
    ParticleEffect(pos: Vec3, color: Color) {
        let particle = this.ParticlePoolCtrl.getParticleFromPool();
        particle.node.active = true;
        particle.node.setWorldPosition(pos);

        particle.startColor = color;
        particle.endColor = color;

        particle.resetSystem();

    }

    async saveFillData() {
        let fillArr: boolean[] = [];

        // 直接遍历 fillNodes 数组，避免重复计算索引
        for (let i = 0; i < this.fillNodes.length; i++) {
            const box = this.fillNodes[i];
            const boxTs = box.getComponent(ZSTSB_Pixel);

            // 优化颜色判断逻辑，使用解构赋值提高可读性
            const { r, g, b, a } = boxTs.sprite.color;

            // 判断是否为非透明像素
            if (r !== 0 || g !== 0 || b !== 0 || a !== 0) {
                fillArr.push(boxTs.IsFilled);
            }
            // 如果是透明像素，默认认为已填充（根据注释推测）
            else {
                fillArr.push(true);
            }
        }

        console.log(fillArr.length);

        ZSTSB_GameData.Instance.saveBuildingData(this.curMapID, this.curBuildingName, fillArr);
        ZSTSB_GameData.DateSave();
    }

    // async saveFillData() {
    //     let fillArr: boolean[] = [];
    //     console.log("共有" + this.heightNum * this.widthNum);
    //     console.log(this.fillNodes.length);

    //     for (let i = 0; i < this.heightNum; i++) {
    //         for (let j = 0; j < this.widthNum; j++) {
    //             let box = this.fillNodes[i * this.widthNum + j];
    //             let boxTs = box.getComponent(ZSTSB_Pixel);
    //             //boxTs.sprite.color.r !== 0 && boxTs.sprite.color.g !== 0 && boxTs.sprite.color.b !== 0 && 
    //             if (boxTs.sprite.color.r !== 0 && boxTs.sprite.color.g !== 0 && boxTs.sprite.color.b !== 0 && boxTs.sprite.color.a !== 0) {
    //                 if (boxTs.IsFilled) {
    //                     fillArr.push(true);
    //                 }
    //                 else {
    //                     fillArr.push(false);
    //                 }
    //             }
    //             // else {
    //             //     fillArr.push(true);
    //             // }
    //         }
    //     }

    //     console.log(fillArr);

    //     ZSTSB_GameData.Instance.saveBuildingData(this.curMapID, this.curBuildingName, fillArr);

    //     ZSTSB_GameData.DateSave();

    //     // console.log(ZSTSB_GameData.Instance.mapData);
    // }

    //当前图片填充完毕
    fillOver() {
        console.log("图片填充完毕");
        let mapData = ZSTSB_GameData.Instance.getMapDataByName(this.curMapID, this.curBuildingName);
        mapData.State = true;
        ZSTSB_GameData.DateSave();

        console.log(ZSTSB_GameData.Instance.mapData);

        this.restoration();
    }

    //更换填充颜色指向的节点数组
    SwitchColorNodes(color: Color) {
        this.isUseProp = false;

        this.curColor = color;

        for (let x = 0; x < this.colorMap.size; x++) {
            let color = this.colorMap.get(x.toString());
            if (color.r === 0 && color.g === 0 && color.b === 0 && color.a === 0) {
                continue;
            }

            if (this.curColor.r === color.r
                && this.curColor.g === color.g
                && this.curColor.b === color.b
                && this.curColor.a === color.a) {
                this.posNodes = this.posNodeMap.get(x.toString());

                this.preColorIndex = this.curColorIndex;
                this.curColorIndex = x;
                this.selectNodeRoot = this.colorSelect[x - 1];
                console.log("切换颜色,当前颜色索引为：" + this.curColorIndex);
                break;
            }
        }

        if (this.preColorIndex === this.curColorIndex) {
            this.SearchColor();
        }
    }

    isCamMove: boolean = false;
    curBox: Node = null;
    SearchColor() {
        if (this.isCamMove) {
            return;
        }

        // 考虑Target的缩放比例来计算正确的居中位置
        const targetScale = this.Target.scale;

        for (let box of this.posNodes) {
            let boxTs = box.getComponent(ZSTSB_Pixel);
            if (!boxTs.IsFilled) {
                this.curBox = box;

                // 获取第一个节点的世界坐标
                const localPos = box.position;

                // 计算需要移动的目标位置，使第一个节点居中
                const targetPos = v3(
                    -localPos.x * targetScale.x,
                    -localPos.y * targetScale.y,
                    this.Target.position.z
                );

                this.isCamMove = true;
                // 使用缓动动画移动 Target 节点
                tween(this.Target)
                    .to(0.5, { position: targetPos })
                    .call(() => {
                        this.isCamMove = false;
                    })
                    .start();

                return;
            }
        }
    }

    //复位
    restoration() {

        tween(this.Target)
            .to(0.5, { scale: v3(1, 1, 1), position: v3(0, 0, 0) })
            .start();
    }

    //重置游戏状态
    async restart() {
        await this.saveFillData();
        this.restoration();

        director.getScene().emit("钻石填色本_开始切换场景");

        // 分批回收像素节点避免卡顿
        this.PixelPoolCtrl.loading();
        this.PixelPoolCtrl.recyclePixel();

        this.winNode.active = false;

        let winSprite = this.winNode.getChildByName("图片");
        tween(winSprite)
            .to(0.2, { scale: v3(0, 0, 0) })
            .start();

        let colorBoxParent = this.ControlNode.getChildByName("填色").getComponent(ScrollView).content;
        colorBoxParent.children.forEach(node => {
            node.destroy();
        });

        this.isLock = false;
        this.isFirst = false;
        this.isShow = false;
        this.colorMap.clear();
        this.posNodeMap.clear();
        this.colorIndexMap.clear();
        this.colorLookupMap.clear();

        this.posNodes = [];
        this.fillNodes = [];
        this.colorSelect = [];
        this.finishColorNum = 4;

        this.curIndex = 0;
        this.curColorIndex = 1;

        this.curColor = new Color(255, 255, 255, 255);
        this.curBuildingName = "";
        this.selectNodeRoot = null;

        let sprite = this.LockBtn.getComponent(Sprite);
        sprite.color = new Color(255, 255, 255, 150);

        console.log(ZSTSB_GameMgr.instance);
    }

    colorIndexMap: Map<string, number[]> = new Map();
    colorSelect: Node[] = [];
    //初始化左侧颜色选择
    initSelectColor() {
        this.selectNode.active = true;

        if (this.curBuildingName === "2-31"
            || this.curBuildingName === "2-8"
            || this.curBuildingName === "2-81"
            || this.curBuildingName === "2-9"
            || this.curBuildingName === "2-10"
            || this.curBuildingName === "2-101") {
            this.finishColorNum = 2;
        }
        else {
            this.finishColorNum = 4;
        }

        let colorBoxNode = this.ControlNode.getChildByName("填色");
        let colorBoxParent = colorBoxNode.getComponent(ScrollView).content;
        let arr = [0, this.posNodeMap.get(this.curIndex.toString()).length]
        this.colorIndexMap.set(this.curIndex.toString(), arr);

        for (let i = 1; i < this.colorMap.size; i++) {
            let color = this.colorMap.get(i.toString());
            let colorBox = instantiate(this.colorBoxPrefab);
            colorBox.parent = colorBoxParent;

            if (i === (this.curIndex + 1)) {
                this.selectNodeRoot = colorBox;
            }

            let colorBoxTs = colorBox.getComponent(ZSTSB_FillColor);
            colorBoxTs.initData(color, i);

            let posNodes = this.posNodeMap.get(i.toString());
            let fillNum: number = 0;
            for (let x = 0; x < posNodes.length; x++) {
                let boxTs = posNodes[x].getComponent(ZSTSB_Pixel);
                if (boxTs.IsFilled) {
                    fillNum++;
                }
            }
            this.colorIndexMap.set(i.toString(), [fillNum, posNodes.length]);

            this.colorSelect.push(colorBox);
        }



        // console.log(this.colorIndexMap);

        /**
  * 检查每个颜色组的填充状态并更新当前颜色
  * 该函数遍历所有颜色组，统计每个组内已填充的节点数量，
  * 当某个颜色组完全填充时发出相应事件，
  * 并根据颜色索引映射查找下一个需要填充的颜色
  */
        for (let j = 1; j < this.colorMap.size; j++) {
            // 获取当前颜色组的所有节点
            let posNodes = this.posNodeMap.get(j.toString());
            let fillNum: number = 0;

            // 统计当前颜色组内已填充的节点数量
            // for (let y = 0; y < posNodes.length; y++) {
            //     let boxTs = posNodes[y].getComponent(ZSTSB_Pixel);
            //     if (boxTs.IsFilled) {
            //         fillNum++;
            //     }
            // }

            for (let y = 0; y < posNodes.length; y++) {
                const boxTs = posNodes[y].getComponent(ZSTSB_Pixel);
                if (boxTs.IsFilled) {
                    fillNum++;
                }
            }

            // 如果当前颜色组完全填充，则发出填充完成事件
            if (fillNum >= posNodes.length) {
                director.getScene().emit("钻石填色本_颜色填充完毕", j);
                this.finishColorNum++;
                director.getScene().emit("钻石填色本_颜色填充加一", this.finishColorNum);

                // 查找下一个需要填充的颜色索引
                for (let i = 1; i < this.colorIndexMap.size; i++) {
                    let curColor = this.colorIndexMap.get(i.toString());
                    if (curColor[0] < curColor[1]) {
                        this.curColorIndex = i;
                        break;
                    }
                }
            }
        }

        this.ParticlePoolCtrl.recycleParticle();
        if (!this.isFirst) {
            this.isFirst = true;
            this.finishColorNum++;
            director.getScene().emit("钻石填色本_颜色填充加一", this.finishColorNum);
        }

        // 设置当前颜色并切换到该颜色的节点
        let color = this.colorMap.get(this.curColorIndex.toString());
        // this.curColor = color;
        this.SwitchColorNodes(color);


        this.scheduleOnce(() => {
            tween(this.Target)
                .to(0.5, { scale: v3(4, 4, 4) })
                .start();

            if (ZSTSB_GameData.Instance.isGameFirst) {
                this.CourseNode.active = true;
                ZSTSB_GameData.Instance.isGameFirst = false;
            }

        }, 0.5);
    }

    isFirst: boolean = false;

    //像素初始尺寸
    startSize: number = 10;
    curIndex: number = 0;
    //存储当前图片所有颜色
    colorMap: Map<string, Color> = new Map();
    //当前选中填色颜色的所有节点
    posNodeMap: Map<string, Node[]> = new Map();

    //初始化图片
    async loadImage() {

        if (this.targetImage) {

            await this.loadImagePixelData(this.targetImage);
            console.log('像素数据加载完成，二维数组尺寸:', this.pixelData2D.length, 'x', this.pixelData2D[0]?.length || 0);

            let offsetX = this.Target.position.x - this.widthNum * this.startSize / 2;
            let offsetY = this.Target.position.y - this.heightNum * this.startSize / 2;
            this.startPos = v3(offsetX, offsetY, 0);

            // 清空之前的缓存
            this.colorCache.clear();

            // 预扫描所有颜色并建立索引
            this.preScanColors();

            //初始化空颜色
            this.colorMap.set(this.curIndex.toString(), new Color(0, 0, 0, 0));
            this.posNodeMap.set(this.curIndex.toString(), []);
            this.curIndex++;

            await this.createPixel(this.Target);

            console.log('像素数据创建完成');

            // console.log(this.posNodes);
            console.log(this.colorMap);
        }
    }

    private colorCache: Map<string, number> = new Map();
    private colorLookupMap: Map<string, number> = new Map();
    // 颜色查找算法
    private findColorIndex(pixelColor: { r: number, g: number, b: number, a: number }): number {
        // // 创建颜色的唯一标识符

        // const colorKey = `${pixelColor.r},${pixelColor.g},${pixelColor.b},${pixelColor.a}`;

        // // 先检查缓存
        // if (this.colorCache.has(colorKey)) {
        //     return this.colorCache.get(colorKey)!;
        // }

        // // 如果没有缓存，则查找或创建新颜色
        // for (let k = 0; k < this.colorMap.size; k++) {
        //     let color = this.colorMap.get(k.toString());
        //     if (pixelColor.r === color.r &&
        //         pixelColor.g === color.g &&
        //         pixelColor.b === color.b &&
        //         pixelColor.a === color.a) {
        //         this.colorCache.set(colorKey, k);
        //         return k;
        //     }
        // }

        // // 未找到匹配颜色，返回-1表示需要新增颜色
        // return -1;

        const colorKey = `${pixelColor.r},${pixelColor.g},${pixelColor.b},${pixelColor.a}`;

        // 直接从缓存查找
        const cachedIndex = this.colorLookupMap.get(colorKey);
        if (cachedIndex !== undefined) {
            return cachedIndex;
        }

        // 在现有颜色中查找
        for (let k = 0; k < this.colorMap.size; k++) {
            const color = this.colorMap.get(k.toString());
            if (color &&
                pixelColor.r === color.r &&
                pixelColor.g === color.g &&
                pixelColor.b === color.b &&
                pixelColor.a === color.a) {
                this.colorLookupMap.set(colorKey, k);
                return k;
            }
        }

        // 未找到匹配颜色
        return -1;
    }

    // 预扫描所有颜色
    private preScanColors() {
        // const uniqueColors = new Map<string, { r: number, g: number, b: number, a: number }>();

        // for (let i = 0; i < this.heightNum; i++) {
        //     for (let j = 0; j < this.widthNum; j++) {
        //         const pixel = this.pixelData2D[i][j];
        //         const key = `${pixel.r},${pixel.g},${pixel.b},${pixel.a}`;

        //         if (!uniqueColors.has(key)) {
        //             uniqueColors.set(key, { ...pixel });
        //         }
        //     }
        // }

        // console.log(`发现 ${uniqueColors.size} 种不同颜色`);

        const uniqueColors = new Map<string, { r: number, g: number, b: number, a: number }>();

        // 单次遍历收集所有颜色
        for (let i = 0; i < this.heightNum; i++) {
            for (let j = 0; j < this.widthNum; j++) {
                const pixel = this.pixelData2D[i][j];
                const key = `${pixel.r},${pixel.g},${pixel.b},${pixel.a}`;

                if (!uniqueColors.has(key)) {
                    uniqueColors.set(key, { ...pixel });
                }
            }
        }

        console.log(`发现 ${uniqueColors.size} 种不同颜色`);

        // 预热颜色缓存
        this.preWarmColorCache();
    }

    // 颜色缓存预热方法，在预扫描颜色时调用
    private preWarmColorCache() {
        // // 预先将所有颜色添加到缓存中
        // for (let k = 0; k < this.colorMap.size; k++) {
        //     let color = this.colorMap.get(k.toString());
        //     const colorKey = `${color.r},${color.g},${color.b},${color.a}`;
        //     this.colorCache.set(colorKey, k);
        // }

        this.colorLookupMap.clear();

        // 将所有已有颜色添加到查找映射中
        for (let k = 0; k < this.colorMap.size; k++) {
            const color = this.colorMap.get(k.toString());
            if (color) {
                const colorKey = `${color.r},${color.g},${color.b},${color.a}`;
                this.colorLookupMap.set(colorKey, k);
            }
        }
    }

    // private pixelCreateQueue: Array<{ i: number, j: number }> = []; // 待创建像素队列
    public isCreatingPixels: boolean = false; // 是否正在创建像素

    async createPixel(Target: Node) {
        let totalPixels = this.heightNum * this.widthNum;

        // 预加载对象池以满足需求
        this.preloadPixelPool(totalPixels);

        // 使用优化的批量创建方法
        await this.createPixelsOptimized(Target);

        // 完成后初始化颜色选择
        this.scheduleOnce(() => {
            this.initSelectColor();
            ZSTSB_AudioManager.instance.playBGM("游戏场景");
            console.log(this.fillNodes.length);
        }, 0.1);

        this.scheduleOnce(() => {

        }, 0.7);

    }

    // 预加载对象池
    private preloadPixelPool(count: number) {
        const currentCount = this.PixelPoolCtrl.getPoolSize();
        if (currentCount < count) {
            this.PixelPoolCtrl.preloadPixels(count - currentCount);
        }
    }

    isShow: boolean = false;
    // 优化的像素创建方法
    private async createPixelsOptimized(Target: Node) {
        let mapData = ZSTSB_GameData.Instance.getMapDataByName(this.curMapID, this.curBuildingName);

        let batchSize = 50; // 合适的批处理大小
        let totalPixels = this.heightNum * this.widthNum;

        // 预计算所有数据以减少重复计算
        let precomputedData = this.precomputeAllPixelData();

        // 按颜色分组以优化渲染合批
        let groupedByColor = this.groupPixelsByColor(precomputedData);

        let createdCount = 0;
        let progress = 0;

        // 按颜色组依次创建像素
        for (const [colorKey, pixels] of groupedByColor) {
            for (let i = 0; i < pixels.length; i += batchSize) {
                let batch = pixels.slice(i, i + batchSize);

                // 批量创建同颜色像素
                this.createPixelBatch(Target, mapData.fillArr, batch);

                createdCount += batch.length;

                // progress = createdCount / totalPixels;
                // director.getScene().emit("钻石填色本_加载进度", progress);

                // 更新进度
                if (!this.isShow) {
                    progress = createdCount / totalPixels;
                    director.getScene().emit("钻石填色本_加载进度", progress);
                }

                // 让出控制权避免卡顿
                if (i + batchSize < pixels.length) {
                    await new Promise(resolve => this.scheduleOnce(resolve, 0));
                }
            }

            if (totalPixels < 3000) {
                continue;
            }

            if (totalPixels > 3000 && progress >= 0.6) {
                director.getScene().emit("钻石填色本_加载进度", 1);
                this.isShow = true;
            }

        }
    }

    // 预计算所有像素数据
    private precomputeAllPixelData(): Array<{
        i: number,
        j: number,
        position: Vec3,
        grayColor: { r: number, g: number, b: number, a: number },
        originalColor: { r: number, g: number, b: number, a: number },
        colorIndex: number
    }> {

        const result: ReturnType<typeof this.precomputeAllPixelData> = [];
        const boxUITrans = this.PixelPoolCtrl.spritePrefab.data.getComponent(UITransform);

        // 预计算位置偏移量以减少计算次数
        const pixelWidth = boxUITrans.width;
        const pixelHeight = boxUITrans.height;
        const halfWidth = this.widthNum * pixelWidth / 2;
        const halfHeight = this.heightNum * pixelHeight / 2;

        const offsetX = this.Target.position.x - halfWidth;
        const offsetY = this.Target.position.y - halfHeight;

        // 预先分配数组大小以提高性能
        result.length = this.heightNum * this.widthNum;
        let colorIndex = 0;
        let originalColor = null;
        let index = 0;
        for (let i = 0; i < this.heightNum; i++) {
            const yPos = -(offsetY + i * pixelHeight);
            for (let j = 0; j < this.widthNum; j++) {
                originalColor = this.pixelData2D[i][j];

                // 计算位置
                const position = new Vec3(offsetX + j * pixelWidth, yPos, 0);

                // 灰度处理 - 使用更高效的计算方式并缓存常用值
                const gray = (originalColor.r * 77 + originalColor.g * 150 + originalColor.b * 29) >> 8;
                const grayColor = {
                    r: gray,
                    g: gray,
                    b: gray,
                    a: originalColor.a
                };

                // 查找或创建颜色索引
                colorIndex = this.findColorIndex(originalColor);
                if (colorIndex === -1) {
                    colorIndex = this.colorMap.size;
                    this.colorMap.set(colorIndex.toString(),
                        new Color(originalColor.r, originalColor.g, originalColor.b, originalColor.a));
                    this.posNodeMap.set(colorIndex.toString(), []);
                    // 更新颜色查找缓存
                    const colorKey = originalColor.r + "," + originalColor.g + "," + originalColor.b + "," + originalColor.a;
                    this.colorLookupMap.set(colorKey, colorIndex);
                }

                result[index] = {
                    i,
                    j,
                    position,
                    grayColor,
                    originalColor,
                    colorIndex
                };

                index++;
            }
        }

        return result;
    }

    // 按颜色分组像素数据
    private groupPixelsByColor(precomputedData: ReturnType<typeof this.precomputeAllPixelData>): Map<string, typeof precomputedData> {
        // const groups = new Map<string, typeof precomputedData>();

        // for (const data of precomputedData) {
        //     const colorKey = `${data.grayColor.r},${data.grayColor.g},${data.grayColor.b},${data.grayColor.a}`;
        //     if (!groups.has(colorKey)) {
        //         groups.set(colorKey, []);
        //     }
        //     groups.get(colorKey)!.push(data);
        // }

        // return groups;

        const groups = new Map<string, typeof precomputedData>();

        // 预先估计分组数量以优化Map性能
        const estimatedGroups = Math.min(100, Math.ceil(precomputedData.length / 10));

        // 通过一次遍历完成分组，避免多次查找
        for (let i = 0; i < precomputedData.length; i++) {
            const data = precomputedData[i];
            const colorKey = data.grayColor.r + "," + data.grayColor.g + "," + data.grayColor.b + "," + data.grayColor.a;

            let group = groups.get(colorKey);
            if (!group) {
                group = [];
                groups.set(colorKey, group);
            }
            group.push(data);
        }

        return groups;
    }

    // 批量创建像素
    private createPixelBatch(Target: Node, fillArr: boolean[], batch: ReturnType<typeof this.precomputeAllPixelData>) {
        //     const box = this.PixelPoolCtrl.getPixelFromPool();

        //     box.parent = Target;
        //     box.position = data.position;

        //     const boxSprite = box.getChildByName("图片")?.getComponent(Sprite);
        //     if (boxSprite) {
        //         boxSprite.color = new Color(
        //             data.grayColor.r,
        //             data.grayColor.g,
        //             data.grayColor.b,
        //             data.grayColor.a
        //         );
        //     }

        //     this.fillNodes.push(box);

        //     // 初始化 Pixel 组件
        //     const boxTs = box.getComponent(ZSTSB_Pixel);
        //     const mapData = ZSTSB_GameData.Instance.getMapDataByName(this.curMapID, this.curBuildingName);

        //     if (mapData.fillArr !== null) {
        //         boxTs?.initData(
        //             new Color(
        //                 data.originalColor.r,
        //                 data.originalColor.g,
        //                 data.originalColor.b,
        //                 data.originalColor.a
        //             ),
        //             data.colorIndex,
        //             mapData.fillArr[data.i * this.widthNum + data.j]
        //         );
        //     } else {
        //         boxTs?.initData(
        //             new Color(
        //                 data.originalColor.r,
        //                 data.originalColor.g,
        //                 data.originalColor.b,
        //                 data.originalColor.a
        //             ),
        //             data.colorIndex
        //         );
        //     }

        //     this.posNodeMap.get(data.colorIndex.toString())?.push(box);
        //     this.PixelPoolCtrl.usePixel(box);
        // }

        // 预先获取常用组件引用以减少重复查询
        // const targetChildren = Target.children;
        // const targetChildrenLength = targetChildren.length;

        // for (const data of batch) {
        //     const box = this.PixelPoolCtrl.getPixelFromPool();

        //     // 优化节点添加方式
        //     box.parent = Target;
        //     box.position = data.position;

        //     // 优化组件获取和颜色设置
        //     const imageNode = box.getChildByName("图片");
        //     if (imageNode) {
        //         const sprite = imageNode.getComponent(Sprite);
        //         if (sprite) {
        //             sprite.color = new Color(
        //                 data.grayColor.r,
        //                 data.grayColor.g,
        //                 data.grayColor.b,
        //                 data.grayColor.a
        //             );
        //         }
        //     }

        //     this.fillNodes.push(box);

        //     // 初始化 Pixel 组件
        //     const boxTs = box.getComponent(ZSTSB_Pixel);
        //     const mapData = ZSTSB_GameData.Instance.getMapDataByName(this.curMapID, this.curBuildingName);

        //     if (mapData.fillArr !== null) {
        //         boxTs?.initData(
        //             new Color(
        //                 data.originalColor.r,
        //                 data.originalColor.g,
        //                 data.originalColor.b,
        //                 data.originalColor.a
        //             ),
        //             data.colorIndex,
        //             mapData.fillArr[data.i * this.widthNum + data.j]
        //         );
        //     } else {
        //         boxTs?.initData(
        //             new Color(
        //                 data.originalColor.r,
        //                 data.originalColor.g,
        //                 data.originalColor.b,
        //                 data.originalColor.a
        //             ),
        //             data.colorIndex
        //         );
        //     }

        //     // 优化节点添加到颜色组
        //     const colorGroup = this.posNodeMap.get(data.colorIndex.toString());
        //     if (colorGroup) {
        //         colorGroup.push(box);
        //     }

        //     this.PixelPoolCtrl.usePixel(box);
        // }

        // 批量处理前预获取常用引用
        const fillNodes = this.fillNodes;
        const posNodeMap = this.posNodeMap;
        const pixelPoolCtrl = this.PixelPoolCtrl;

        const boxTarget = Target.getChildByName("特效");
        const spriteTarget = Target.getChildByName("图片");

        let colorGroup = null;

        for (let i = 0; i < batch.length; i++) {
            const data = batch[i];
            const box = pixelPoolCtrl.getPixelFromPool();
            let sprite = pixelPoolCtrl.getSpriteFromPool();

            // 直接设置属性以提高性能
            if (sprite.node.parent !== spriteTarget) {
                sprite.node.setParent(spriteTarget);
            }
            sprite.node.setPosition(data.position);

            // 直接设置属性以提高性能
            if (box.parent !== boxTarget) {
                box.setParent(boxTarget);
            }
            box.setPosition(data.position);

            // 使用数组索引而不是push以提高性能
            fillNodes[fillNodes.length] = box;

            // 初始化 Pixel 组件
            const boxTs = box.getComponent(ZSTSB_Pixel);
            if (boxTs) {

                if (fillArr !== null) {
                    boxTs.initData(
                        sprite,
                        data.grayColor,
                        new Color(
                            data.originalColor.r,
                            data.originalColor.g,
                            data.originalColor.b,
                            data.originalColor.a
                        ),
                        data.colorIndex,
                        // mapData.fillArr[data.i * this.widthNum + data.j]
                        fillArr[fillNodes.length]
                    );
                } else {
                    boxTs.initData(
                        sprite,
                        data.grayColor,
                        new Color(
                            data.originalColor.r,
                            data.originalColor.g,
                            data.originalColor.b,
                            data.originalColor.a
                        ),
                        data.colorIndex
                    );
                }
            }

            // // 优化组件获取和颜色设置
            // if (sprite && data?.grayColor) {
            //     sprite.color.set(data.grayColor.r, data.grayColor.g, data.grayColor.b, data.grayColor.a);
            // }

            // sprite.node. position = data.position;

            // 优化节点添加到颜色组
            colorGroup = posNodeMap.get(data.colorIndex.toString());
            if (colorGroup) {
                colorGroup[colorGroup.length] = box;
            }

            pixelPoolCtrl.usePixel(box);
            pixelPoolCtrl.useSprite(sprite);
        }

    }

    widthNum: number = 0;
    heightNum: number = 0;
    async loadImagePixelData(imageAsset: ImageAsset): Promise<void> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('无法获取canvas 2D上下文'));
                    return;
                }

                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, img.width, img.height);
                const data = imageData.data;

                this.convertTo2DArray(data, img.width, img.height);
                this.widthNum = img.width;
                this.heightNum = img.height;
                resolve();
            };

            img.onerror = () => {
                reject(new Error('图片加载失败'));
            };

            img.src = imageAsset.nativeUrl;
        });
    }

    //将图片转化为二维数组
    private convertTo2DArray(
        pixelData: Uint8ClampedArray,
        width: number,
        height: number
    ): void {

        // 预分配整个数组以避免动态扩容
        this.pixelData2D = new Array(height);

        // 使用单层循环提高效率
        for (let i = 0; i < height; i++) {
            this.pixelData2D[i] = new Array(width);
            const rowOffset = i * width * 4;

            for (let j = 0; j < width; j++) {
                const pixelOffset = rowOffset + j * 4;
                this.pixelData2D[i][j] = {
                    r: pixelData[pixelOffset],
                    g: pixelData[pixelOffset + 1],
                    b: pixelData[pixelOffset + 2],
                    a: pixelData[pixelOffset + 3]
                };
            }
        }
    }

    getPixelColor(x: number, y: number): { r: number, g: number, b: number, a: number } | null {
        if (y >= 0 && y < this.pixelData2D.length &&
            x >= 0 && x < this.pixelData2D[y].length) {
            return this.pixelData2D[y][x];
        }
        return null;
    }

    getPixelData2D(): Array<Array<{ r: number, g: number, b: number, a: number }>> {
        return this.pixelData2D;
    }

    printPixelDataSample(sampleWidth: number = 5, sampleHeight: number = 5): void {
        console.log('像素数据采样 (前' + sampleWidth + 'x' + sampleHeight + '像素):');
        for (let y = 0; y < Math.min(sampleHeight, this.pixelData2D.length); y++) {
            let rowStr = '行 ' + y + ': ';
            for (let x = 0; x < Math.min(sampleWidth, this.pixelData2D[y].length); x++) {
                const pixel = this.pixelData2D[y][x];
                rowStr += `RGBA(${pixel.r},${pixel.g},${pixel.b},${pixel.a}) `;
            }
            console.log(rowStr);
        }
    }

    // private sendProgressEvent() {
    //     const total = this.heightNum * this.widthNum;
    //     const created = total - this.pixelCreateQueue.length;
    //     const progress = created / total;
    //     director.getScene().emit("钻石填色本_加载进度", progress);
    // }

    // timer: number = 0;
    // maxLoadTime: number = 2;

    protected update(dt: number): void {
        if (this.selectNodeRoot) {
            this.selectNode.worldPosition = this.selectNodeRoot.worldPosition;
        }

    }
}