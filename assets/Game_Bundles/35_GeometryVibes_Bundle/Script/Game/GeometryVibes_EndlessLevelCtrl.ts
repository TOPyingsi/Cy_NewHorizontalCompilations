// assets/Scripts/Level/EndlessLevelController.ts
import { _decorator, Component, Node, Prefab, instantiate, Vec3, math, PolygonCollider2D, UITransform, v3 } from 'cc';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { GeometryVibes_DataManager, GeometryVibes_ItemType, GeometryVibes_LevelData, GeometryVibes_PlaneStyle, GeometryVibes_ShopItemConfig } from '../Manager/GeometryVibes_DataManager';
import { GeometryVibes_PlaneController } from './GeometryVibes_PlaneController';
import { GeometryVibes_CameraFollowCtrl } from './GeometryVibes_CameraFollowCtrl';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { GeometryVibes_UIManager } from '../Manager/GeometryVibes_UIManager';
import { GeometryVibes_AudioManager } from '../Manager/GeometryVibes_AudioManager';
import Banner from 'db://assets/Scripts/Banner';
const { ccclass, property } = _decorator;

type LiveSegment = {
  /** 场景中的段节点 */
  node: Node;
  /** 段左端的世界 X（拼接起点） */
  startX: number;
  /** 段右端的世界 X（= startX + length） */
  endX: number;
  /** 段的元数据 */
  checkpoints: Vec3[];
  /** 段资源 key（便于调试/回收策略） */
  key: string;

  planePos?:Vec3;

  portalPos?:Vec3;
};

@ccclass('GeometryVibes_EndlessLevelCtrl')
export class GeometryVibes_EndlessLevelCtrl extends Component {
    //   @property({ tooltip: '承载所有段节点的根节点（静态坐标系）' })
    //   segmentsRoot: Node = null!;

    @property({type:Node, tooltip: '玩家节点（飞机）' })
    gameCamera: Node = null!;

    @property({ tooltip: '保持的段数量（奇数）：3/5/7 …' })
    keepCount: number = 5;

    // @property({ tooltip: '单位换算：1 引擎单位 = 多少米' })
    metersPerUnit: number = 0.01;

    private _plane: Node = null;
    private onComplete: Function= null;
    private _cameraInitPos: Vec3 = null;

    private startSegmentKey = 'Game/Obstacle/level_1/obstacle_start';

    /** 用于随机的段列表（相对 bundle 内路径） */
    private _segmentKeys: string[] = [
        'Game/Obstacle/level_1/obstacle_1',
        'Game/Obstacle/level_1/obstacle_2',
        'Game/Obstacle/level_1/obstacle_3',
        'Game/Obstacle/level_1/obstacle_4',
        'Game/Obstacle/level_1/obstacle_5',
        'Game/Obstacle/level_1/obstacle_6',
        'Game/Obstacle/level_1/obstacle_7',
        'Game/Obstacle/level_2/obstacle_1',
        'Game/Obstacle/level_2/obstacle_2',
        'Game/Obstacle/level_2/obstacle_3',
        'Game/Obstacle/level_2/obstacle_4',
        'Game/Obstacle/level_3/obstacle_1',
        'Game/Obstacle/level_3/obstacle_2',
        'Game/Obstacle/level_3/obstacle_3',
        'Game/Obstacle/level_3/obstacle_4',



        // 'Game/Obstacle/level_1/obstacle_3',
        // 'Game/Obstacle/level_2/obstacle_1',
        // 'Game/Obstacle/level_2/obstacle_2',
        // 'Game/Obstacle/level_2/obstacle_3',
        // 'Game/Obstacle/level_3/obstacle_1',
        // 'Game/Obstacle/level_3/obstacle_2',
        // 'Game/Obstacle/level_3/obstacle_3',
    ];

    /** 分包名 */
    private _bundle = 'segments';

    private _planePrefab = null;

    // 运行时状态
    private _lives: LiveSegment[] = [];
    private _currentIndex = 0;      // 玩家所处的段索引（_live 中的索引并不等于全局序号）
    private _globalHeadX = 0;       // 世界 0 段的开始 X（用于计算总里程的基准）
    private _nextSpawnX = 0;        // 下一段应当放置的 startX
    private _totalMeters = 0;       // 已走总米数（实时更新）
    private _lastPassedCheckpointWorld: Vec3 | null = null; // 最近已通过的复活点
    private _half = 1;

    private currentSpawnSegmentCount = 0;
    private destoryCount = 0;

    onLoad() {
        this.keepCount = Math.max(3, this.keepCount | 0);
        if (this.keepCount % 2 === 0) this.keepCount += 1; // 强制奇数
        this._half = Math.floor(this.keepCount / 2);
    }

    destroyGame(onComplete: Function) {
        this.destoryCount = this.currentSpawnSegmentCount;
        this.gameCamera.getComponent(GeometryVibes_CameraFollowCtrl).unbindNode();
        this.gameCamera.setWorldPosition(this._cameraInitPos);
        this._lives.forEach((live)=>{
            live.node.destroy();
        })
        this._lives = [];
        // this.node.getChildByName("EndlessLayer").children.forEach((node:Node)=>{
        //     node.destroy();
        // })
        if(GeometryVibes_DataManager.getInstance().isMusicEnabled()){
            // GeometryVibes_AudioManager.StopLoopAudio(`Endless Mode`);
            // GeometryVibes_AudioManager.getInstance().stopMusic();
        }
        if(this._plane){
            this._plane.getComponent(GeometryVibes_PlaneController).cleanup();
            this._plane.getComponent(GeometryVibes_PlaneController).destroy();
            this._plane.destroy();
            this._plane = null;
        }
        onComplete();
    }

    /** 外部调用：开始无尽模式 */
    public startGame(onComplete: Function) {
        this.onComplete = onComplete;
        this._cameraInitPos = new Vec3(this.gameCamera.worldPosition.x, this.gameCamera.worldPosition.y, this.gameCamera.worldPosition.z);

        this.resetState();

        GeometryVibes_DataManager.getInstance().setCurrrentTotalMeters(0);

        // 先生成首段（可指定 key）
        const firstKey = this.startSegmentKey ?? this.pickRandomKey();
        if(Banner.IS_ANDROID){
            console.log("安卓偏移");
            this._nextSpawnX = 400;
        }
      
        this.spawnSegment(firstKey, this._nextSpawnX, (live) => {
        if(GeometryVibes_DataManager.getInstance().isMusicEnabled()){
            // GeometryVibes_AudioManager.playLoopAudio(`Endless Mode`);
            GeometryVibes_AudioManager.getInstance().playMusic(`Endless Mode`);
        }
        this._lives.push(live);
        this._nextSpawnX = live.node.getChildByName("endPos").getWorldPosition().clone().x ;
        this._globalHeadX =live.startX /* live.planePos.x */;
        //console.log("nextSpawnX",this._nextSpawnX);


        // 再提前生成“下一段”（保证 rule：下一段已就绪）
        const k2 = this.pickRandomKey();
        this.spawnSegment(k2, this._nextSpawnX, (live2) => {
            this._lives.push(live2);

            
            this.initPlane(false,live.planePos,()=>{
                this.gameCamera.getComponent(GeometryVibes_CameraFollowCtrl).bindNode(this._plane);
                this.onComplete();
            });
        });
        });
    }

    public revivalGame(onComplete: Function){
        
        // 找到比飞机位置小的最近复活点
        // let closestRevivalPos = this.getRespawnPoint();
        // //console.log("closestRevivalPos",closestRevivalPos);

        let checkpoints:Vec3[] = [];
        // 只需要检查窗口内“到当前段为止”的所有段
        for (let i = 0; i <= this._currentIndex; i++) {
            const seg = this._lives[i];
            checkpoints.push(...seg.checkpoints);
        }

        //console.log("checkpoints",checkpoints);

        // const levelData = GeometryVibes_DataManager.getInstance().getCurrentLevelData();
        const planePos = this._plane.worldPosition;
        // //console.log("revivalPos",levelData.totalRevivalPoses);

        // 找到比飞机位置小的最近复活点
        let closestRevivalPos = checkpoints
            .filter(pos => pos.x < planePos.x)
            .reduce((prev, curr) => 
                (curr.x > prev.x) ? curr : prev, 
                new Vec3(-Infinity, 0, 0)
            );
            //console.log("closestRevivalPos",closestRevivalPos);

        this._totalMeters = Math.round((closestRevivalPos.x - this._globalHeadX) * this.metersPerUnit);
        GeometryVibes_DataManager.getInstance().setCurrrentTotalMeters(this._totalMeters);

        // 设置飞机位置
        this.initPlane(true,closestRevivalPos,
            ()=>{
                this.gameCamera.getComponent(GeometryVibes_CameraFollowCtrl).resetFollow(this._plane);
                onComplete();
        });
    }


    private initPlane(isRevival:boolean,startWorPos:Vec3,onComplete:Function) {
        // 加载飞机预制体并应用外观配置
        if(this._plane){
            this._plane.destroy();
         }
        let planePath = 'Game/plane';

        const selectedPlaneId = GeometryVibes_DataManager.getInstance().getSelectedItemIdByType(GeometryVibes_ItemType.PLANE);
        const planeConfig = this.shopItemsConfig.find(item => item.id === selectedPlaneId);
        
        if (planeConfig) {
            switch(planeConfig.style){
                case GeometryVibes_PlaneStyle.Square:
                    planePath = 'Game/plane/plane_2';
                    break;
                case GeometryVibes_PlaneStyle.Circle:
                    planePath = 'Game/plane/plane_3';
                    break;
                default:
                    planePath = 'Game/plane/plane_1';
                    break;
            }
        }

         let createPlane = (prefab)=>{
            this._plane = instantiate(prefab);
            this.node.addChild(this._plane);
            this._plane.setWorldPosition(startWorPos);
            
            //console.log("this._plane", this._plane.worldPosition);

            // 应用飞机样式配置
            const controller = this._plane.getComponent(GeometryVibes_PlaneController);
            controller.init(()=>{
                onComplete();
            });
         }

         if(isRevival){
            if(this._planePrefab){
                createPlane(this._planePrefab);
            }
         }else{
            BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, planePath).then((prefab: Prefab) =>  {
                this._planePrefab = prefab;
                createPlane(this._planePrefab);
            });
         }

 
        // BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, planePath).then((prefab: Prefab) =>  {
        //     this._plane = instantiate(prefab);
        //     this.node.addChild(this._plane);
        //     // const startY = this._plane.worldPosition.y;

        //     this._plane.setWorldPosition(startWorPos/* new Vec3(live.startX + 2, startY, 0) */);
        //     this._globalHeadX = startWorPos.x;

        //     // 应用飞机样式配置
        //     const controller = this._plane.getComponent(GeometryVibes_PlaneController);

        //     controller.init(()=>{
        //         onComplete();
        //     });
        // });
    }

    private resetState() {
        // 清空运行中的段
        for (const s of this._lives) s.node.destroy();
        this._lives.length = 0;
        this._currentIndex = 0;
        this._globalHeadX = 0;
        this._nextSpawnX = 0;
        this._totalMeters = 0;
        this._lastPassedCheckpointWorld = null;
    }

    update() {
        if (!this._plane) return;
        if (this._lives.length === 0) return;
        if (GeometryVibes_DataManager.getInstance().getIsPaused()) return;
        if(!this._plane.worldPosition)return;
        const px = this._plane.worldPosition.x;

        // 1）定位“玩家处于哪个段”
        // 注意：_live 仅保存 keepCount 内的窗口；用 startX/endX 判定
        let cur = this._currentIndex;
        while (cur < this._lives.length && px >= this._lives[cur].node.getChildByName("endPos").getWorldPosition().clone().x) cur++;
        while (cur >= 0 && px < this._lives[cur].startX) cur--;
            cur = math.clamp(cur, 0, this._lives.length - 1);
            if (cur !== this._currentIndex) {
            this._currentIndex = cur;
            // 玩家刚进入一个新段 -> 确保“下一段”已经生成；“下下段”不生成
            this.tryAdvanceWindow();
        }

        // 2）刷新最近已通过的复活点（处于当前段及其之前）
        // this.updateNearestPassedCheckpoint(px);

        // 3）更新里程（相对无尽起点）
        this._totalMeters = Math.round((px - this._globalHeadX) * this.metersPerUnit);
        GeometryVibes_DataManager.getInstance().setCurrrentTotalMeters(this._totalMeters);
    }

    /** 当进入新段时：保证窗口内有（前 half，当前，后 half）；多余的前段回收 */
    private tryAdvanceWindow() {
        // 需要的“最远后端索引”（相对 _live[0]）
        const needRearIndex = this._currentIndex + this._half;

        // 如果后面不够：生成直到够为止（但一次仅生成 1 段即可满足“下下段不生成”）
        if (needRearIndex > this._lives.length - 1) {
        const key = this.pickRandomKey();
        
        this.spawnSegment(key, this._nextSpawnX, (live) => {
            this._lives.push(live);
            // this._nextSpawnX = live.node.getChildByName("endPos").getWorldPosition().clone().x;
        //console.log("nextSpawnX",this._nextSpawnX);

            // 回收过多的前面段：只保留前 half 段
            while (this._currentIndex - this._half > 0) {
                const removed = this._lives.shift()!;
                removed.node.destroy();
                this._currentIndex--; // 窗口左移后，当前索引也跟着左移
            }

            // 如果仍超过 keepCount，继续回收最前端
            while (this._lives.length > this.keepCount) {
                const removed = this._lives.shift()!;
                removed.node.destroy();
                this._currentIndex--;
            }
            // // 更新当前关卡数据中的复活点，只保留当前段、前一段和后一段的复活点
            // this.updateLevelRevivalPoints();
            // //console.log(this._live.length)
        });
        } else {
        // 后方已满足；只需尝试回收更老的前段
        while (this._currentIndex - this._half > 0) {
            const removed = this._lives.shift()!;
            removed.node.destroy();
            this._currentIndex--;
        }
        }
    }

    /** 异步生成一段，把它拼接到 startX 位置 */
    private spawnSegment(key: string, startX: number, done: (s: LiveSegment)=>void) {
        this.currentSpawnSegmentCount++;
        BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle,  key).then((prefab: Prefab) => {
        this.currentSpawnSegmentCount--;

        if(this.destoryCount!== 0){
            this.destoryCount--;
            return;
        }

            const node = instantiate(prefab);
            // // debugger;;
            node.setWorldPosition(v3(this._nextSpawnX, 0, 0)); // 约定 y=0
            //console.log("apawn",this._nextSpawnX);
            this._nextSpawnX = node.getChildByName("endPos").getWorldPosition().clone().x;
            //console.log("位置"+node.getWorldPosition());
            this.node.getChildByName("EndlessLayer").addChild(node);
        // //console.log("Start1"+startX);
            // 替换原有的 SegmentMeta 解析方式
            const meta = this.parseSegmentMeta(node); // 使用新函数解析
            const endPosNode = node.getChildByName("endPos")!;
            // const endX = startX + meta.length;
            const endX = endPosNode.worldPosition.clone().x;

        //console.log("Start2"+endX);

            done({
                node, startX:node.getChildByName("startPos").worldPosition.clone().x, endX, checkpoints:meta.checkpoints, key, planePos:meta.planePos
            });
        });
    }

    /**
     * 解析路障节点结构，生成 SegmentMeta 格式的数据
     * @param segmentNode 路障节点（包含 startPos、endPos 和 resurrectionPoses 子节点）
     * @returns 返回 { length, checkpoints } 结构的数据
     */
    private parseSegmentMeta(segmentNode: Node): { length: number; checkpoints: Vec3[] ,planePos?:Vec3} {
        // 1. 计算长度（endPos.x - startPos.x）
        const startPosNode = segmentNode.getChildByName("startPos")!;
        const endPosNode = segmentNode.getChildByName("endPos")!;
        const length = endPosNode.worldPosition.clone().x - startPosNode.worldPosition.clone().x;

        // 2. 解析复活点（resurrectionPoses 子节点下的 PolyCollider2D 数据）
        const resurrectionPosesNode = segmentNode.getChildByName("resurrectionPoses")!;
        const checkpoints: Vec3 [] = [];

        // 遍历所有子节点（每个子节点代表一个复活点）
    
            const polyCollider = resurrectionPosesNode.getComponent(PolygonCollider2D)!;
            if (polyCollider && polyCollider.points && polyCollider.points.length > 0) {
                // 取第一个点作为复活位置（或者可以计算中心点）
               polyCollider.points.forEach((point)=>{
                    const localPosVec3 = new Vec3(point.x + resurrectionPosesNode.worldPosition.clone().x,point.y + resurrectionPosesNode.worldPosition.clone().y)    
                    checkpoints.push(localPosVec3);
                }); // 本地坐标
            }
            //console.log(checkpoints);

            resurrectionPosesNode.destroy();
            // while(segmentNode.getChildByName("resurrectionPoses")){
            //     segmentNode.getChildByName("resurrectionPoses").destroy();
            // }

        let planePosNode=segmentNode.getChildByName("planePos")
        let planePos:Vec3 = null;
        if(planePosNode){
            // // debugger;;
         
            planePos = planePosNode.worldPosition.clone();
            //console.log("planePos",planePos);
            let ceilingNode = segmentNode.getChildByName("WallLayer").getChildByName("Ceiling");
            let floorNode = segmentNode.getChildByName("WallLayer").getChildByName("Floor");
            let heightCeiling = ceilingNode.getComponent(UITransform).height;
            let heightFloor = floorNode.getComponent(UITransform).height;
            let ceilingPosY = ceilingNode.worldPosition.y - heightCeiling/2;
            let floorPosY = floorNode.worldPosition.y + heightFloor/2;

            let levelData:GeometryVibes_LevelData = {
                levelID: -1,
                startPos:planePos,
                ceilingPosY:ceilingPosY,
                floorPosY:floorPosY,
                endPos:null, 
            }
            GeometryVibes_DataManager.getInstance().setCurrentLevelData(levelData);
        }

        return { length, checkpoints ,planePos};
    }


    // private updateLevelRevivalPoints() {
    //     const levelData = GeometryVibes_DataManager.getInstance().getCurrentLevelData();
    //     if (!levelData) return;
        
    //     // 收集当前段、前一段和后一段的所有复活点
    //     const revivalPoints: Vec3[] = [];
        
    //     const startIndex = Math.max(0, this._currentIndex - 1);
    //     const endIndex = Math.min(this._live.length - 1, this._currentIndex + 1);
        
    //     for (let i = startIndex; i <= endIndex; i++) {
    //         const segment = this._live[i];
    //         segment.checkpoints.forEach(cp => {
    //             revivalPoints.push(new Vec3(cp.x + segment.startX, cp.y, 0));
    //         });
    //     }
        
    //     // 更新关卡数据中的复活点
    //     levelData.totalRevivalPoses = revivalPoints;
    //     GeometryVibes_DataManager.getInstance().setCurrentLevelData(levelData);
    // }

    /** 随机挑一段（可按 tag/权重/关卡进度进行选择） */
    private pickRandomKey(): string {
        // 简单随机，可替换为带权选择、随进度提升难度等
        const i = Math.floor(Math.random() * this._segmentKeys.length);
        return this._segmentKeys[i];
    }

    // /** 根据玩家 X，更新“最近已通过”的复活点（在当前段及其之前，最接近但 <= px 的点） */
    // private updateNearestPassedCheckpoint(px: number) {
    //     let best: Vec3 | null = this._lastPassedCheckpointWorld;
    //     let bestX = best ? best.x : -Infinity;
    //     // //console.log(px)

    //     let checkpoints:Vec3[] = [];
    //     // 只需要检查窗口内“到当前段为止”的所有段
    //     for (let i = 0; i <= this._currentIndex; i++) {
    //         const seg = this._live[i];
    //         checkpoints.push(...seg.checkpoints);
    //     }
    //     // //console.log(checkpoints)

    //     // const baseX = seg.startX;
    //         for (const cp of checkpoints) {
    //             const worldX =/*  baseX +  */cp.x;
    //             if (worldX <= px && worldX > bestX) {
    //             bestX = worldX;
    //             // const wy = cp.y + seg.node.worldPosition.y;
    //             // best = new Vec3(worldX, wy, 0);
    //              best = new Vec3(cp);
    //             }
    //         }
    //     if (best) this._lastPassedCheckpointWorld = best;
    // }

    /** 提供给 GameManager/Plane：死亡时获取复活点（若没有就用当前段起点） */
    public getRespawnPoint(): Vec3 {
        if (this._lastPassedCheckpointWorld) return this._lastPassedCheckpointWorld.clone();
        // //console.log("this._lastPassedCheckpointWorld",this._lastPassedCheckpointWorld)

        // 没踩过任何复活点，退而求其次：当前段起点 + 一点前移
        const seg = this._lives[this._currentIndex];
        return new Vec3(seg.startX + 2, this._plane.worldPosition.y, 0);
    }

    /** 外部调用：执行复活（放置玩家；不改变已生成的段窗口） */
    public respawnPlayer(resetYToCheckpoint = true) {
        const p = this.getRespawnPoint();
        const y = resetYToCheckpoint ? p.y : this._plane.worldPosition.y;
        this._plane.setWorldPosition(new Vec3(p.x, y, 0));
        // 复活后里程也随之重算（仍以 _globalHeadX 为起点）
        this._totalMeters = (p.x - this._globalHeadX) * this.metersPerUnit;
    }

    /** 提供里程（米） */
    public getTraveledMeters(): number {
        return Math.max(0, this._totalMeters);
    }

    // 获取商店物品配置（实际应该从DataManager获取，这里为了简化代码）
    private get shopItemsConfig(): GeometryVibes_ShopItemConfig[] {
        return GeometryVibes_DataManager.getInstance().getShopItemsByType(GeometryVibes_ItemType.PLANE)
            .concat( GeometryVibes_DataManager.getInstance().getShopItemsByType(GeometryVibes_ItemType.TRAIL))
            .concat( GeometryVibes_DataManager.getInstance().getShopItemsByType(GeometryVibes_ItemType.COLOR));
    }
}
