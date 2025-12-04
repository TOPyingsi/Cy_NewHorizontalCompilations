import { _decorator, Button, Color, Component, director, DynamicAtlasManager, EventTouch, gfx, ImageAsset, instantiate, Label, macro, Node, NodeEventType, ParticleSystem2D, Prefab, renderer, ScrollView, sp, Sprite, SpriteFrame, sys, Texture2D, tween, UITransform, v3, Vec3 } from 'cc';
import { ZSTSB_Pixel } from './ZSTSB_Pixel';
import { ZSTSB_Incident } from './ZSTSB_Incident';
import { ZSTSB_FillColor } from './ColorScene/ZSTSB_FillColor';
import { ZSTSB_GameData } from './ZSTSB_GameData';
import { ZSTSB_AudioManager } from './ZSTSB_AudioManager';
import { ZSTSB_PixelPool } from './ZSTSB_PixelPool';
import { ZSTSB_ParticlePool } from './ZSTSB_ParticlePool';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
const { ccclass, property } = _decorator;

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
    ControlNode: Node | null = null;

    @property(Node)
    Target: Node | null = null;

    @property(Label)
    CurModeLabel: Label = null;

    AirWall: Node = null;

    CourseNode: Node | null = null;

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

    public isPoolInit: boolean = false;
    public isFirstFill: boolean = true;
    public isUseProp: boolean = false;
    public isLock: boolean = false;

    public static instance: ZSTSB_GameMgr = null;

    private pixelData2D: Array<Array<{ r: number, g: number, b: number, a: number }>> = [];

    public start() {
        ZSTSB_GameMgr.instance = this;

        if (ZSTSB_GameData.isText) {
            this.node.getChildByName("测试").active = true;
        }
        else {
            this.node.getChildByName("测试").active = false;
        }

        if (!ZSTSB_GameData.Instance.isMapFirst) {
            director.getScene().getChildByPath("Canvas/钻石填色/首次教程").active = false;
        }
        else {
            director.getScene().getChildByPath("Canvas/钻石填色/首次教程").active = true;
        }

        this.LockBtn = this.ControlNode.getChildByName("锁定视角");
        this.winNode = this.ControlNode.getChildByName("完成");
        this.CourseNode = this.ControlNode.getChildByName("教程");
        this.AirWall = this.node.getChildByName("阻挡墙");

        ProjectEventManager.emit(ProjectEvent.游戏开始);

    }

    public startGame() {
        let levelName = "关卡" + this.curMapID;
        let path = "Sprites/关卡/" + levelName + "/" + this.curBuildingName;
        ZSTSB_Incident.LoadImageAsset(path).then((imageAsset: ImageAsset) => {
            console.log("开始加载游戏");
            this.CurModeLabel.string = "当前模式：解锁视角\n双指缩放,单指拖拽或填涂\n不可单指拖拽批量填涂";

            this.targetImage = imageAsset;
            this.AirWall.active = true;
            this.SelectColor();
            // director.getScene().emit("钻石填色本_初始化道具");

            director.getScene().emit("钻石填色本_初始化游戏");

            this.loadImage();

            director.getScene().on("钻石填色本_开始填色", (touchPos: Vec3) => {
                this.onFill(touchPos);
            }, this);

            director.getScene().on("钻石填色本_结束填色", () => {
                if (this.isTruePos) {
                    this.isTruePos = false;
                    this.useProp();
                }
            }, this);

            // console.log(ZSTSB_GameMgr.instance);
        });
    }

    SelectColor() {
        this.selectNode.parent = this.ControlNode.getChildByName("左区").getChildByName("填色").getComponent(ScrollView).view.node;
        this.selectNode.setSiblingIndex(0);
    }

    SelectProp() {
        this.selectNode.parent = this.ControlNode;
    }

    LockBtn: Node = null;
    isFirstCourse: boolean = true;
    onBtnClick(event: EventTouch) {
        ZSTSB_AudioManager.instance.playSFX("按钮");

        switch (event.target.name) {
            case "锁定视角":
                this.isLock = !this.isLock;

                if (ZSTSB_GameData.Instance.isGameFirst) {
                    director.getScene().emit("钻石填色本_新手教程");
                }
                // console.log("锁定视角:", this.isLock);
                let sprite = event.target.getComponent(Sprite);
                if (!this.isLock) {
                    sprite.color = new Color(255, 255, 255, 150);
                    UIManager.ShowTip("解锁视角");
                    this.CurModeLabel.string = "当前模式：解锁视角\n双指缩放,单指拖拽或填涂\n不可单指拖拽批量填涂";
                }
                else {
                    sprite.color = new Color(255, 255, 255, 255);
                    UIManager.ShowTip("锁定视角");
                    this.CurModeLabel.string = "当前模式：锁定视角\n双指缩放移动,单指填涂\n可单指拖拽批量填涂";
                }
                break;
            case "教程按钮":
                this.CourseNode.active = true;
                if (ZSTSB_GameData.Instance.isGameFirst && this.isFirstCourse) {
                    this.isFirstCourse = false;
                    director.getScene().emit("钻石填色本_新手教程");
                }
                break;
            case "复位":
                this.restoration();
                break;
            case "获得道具":
                director.getScene().emit("钻石填色本_获得道具", "消除当前数字索引", 20);
                break;
            case "完成当前关卡":
                this.winText();
                break;
        }
    }

    //完成当前关卡(测试用)
    winText() {
        // 检查是否有正在进行的道具使用操作
        if (this.isUsingPorp) {
            console.log("正在使用道具，无法立即通关");
            return;
        }

        // 模拟按顺序使用所有剩余颜色的道具来完成关卡
        this.useAllPropsInOrder();
    }

    /**
     * 按顺序使用所有未完成颜色的道具来完成关卡
     */
    private async useAllPropsInOrder() {
        // 创建一个待处理的颜色索引队列
        const pendingColors: number[] = [];

        // 遍历所有颜色，找出尚未完成的颜色
        for (let i = 1; i <= this.colorIndexMap.size; i++) {
            let curColor = this.colorIndexMap.get(i.toString());
            // 如果该颜色还未完全填充，则加入待处理队列
            if (curColor[0] < curColor[1]) {
                pendingColors.push(i);
            }
        }

        // 如果没有未完成的颜色，直接调用胜利方法
        if (pendingColors.length === 0) {
            this.Win();
            return;
        }

        // 按顺序处理每个颜色
        for (const colorIndex of pendingColors) {
            // 检查是否正在使用道具
            if (this.isUsingPorp) {
                // 等待当前道具使用完成
                await new Promise(resolve => {
                    const checkInterval = setInterval(() => {
                        if (!this.isUsingPorp) {
                            clearInterval(checkInterval);
                            resolve(null);
                        }
                    }, 100);
                });
            }

            // 获取该颜色的第一个未填充节点
            const posNodes = this.posNodeMap.get(colorIndex.toString());
            if (posNodes && posNodes.length > 0) {
                for (const node of posNodes) {
                    const pixelComp = node.getComponent(ZSTSB_Pixel);
                    // 找到第一个未填充的像素
                    if (pixelComp && !pixelComp.IsFilled) {
                        // 设置为道具使用模式
                        this.isUseProp = true;
                        this.propBoxTs = pixelComp;
                        this.isTruePos = true;

                        // 使用道具填充该颜色的所有像素
                        await this.useProp();
                        break;
                    }
                }
            }

            // 等待一小段时间确保道具使用完成
            await new Promise(resolve => this.scheduleOnce(resolve, 0.1));
        }

        // 所有颜色处理完成后调用胜利方法
        this.Win();
    }

    winNode: Node = null;
    Win() {
        this.fillOver();

        ZSTSB_GameData.Instance.saveBuildingData(this.curMapID, this.curBuildingName, null);
        ZSTSB_GameData.Instance.setBuildingData(this.curMapID, this.curBuildingName, true);

        ZSTSB_GameData.DateSave();

        ProjectEventManager.emit(ProjectEvent.游戏结束);

        this.scheduleOnce(() => {
            this.WinAni();
            ZSTSB_AudioManager.instance.playSFX("胜利");
        }, 0.6);
    }

    WinAni() {
        if (!ZSTSB_GameData.Instance.isFillFirst) {
            ZSTSB_GameData.Instance.isFillFirst = true;
        }

        this.winNode.active = true;

        let winSprite = this.winNode.getChildByName("图片").getChildByName("完成图").getComponent(Sprite);

        let levelName = "关卡" + ZSTSB_GameMgr.instance.curMapID;
        let path = "Sprites/关卡/" + levelName + "/" + this.curBuildingName;
        ZSTSB_Incident.LoadSprite(path).then((spriteFrame: SpriteFrame) => {
            winSprite.spriteFrame = spriteFrame;

            let maskSprite = this.winNode.getChildByPath("图片/mask").getComponent(Sprite);
            maskSprite.spriteFrame = spriteFrame;

            tween(winSprite.node.parent)
                .to(0.5, { scale: v3(1, 1, 1) })
                .call(() => {
                    this.WinEffect();
                })
                .start();
        });
    }

    WinEffect() {
        let WinEffect = this.winNode.getChildByName("WinEffect").getComponent(ParticleSystem2D);
        WinEffect.resetSystem();
    }

    StopWinEffect() {
        let WinEffect = this.winNode.getChildByName("WinEffect").getComponent(ParticleSystem2D);
        WinEffect.stopSystem();
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

    isFirstProp: boolean = true;
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

        this.AirWall.active = true;

        if (ZSTSB_GameData.Instance.isGameFirst && this.isFirstProp) {
            this.isFirstProp = false;
            director.getScene().emit("钻石填色本_新手教程");
        }

        // 减少批处理大小并增加间隔以避免卡顿
        const batchSize = 30; // 减小批处理大小
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
                this.AirWall.active = false;
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
            // console.log("当前填充颜色为：" + color + ",填充完毕");
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

        // console.log(fillArr.length);

        ZSTSB_GameData.Instance.saveBuildingData(this.curMapID, this.curBuildingName, fillArr);
        ZSTSB_GameData.DateSave();
    }

    //当前图片填充完毕
    fillOver() {
        // console.log("图片填充完毕");

        this.selectNode.active = false;
        this.selectNodeRoot = null;

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
                // console.log("切换颜色,当前颜色索引为：" + this.curColorIndex);
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

    off() {
        director.getScene().off("钻石填色本_开始填色");
        director.getScene().off("钻石填色本_结束填色");
        director.getScene().off("钻石填色本_颜色填充加一");
        director.getScene().off("钻石填色本_颜色填充完毕");
        // director.getScene().off("钻石填色本_使用道具");
        // director.getScene().off("钻石填色本_获得道具");
    }

    //重置游戏状态
    async restart() {
        await this.saveFillData();

        this.off();

        this.restoration();

        director.getScene().emit("钻石填色本_开始切换场景");
        director.getScene().emit("钻石填色本_退出游戏");

        // 分批回收像素节点避免卡顿
        this.PixelPoolCtrl.loading();
        this.PixelPoolCtrl.recyclePixel();
        this.ParticlePoolCtrl.recycleParticle();

        this.winNode.active = false;

        let winSprite = this.winNode.getChildByName("图片");
        tween(winSprite)
            .to(0.2, { scale: v3(0, 0, 0) })
            .start();

        let colorBoxParent = this.ControlNode.getChildByName("左区").getChildByName("填色").getComponent(ScrollView).content;
        while (colorBoxParent.children.length > 0) {
            const node = colorBoxParent.children[0];
            node.removeFromParent();
            node.destroy();
        }

        this.clearColorData();

        this.resetGameState();

        // 重置像素数据
        this.resetPixelData2D();
        this.pixelData2D = []

        // 清理图片资源引用
        this.cleanupImageResources();

        this.selectNodeRoot = null;

        let sprite = this.LockBtn.getComponent(Sprite);
        sprite.color = new Color(255, 255, 255, 150);

        this.unscheduleAllCallbacks(); // 取消所有调度器回调

        // console.log(ZSTSB_GameMgr.instance);
    }

    resetGameState() {
        this.isLock = false;
        this.isFirst = false;
        this.isShow = false;
        this.isUseProp = false;
        this.isUsingPorp = false;
        this.isTruePos = false;
        this.isCamMove = false;

        this.finishColorNum = 4;
        this.curIndex = 0;
        this.curColorIndex = 1;

        this.curColor = new Color(255, 255, 255, 255);
        this.curBuildingName = "";
    }

    clearColorData() {
        // 清理所有颜色相关Map
        if (this.colorMap) this.colorMap.clear();
        if (this.posNodeMap) this.posNodeMap.clear();
        if (this.colorIndexMap) this.colorIndexMap.clear();
        if (this.colorLookupMap) this.colorLookupMap.clear();
        if (this.colorCache) this.colorCache.clear();
    }

    cleanupImageResources() {
        // 清理目标图像引用
        if (this.targetImage) {
            // 注意：ImageAsset通常由引擎管理，不需要手动销毁
            this.targetImage = null;
        }

        // 清理节点引用
        if (this.fillNodes) {
            this.fillNodes.length = 0;
            this.fillNodes = null;
            this.fillNodes = [];
        }

        if (this.posNodes) {
            this.posNodes.length = 0;
            this.posNodes = null;
            this.posNodes = [];
        }

        if (this.colorSelect) {
            this.colorSelect.length = 0;
            this.colorSelect = null;
            this.colorSelect = [];
        }
    }

    colorIndexMap: Map<string, number[]> = new Map();
    colorSelect: Node[] = [];
    //初始化左侧颜色选择
    initSelectColor() {
        this.selectNode.active = true;

        let showNum = ZSTSB_GameData.getShowNumByName(this.curBuildingName);
        this.finishColorNum = showNum - 1;

        let colorBoxNode = this.ControlNode.getChildByName("左区").getChildByName("填色");
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

        if (ZSTSB_GameData.Instance.isGameFirst) {
            //选择颜料
            colorBoxParent.children[0].once(NodeEventType.TOUCH_END, () => {
                director.getScene().emit("钻石填色本_新手教程");
            }, this);

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

        console.log(this.colorMap);

        // 设置当前颜色并切换到该颜色的节点
        let color = this.colorMap.get(this.curColorIndex.toString());
        // this.curColor = color;
        this.SwitchColorNodes(color);


        this.scheduleOnce(() => {
            tween(this.Target)
                .to(0.5, { scale: v3(6, 6, 6) })
                .call(() => {
                    this.AirWall.active = false;
                })
                .start();

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
            console.log("图片存在");
        }
        else {
            console.log("图片不存在");
        }

        if (this.targetImage) {

            await this.loadImagePixelData(this.targetImage);
            // console.log('像素数据加载完成，二维数组尺寸:', this.pixelData2D.length, 'x', this.pixelData2D[0]?.length || 0);

            let offsetX = this.Target.position.x - this.widthNum * this.startSize / 2;
            let offsetY = this.Target.position.y - this.heightNum * this.startSize / 2 - 50;
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

    private colorCache: Map<string, number> = new Map();
    private colorLookupMap: Map<string, number> = new Map();
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

        // console.log(`发现 ${uniqueColors.size} 种不同颜色`);

        // 预热颜色缓存
        this.preWarmColorCache();
    }

    // 颜色缓存预热方法，在预扫描颜色时调用
    private preWarmColorCache() {

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
            // console.log(this.fillNodes.length);
        }, 0.1);

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
        // console.error(444);

        const mapData = ZSTSB_GameData.Instance.getMapDataByName(this.curMapID, this.curBuildingName);
        const fillArr = ZSTSB_GameData.Instance.getBuildingData(this.curMapID, this.curBuildingName);

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
                const position = this.tempVec3.set(offsetX + j * pixelWidth, yPos, 0);

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
                        fillArr[fillNodes.length - 1]
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

            // const img = new Image();

            // img.src = imageAsset.nativeUrl;

            // img.onload = () => {
            //     try {
            //         const canvas = document.createElement('canvas');
            //         canvas.width = img.width;
            //         canvas.height = img.height;

            //         const ctx = canvas.getContext('2d');
            //         if (!ctx) {
            //             reject(new Error('无法获取canvas 2D上下文'));
            //             return;
            //         }

            //         // 绘制图像
            //         ctx.drawImage(img, 0, 0);
            //         // 获取图像数据
            //         const imageData = ctx.getImageData(0, 0, img.width, img.height);
            //         const data = imageData.data;

            //         console.log(data);

            //         this.convertTo2DArray(data, img.width, img.height);
            //         this.widthNum = img.width;
            //         this.heightNum = img.height;

            //         // 清理资源
            //         ctx.clearRect(0, 0, canvas.width, canvas.height);
            //         // canvas.remove();

            //         resolve();
            //     } catch (error) {
            //         reject(error);
            //     } finally {
            //         // 清理图像引用
            //         img.onload = null;
            //         img.onerror = null;
            //     }
            // };

            // img.onerror = () => {
            //     img.onload = null;
            //     img.onerror = null;
            //     reject(new Error('图片加载失败'));
            // };

        });
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

    private convertTo2DArray(
        pixelData: Uint8ClampedArray,
        width: number,
        height: number
    ): void {
        console.log(33333);

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

    // 重用像素数据数组
    private resetPixelData2D() {
        // 更彻底地清理二维数组
        if (this.pixelData2D) {
            for (let i = 0; i < this.pixelData2D.length; i++) {
                if (this.pixelData2D[i]) {
                    // 清空每一行
                    this.pixelData2D[i].length = 0;
                }
            }
            // 清空主数组
            this.pixelData2D.length = 0;
        }

        // 设置为null以便垃圾回收
        this.pixelData2D = null;
    }

    printPixelDataSample(sampleWidth: number = 5, sampleHeight: number = 5): void {
        // console.log('像素数据采样 (前' + sampleWidth + 'x' + sampleHeight + '像素):');
        for (let y = 0; y < Math.min(sampleHeight, this.pixelData2D.length); y++) {
            let rowStr = '行 ' + y + ': ';
            for (let x = 0; x < Math.min(sampleWidth, this.pixelData2D[y].length); x++) {
                const pixel = this.pixelData2D[y][x];
                rowStr += `RGBA(${pixel.r},${pixel.g},${pixel.b},${pixel.a}) `;
            }
            // console.log(rowStr);
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