import { _decorator, Button, Color, Component, director, EventTouch, gfx, ImageAsset, instantiate, Label, Node, ParticleSystem2D, Prefab, ScrollView, Slider, Sprite, SpriteFrame, sys, Texture2D, tween, UITransform, v3, Vec3 } from 'cc';
import { ZSTSB_Incident } from '../ZSTSB_Incident';
import { ZSTSB_AudioManager } from '../ZSTSB_AudioManager';
import { BHPD_GameData } from './BHPD_GameData';
import { BHPD_PixelPool } from './BHPD_PixelPool';
import { BHPD_Pixel } from './GameScene/BHPD_Pixel';
import { BHPD_ColorBox } from './GameScene/BHPD_ColorBox';
import { BHPD_Niezi } from './GameScene/BHPD_Niezi';
import { ZSTSB_GameData } from '../ZSTSB_GameData';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { BHPD_Iron } from './GameScene/BHPD_Iron';
import { BHPD_ScaleSlider } from './GameScene/BHPD_ScaleSlider';
const { ccclass, property } = _decorator;

@ccclass('BHPD_GameMgr')
export class BHPD_GameMgr extends Component {

    @property(Node)
    Target: Node = null;

    @property(BHPD_PixelPool)
    PixelPoolCtrl: BHPD_PixelPool = null;

    @property(Prefab)
    colorBoxPrefab: Prefab = null;

    @property(BHPD_Niezi)
    niezi: BHPD_Niezi = null;

    @property(BHPD_Iron)
    iron: BHPD_Iron = null;

    @property(Node)
    SureReturn: Node = null;

    //填涂图片资源
    targetImage: ImageAsset | null = null;

    @property(Node)
    processNode: Node = null;

    @property(Node)
    courseNode: Node = null;

    @property(ParticleSystem2D)
    particle: ParticleSystem2D = null;

    @property(Node)
    winNode: Node = null;

    public processSprite: Sprite = null;
    public processLabel: Label = null;

    public isGameOver: boolean = false;
    public isPoolInit: boolean = false;

    public curMapID: string = "";

    public curColor: Color = new Color();

    public curCircle: number = 0;
    public level: number = 0;

    public fillNodes: Node[] = [];
    public posNodes: Node[] = [];

    public AirWall: Node = null;

    public totalPixels: number = 0;

    private pixelData2D: Array<Array<{ r: number, g: number, b: number, a: number }>> = [];
    private finishData2D: Array<Array<{ r: number, g: number, b: number, a: number }>> = [];

    public static instance: BHPD_GameMgr = null;
    start() {
        BHPD_GameMgr.instance = this;
        this.AirWall = this.node.getChildByName("阻挡墙");

        if (BHPD_GameData.isText) {
            this.node.getChildByName("测试").active = true;
        }
        else {
            this.node.getChildByName("测试").active = false;
        }

        if (!BHPD_GameData.Instance.isFirst) {
            director.getScene().getChildByPath("Canvas/DIY豆豆/首次教程").active = false;
        }
        else {
            director.getScene().getChildByPath("Canvas/DIY豆豆/首次教程").active = true;
        }

        this.processSprite = this.processNode.getChildByName("进度").getComponent(Sprite);
        this.processLabel = this.processNode.getChildByName("进度百分比").getComponent(Label);
        this.processLabel.string = "0 %";
    }

    public startGame() {
        let levelName = "关卡" + this.curMapID;
        let path = "Sprites/八花拼豆/关卡/" + this.curMapID;

        ProjectEventManager.emit(ProjectEvent.游戏开始);

        ZSTSB_Incident.LoadImageAsset(path).then((imageAsset: ImageAsset) => {
            ZSTSB_Incident.LoadImageAsset(path + "完成").then((img: ImageAsset) => {
                console.log("开始加载游戏");

                this.targetImage = imageAsset;

                this.loadImage(img);

                console.log(BHPD_GameMgr.instance);
            })
        });


        // this.scheduleOnce(() => {
        //     this.AfinishFill();
        // }, 2);

    }

    onBtnClick(event: EventTouch) {


        switch (event.target.name) {
            case "教程按钮":
                this.courseNode.active = true;

                if (BHPD_GameData.Instance.isFirst) {
                    director.getScene().emit("八花拼豆_新手教程");
                }
                break;
            case "完成拼豆":
                this.AfinishFill();
                break;
            case "完成熨斗":
                this.AfinishFire();
                break;
            case "返回":
                this.showSureReturn();
                break;
            case "返回选图":
                this.closeSureReturn();
                break;
            case "取消返回":
                this.closeSureReturn();
                break;
        }
    }

    showSureReturn() {
        this.AirWall.active = true;

        ZSTSB_AudioManager.instance.playSFX("按钮");

        this.SureReturn.active = true;
        this.SureReturn.scale = v3(0, 0, 0);

        let sureBtn: Button = this.SureReturn.getChildByName("返回选图").getComponent(Button);
        let cancelBtn: Button = this.SureReturn.getChildByName("取消返回").getComponent(Button);
        sureBtn.enabled = false;
        cancelBtn.enabled = false;

        tween(this.SureReturn)
            .to(0.5, { scale: v3(1, 1, 1) }, { easing: "backOut" })
            .call(() => {
                sureBtn.enabled = true;
                cancelBtn.enabled = true;
            })
            .start();
    }

    closeSureReturn() {
        this.SureReturn.scale = v3(1, 1, 1);

        ZSTSB_AudioManager.instance.playSFX("按钮");

        let sureBtn: Button = this.SureReturn.getChildByName("返回选图").getComponent(Button);
        let cancelBtn: Button = this.SureReturn.getChildByName("取消返回").getComponent(Button);
        sureBtn.enabled = false;
        cancelBtn.enabled = false;

        tween(this.SureReturn)
            .to(0.5, { scale: v3(0, 0, 0) }, { easing: "backIn" })
            .call(() => {
                sureBtn.enabled = true;
                cancelBtn.enabled = true;
                this.SureReturn.active = false;
                this.AirWall.active = false;
            })
            .start();
    }

    updateProgress() {
        const progress = this.curPixel / (this.totalPixels * 2);
        this.processLabel.string = (progress * 100).toFixed(2) + " %";
        this.processSprite.fillRange = progress;

    }

    Win() {

        this.winNode.active = true;

        ProjectEventManager.emit(ProjectEvent.游戏结束);


        ZSTSB_AudioManager.instance.playSFX("胜利");

        ZSTSB_Incident.LoadSprite("Sprites/八花拼豆/关卡/" + this.curMapID + "最终").then((sp: SpriteFrame) => {
            let sprite = this.winNode.getChildByName("图片");
            let winSprite = sprite.getChildByName("完成图").getComponent(Sprite);
            winSprite.spriteFrame = sp;

            tween(sprite)
                .to(1, { scale: v3(1, 1, 1) })
                .call(() => {
                    this.particle.node.active = true;
                    this.particle.resetSystem();
                })
                .start();

        })


        //解锁下一关
        if (this.level < BHPD_GameData.Instance.LockArr.length) {
            BHPD_GameData.Instance.LockArr[this.level] = true;
        }

        BHPD_GameData.Instance.finifshByName(this.curMapID);

        console.log("游戏胜利");

    }

    restart() {
        // 重置基础属性
        this.curMapID = "";
        this.curColor = null;
        this.curCircle = 0;
        this.curPixel = 0;
        this.couldFire = false;
        this.isFilling = false;
        this.isCreatingPixels = false;
        this.isShow = false;
        this.totalPixels = 0;
        this.finishColorNum = 4;
        this.curIndex = 0;
        this.widthNum = 0;
        this.heightNum = 0;
        if (this.processSprite) {
            this.processSprite.fillRange = 0;
        }

        this.particle.node.active = false;
        this.particle.stopSystem();

        this.PixelPoolCtrl.loading();
        this.PixelPoolCtrl.recyclePixel();

        this.niezi.ResetPos();
        this.iron.ResetPos();

        this.winNode.active = false;
        this.winNode.getChildByName("图片").scale = v3(0, 0, 0);

        this.Target.getChildByName("图片").scale = v3(1, 1, 1);
        this.Target.getChildByName("图片").position = v3(0, 0, 0);

        let sliderTs = this.node.getChildByPath("游戏内容/放缩滑动条").getComponent(BHPD_ScaleSlider);
        sliderTs.setProgress(0);

        let colorBoxParent = this.node.getChildByPath("游戏内容/填色").getComponent(ScrollView).content;
        while (colorBoxParent.children.length > 0) {
            const node = colorBoxParent.children[0];
            node.removeFromParent();
            node.destroy();
        }

        // 重置数组和集合
        this.fillNodes.length = 0;
        this.posNodes.length = 0;
        this.colorSelect.length = 0;

        // 重置二维数组
        this.pixelData2D.length = 0;
        this.finishData2D.length = 0;

        // 重置Map对象
        this.colorIndexMap.clear();
        this.colorMap.clear();
        this.finishMap.clear();
        this.posNodeMap.clear();
        this.colorCache.clear();
        this.colorLookupMap.clear();
        this.colorFinishMap.clear();

        this.niezi.ResetPos();

        // 重置向量
        this.startPos.set(250, 0, 0);

        // 重置目标图片
        this.targetImage = null;

        BHPD_GameData.DateSave();
    }

    curPixel: number = 0;
    couldFire: boolean = false;
    onFire() {
        this.curPixel++;
        this.updateProgress();
        console.log(this.curPixel / this.totalPixels);
        if (this.curPixel / (this.totalPixels * 2) >= 1) {
            this.Win();
        }
    }

    //熨斗移动时
    onIronMove(touchPos: Vec3) {
        this.posCheck(touchPos, this.fillNodes, "IronBox");
    }

    initSelectColor() {
        let colorBoxNode = this.node.getChildByPath("游戏内容/填色")
        let colorBoxParent = colorBoxNode.getComponent(ScrollView).content;
        let arr = [0, this.posNodeMap.get(this.curIndex.toString()).length]
        this.colorIndexMap.set(this.curIndex.toString(), arr);

        for (let i = 1; i < this.colorMap.size; i++) {
            let color = this.colorMap.get(i.toString());

            let colorBox = instantiate(this.colorBoxPrefab);
            colorBox.parent = colorBoxParent;

            let colorBoxTs = colorBox.getComponent(BHPD_ColorBox);
            colorBoxTs.initData(color, i);

            let posNodes = this.posNodeMap.get(i.toString());
            let fillNum: number = 0;
            for (let x = 0; x < posNodes.length; x++) {
                let boxTs = posNodes[x].getComponent(BHPD_Pixel);
                if (boxTs.IsFilled) {
                    fillNum++;
                }
            }
            this.colorIndexMap.set(i.toString(), [fillNum, posNodes.length]);

            this.colorSelect.push(colorBox);
        }

        for (let j = 1; j <= this.colorIndexMap.size; j++) {
            let curColor = this.colorIndexMap.get(j.toString());
            this.totalPixels += curColor[1];
        }

        console.log(this.totalPixels);
        console.log(this.colorIndexMap);
        // console.log(this.fillNodes);
        // console.log(this.posNodes);
        // console.log(this.colorSelect);
    }

    isFilling: boolean = false;
    public onFill(touchPos: Vec3, arrName: string) {

        if (arrName === "ColorBox") {
            this.posCheck(touchPos, this.colorSelect, "ColorBox");
        }
        else {
            this.posNodes = this.posNodeMap.get(this.curIndex.toString());
            this.posCheck(touchPos, this.posNodes, "PixelBox");
        }
    }

    posCheck(touchPos: Vec3, arr: Node[], arrName: string, offsetX: number = 0, offsetY: number = 0) {
        let scaleX = this.Target.scale.x;
        let scaleY = this.Target.scale.y;

        if (arrName === "IronBox") {
            offsetX = 200;
            offsetY = 200;

            for (let j = 0; j < arr.length; j++) {
                let target = arr[j];
                const uiTrans = target.getComponent(UITransform);

                const scaledWidth = uiTrans.width * Math.abs(scaleX);
                const scaledHeight = uiTrans.height * Math.abs(scaleY);

                const minX = target.worldPosition.x - scaledWidth / 2;
                const minY = target.worldPosition.y - scaledHeight / 2;
                const maxX = minX + scaledWidth;
                const maxY = minY + scaledHeight;

                // 检查触摸点是否在当前节点范围内
                if (touchPos.x - offsetX / 2 < minX && touchPos.x + offsetX / 2 > maxX &&
                    touchPos.y - offsetY / 2 < minY && touchPos.y + offsetY / 2 > maxY) {
                    let boxTs = target.getComponent(BHPD_Pixel);
                    boxTs.onFire();
                    this.iron.showSteam();
                }

            }
            return;
        }

        // 遍历所有可填充节点
        for (let j = 0; j < arr.length; j++) {
            let target = arr[j];
            const uiTrans = target.getComponent(UITransform);

            const scaledWidth = uiTrans.width * Math.abs(scaleX);
            const scaledHeight = uiTrans.height * Math.abs(scaleY);

            const minX = target.worldPosition.x - scaledWidth / 2;
            const minY = target.worldPosition.y - scaledHeight / 2;
            const maxX = minX + scaledWidth;
            const maxY = minY + scaledHeight;

            // 检查触摸点是否在当前节点范围内
            if (touchPos.x - offsetX / 2 > minX && touchPos.x + offsetX / 2 < maxX &&
                touchPos.y - offsetY / 2 > minY && touchPos.y + offsetY / 2 < maxY) {
                console.log("正确位置");
                //碰到色盘
                let boxTs = null;

                switch (arrName) {
                    case "ColorBox":
                        boxTs = target.getComponent(BHPD_ColorBox);
                        if (this.niezi.isMoving) {
                            this.niezi.isFillPos = false;
                            return;
                        }

                        if (!this.niezi.isFilling && !boxTs.Finish) {
                            this.niezi.isFillPos = true;
                            this.curColor = boxTs.color;
                            this.curIndex = boxTs.colorIndex;
                            this.niezi.startFill(boxTs.color);
                        }
                        break;
                    case "PixelBox":
                        boxTs = target.getComponent(BHPD_Pixel);
                        boxTs.onFill();
                        break;
                    case "IronBox":
                        boxTs = target.getComponent(BHPD_Pixel);
                        boxTs.onFire();
                        break;
                    default:
                        break;
                }

                return;
            }

        }

        // this.niezi.isFillPos = false;

    }


    isFirst: boolean = true;
    colorIndexMap: Map<string, number[]> = new Map();
    colorSelect: Node[] = [];
    finishColorNum: number = 4;
    //实时更新当前填涂颜色的格子数量
    fillColor(index: number) {
        if (!this.isText) {
            this.niezi.onFill();
        }

        let curColor = this.colorIndexMap.get(index.toString());

        curColor[0]++;

        if (BHPD_GameData.Instance.isFirst && this.isFirst) {
            this.isFirst = false;
            director.getScene().emit("八花拼豆_新手教程");
        }

        this.curPixel++;
        this.updateProgress();

        //填充完当前颜色的所有格子后自动切换下一个颜色
        if (curColor[0] >= curColor[1]) {
            this.colorSelect[index - 1].getComponent(BHPD_ColorBox).isFinish();
            let couldFire = true;

            for (let i = 1; i <= this.colorIndexMap.size; i++) {
                let curColor = this.colorIndexMap.get(i.toString());
                if (curColor[0] < curColor[1]) {
                    couldFire = false;
                    break;
                }
            }

            if (couldFire) {
                this.couldFire = true;
                this.niezi.restart();
                return;
            }

            this.finishColorNum++;

        }
    }

    //初始位置
    startPos: Vec3 = v3(250, 0, 0);
    //像素初始尺寸
    startSize: number = 10;
    curIndex: number = 0;
    //存储当前图片所有颜色
    colorMap: Map<string, Color> = new Map();
    finishMap: Map<string, Color> = new Map();
    //当前选中填色颜色的所有节点
    posNodeMap: Map<string, Node[]> = new Map();
    //初始化图片
    async loadImage(img: ImageAsset) {
        if (this.targetImage) {
            console.log("图片存在");
        }
        else {
            console.log("图片不存在");
        }

        if (this.targetImage) {

            await this.loadImagePixelData(this.targetImage);
            // console.log('像素数据加载完成，二维数组尺寸:', this.pixelData2D.length, 'x', this.pixelData2D[0]?.length || 0);
            await this.loadImageFinishData(img);

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

            // console.error(333);
            await this.createPixel(this.Target);

            // console.log('像素数据创建完成');

            // console.log(this.posNodes);
            // console.log(this.colorMap);
        }
    }

    widthNum: number = 0;
    heightNum: number = 0;
    async loadImagePixelData(imageAsset: ImageAsset): Promise<void> {
        return new Promise((resolve, reject) => {
            // 检查运行平台
            const isHarmonyOS = (sys.os === sys.OS.OPENHARMONY);
            const isAndroid = (sys.os === sys.OS.ANDROID);

            console.log(`当前运行平台: ${sys.os}, 是否鸿蒙系统: ${isHarmonyOS}, 是否Android: ${isAndroid}`);

            const texture = new Texture2D();
            texture.image = imageAsset;

            const data = this.readPixels(texture);

            if (data) {
                console.log(data);
                const clampedData = new Uint8ClampedArray(data.buffer); // 转换为 Uint8ClampedArray
                this.convertTo2DArray(clampedData, texture.width, texture.height);
                this.widthNum = texture.width;
                this.heightNum = texture.height;

                resolve();
            }

        });
    }

    async loadImageFinishData(imageAsset: ImageAsset): Promise<void> {
        return new Promise((resolve, reject) => {

            const texture = new Texture2D();
            texture.image = imageAsset;

            const data = this.readPixels(texture);

            if (data) {
                console.log(data);
                const clampedData = new Uint8ClampedArray(data.buffer); // 转换为 Uint8ClampedArray
                this.convertFinishTo2DArray(clampedData, texture.width, texture.height);

                resolve();
            }

        });
    }

    private colorCache: Map<string, number> = new Map();
    private colorLookupMap: Map<string, number> = new Map();
    private colorFinishMap: Map<string, number> = new Map();
    // 颜色查找算法
    private findColorIndex(pixelColor: { r: number, g: number, b: number, a: number }): number {

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

        const uniqueColors = new Map<string, { r: number, g: number, b: number, a: number }>();
        const finishColors = new Map<string, { r: number, g: number, b: number, a: number }>();

        // 单次遍历收集所有颜色
        for (let i = 0; i < this.heightNum; i++) {
            for (let j = 0; j < this.widthNum; j++) {
                const pixel = this.pixelData2D[i][j];
                const key = `${pixel.r},${pixel.g},${pixel.b},${pixel.a}`;
                if (pixel.a === 0) {
                    continue;
                }

                if (!uniqueColors.has(key)) {
                    uniqueColors.set(key, { ...pixel });
                }
            }
        }

        // 单次遍历收集所有颜色
        for (let m = 0; m < this.heightNum; m++) {
            for (let n = 0; n < this.widthNum; n++) {
                const pixel = this.finishData2D[m][n];
                const key = `${pixel.r},${pixel.g},${pixel.b},${pixel.a}`;
                if (pixel.a === 0) {
                    continue;
                }

                if (!finishColors.has(key)) {
                    finishColors.set(key, { ...pixel });
                }
            }
        }

        // console.log(`发现 ${uniqueColors.size} 种不同颜色`);

        // 预热颜色缓存
        this.preWarmColorCache();
    }

    // 颜色缓存预热方法，在预扫描颜色时调用
    private preWarmColorCache() {

        this.colorLookupMap.clear();
        this.colorFinishMap.clear();

        // 将所有已有颜色添加到查找映射中
        for (let k = 0; k < this.colorMap.size; k++) {
            const color = this.colorMap.get(k.toString());
            if (color) {
                const colorKey = `${color.r},${color.g},${color.b},${color.a}`;
                this.colorLookupMap.set(colorKey, k);
            }
        }

        for (let j = 0; j < this.finishMap.size; j++) {
            const color = this.finishMap.get(j.toString());
            if (color) {
                const colorKey = `${color.r},${color.g},${color.b},${color.a}`;
                this.colorFinishMap.set(colorKey, j);
            }
        }
    }

    // private pixelCreateQueue: Array<{ i: number, j: number }> = []; // 待创建像素队列
    public isCreatingPixels: boolean = false; // 是否正在创建像素

    async createPixel(Target: Node) {
        let totalPixels = this.heightNum * this.widthNum;

        // 使用优化的批量创建方法
        await this.createPixelsOptimized(Target);

        // 完成后初始化颜色选择
        this.scheduleOnce(() => {
            this.initSelectColor();
            ZSTSB_AudioManager.instance.playBGM("游戏场景");
            // console.log(this.fillNodes.length);
        }, 0.1);

    }

    isShow: boolean = false;
    // 优化的像素创建方法
    private async createPixelsOptimized(Target: Node) {
        // console.error(444);

        const mapData = BHPD_GameData.Instance.getDataByName(this.curMapID);
        const fillArr = mapData.fillArr;

        let batchSize = 50; // 合适的批处理大小
        let totalPixels = this.heightNum * this.widthNum;

        // 预计算所有数据以减少重复计算
        let precomputedData = this.precomputeAllPixelData();

        // 按颜色分组以优化渲染合批
        let groupedByColor = this.groupPixelsByColor(precomputedData);

        let createdCount = 0;
        let progress = 0;

        // console.error(555);

        // 按颜色组依次创建像素
        for (const [colorKey, pixels] of groupedByColor) {
            for (let i = 0; i < pixels.length; i += batchSize) {
                let batch = pixels.slice(i, i + batchSize);

                // 批量创建同颜色像素
                this.createPixelBatch(Target, fillArr, batch);

                createdCount += batch.length;

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

            if (totalPixels < 3400) {
                continue;
            }

            if (totalPixels > 3400 && progress >= 0.7) {
                director.getScene().emit("钻石填色本_加载进度", 1);
                this.isShow = true;
            }

            console.log(progress);
        }
    }

    private tempVec3: Vec3 = new Vec3();
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
        const boxUITrans = this.PixelPoolCtrl.pixelPrefab.data.getComponent(UITransform);

        const startPos = this.Target.getChildByName("图片");

        // 预计算位置偏移量以减少计算次数
        const pixelWidth = boxUITrans.width;
        const pixelHeight = boxUITrans.height;
        const halfWidth = this.widthNum * pixelWidth / 2;
        const halfHeight = this.heightNum * pixelHeight / 2;

        const offsetX = startPos.position.x - halfWidth + 10;
        const offsetY = startPos.position.y - halfHeight + 10;

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
                const position = this.tempVec3.set(offsetX + j * pixelWidth, yPos, 0);

                const grayColor = this.finishData2D[i][j];

                // 查找或创建颜色索引
                colorIndex = this.findColorIndex(originalColor);
                if (colorIndex === -1 && originalColor.a !== 0) {
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
                    position: position.clone(),
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

        const groups = new Map<string, typeof precomputedData>();

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

        // 批量处理前预获取常量引用
        const fillNodes = this.fillNodes;
        const posNodeMap = this.posNodeMap;
        const pixelPoolCtrl = this.PixelPoolCtrl;

        const boxTarget = Target.getChildByName("图片");

        let colorGroup = null;

        for (let i = 0; i < batch.length; i++) {
            const data = batch[i];
            const box = pixelPoolCtrl.getPixelFromPool();

            // 直接设置属性以提高性能
            if (box.parent !== boxTarget) {
                box.setParent(boxTarget);
            }
            box.setPosition(data.position);

            // 使用数组索引而不是push以提高性能
            fillNodes[fillNodes.length] = box;

            // 初始化 Pixel 组件
            const boxTs = box.getComponent(BHPD_Pixel);
            if (boxTs) {

                if (fillArr !== null) {
                    boxTs.initData(
                        data.grayColor,
                        new Color(
                            data.originalColor.r,
                            data.originalColor.g,
                            data.originalColor.b,
                            data.originalColor.a
                        ),
                        data.colorIndex,
                        // mapData.fillArr[data.i * this.widthNum + data.j]
                        fillArr[fillNodes.length - 1]
                    );
                } else {
                    boxTs.initData(
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

            // 优化节点添加到颜色组
            colorGroup = posNodeMap.get(data.colorIndex.toString());
            if (colorGroup) {
                colorGroup[colorGroup.length] = box;
            }

            pixelPoolCtrl.usePixel(box);
        }

    }

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

    private convertFinishTo2DArray(
        pixelData: Uint8ClampedArray,
        width: number,
        height: number
    ): void {

        // 预分配整个数组以避免动态扩容
        this.finishData2D = new Array(height);

        // 使用单层循环提高效率
        for (let i = 0; i < height; i++) {
            this.finishData2D[i] = new Array(width);
            const rowOffset = i * width * 4;

            for (let j = 0; j < width; j++) {
                const pixelOffset = rowOffset + j * 4;
                this.finishData2D[i][j] = {
                    r: pixelData[pixelOffset],
                    g: pixelData[pixelOffset + 1],
                    b: pixelData[pixelOffset + 2],
                    a: pixelData[pixelOffset + 3]
                };
            }
        }
    }

    readPixels(texture: Texture2D, x = 0, y = 0, width?: number, height?: number): Uint8Array | null {
        const gfxTexture = texture.getGFXTexture();
        if (!gfxTexture) return null;

        width = width || texture.width;
        height = height || texture.height;
        const buffer = new Uint8Array(width * height * 4); // RGBA格式

        const region = new gfx.BufferTextureCopy();
        region.texExtent.width = width;
        region.texExtent.height = height;
        region.texOffset.x = x;
        region.texOffset.y = y;

        try {
            director.root?.device.copyTextureToBuffers(gfxTexture, [buffer], [region]);
            return buffer;
        } catch (error) {
            console.error("读取纹理像素失败:", error);
            return null;
        }
    }

    //测试用

    isText: boolean = false;
    //完成拼豆步骤
    AfinishFill() {
        this.isText = true;
        for (let i = 1; i < this.posNodeMap.size; i++) {
            const posNodes = this.posNodeMap.get(i.toString());
            for (let j = 0; j < posNodes.length; j++) {
                posNodes[j].getComponent(BHPD_Pixel).onTextFill();
            }
        }
        this.niezi.nextStep();

        this.isText = false;
    }

    //完成熨斗步骤
    AfinishFire() {
        this.isText = true;
        for (let i = 1; i < this.posNodeMap.size; i++) {
            const posNodes = this.posNodeMap.get(i.toString());
            for (let j = 0; j < posNodes.length; j++) {
                posNodes[j].getComponent(BHPD_Pixel).onTextFire();
            }
        }
        this.isText = false;
    }
}


