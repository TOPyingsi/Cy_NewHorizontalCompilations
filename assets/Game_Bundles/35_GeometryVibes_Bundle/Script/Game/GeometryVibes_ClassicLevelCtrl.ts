import { _decorator, Component, director, Enum, instantiate,  JsonAsset,  Label,  Node,  PolygonCollider2D,  Prefab, tween, UITransform, Vec3 } from 'cc';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { GeometryVibes_PlaneController } from './GeometryVibes_PlaneController';
import { GeometryVibes_DataManager, GeometryVibes_GameMode, GeometryVibes_ItemType, GeometryVibes_LevelData, GeometryVibes_PlaneColor, GeometryVibes_PlaneStyle, GeometryVibes_ShopItemConfig, GeometryVibes_TailStyle } from '../Manager/GeometryVibes_DataManager';;
import { GeometryVibes_BasePanel } from '../Common/GeometryVibes_BasePanel';
import { GeometryVibes_CameraFollowCtrl } from './GeometryVibes_CameraFollowCtrl';
import { GeometryVibes_EndlessLevelCtrl } from './GeometryVibes_EndlessLevelCtrl';
import { GeometryVibes_AudioManager } from '../Manager/GeometryVibes_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('GeometryVibes_ClassicLevelCtrl')
export class GeometryVibes_ClassicLevelCtrl extends Component {
    // @property(Node)
    //  obstaclesLayer: Node = null;

    // @property(Node)
    //  touchLayer: Node = null; 

    @property(Node)
     gameCamera: Node = null;

     @property(Node)
     Particle2DNode: Node = null;



    // @property({ type: Enum({ NORMAL: 0, ENDLESS: 1 }) })
    // public gameMode: number = 0; // 0-闯关 1-无尽
    
    // @property
    // public _planeInfo: { style: GeometryVibes_PlaneStyle, color: GeometryVibes_PlaneColor, trail: GeometryVibes_TailStyle } = null;
    
    // @property
    // public currentLevel: number = 1; // 当前关卡（无尽模式传最新解锁关卡）


    private onComplete: Function= null;
    private _cameraInitPos: Vec3 = null;


    private _planePrefab: Prefab = null;
    private _plane: Node = null;
    private _level: Node = null;


    public destroyGame(onComplete: Function) {
        this.gameCamera.getComponent(GeometryVibes_CameraFollowCtrl).unbindNode();
        this.gameCamera.getComponent(GeometryVibes_CameraFollowCtrl).removeFlowNode(this.Particle2DNode)
        this.gameCamera.setWorldPosition(this._cameraInitPos);
        if(GeometryVibes_DataManager.getInstance().isMusicEnabled()){
            let currentLevel = GeometryVibes_DataManager.getInstance().getCurrentLevel()
            // GeometryVibes_AudioManager.StopLoopAudio(`Level_${currentLevel}`);
            // GeometryVibes_AudioManager.getInstance().stopMusic();
        }

        // //console.log("gameCamera.worldPosition",this._cameraInitPos,this.gameCamera.worldPosition);
        this._level.destroy();
        this._plane.destroy();
        onComplete();
    }


    public startGame(onComplete: Function) {
        this.onComplete = onComplete;
        this._cameraInitPos = new Vec3(this.gameCamera.worldPosition.x, this.gameCamera.worldPosition.y, this.gameCamera.worldPosition.z);

        // 1. 加载关卡预制体
        let currentLevel = GeometryVibes_DataManager.getInstance().getCurrentLevel()
        const levelPath = `Game/Levels/level_${currentLevel}`;
        // 加载并创建UI预制体
        BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, levelPath).then((prefab: Prefab) => {
            this._level = instantiate(prefab);
            this.node.addChild(this._level);
            // this._level.getChildByName("resurrectionPoses").destroy();

            //初始化关卡数据
            BundleManager.LoadJson(GameManager.GameData.DefaultBundle, "levelData").then((JsonAsset: JsonAsset) => {
                
                // 使用 DataManager 的解析方法转换数据
                const levelData = GeometryVibes_DataManager.getInstance().parseLevelData(JsonAsset.json[currentLevel.toString()]);
                GeometryVibes_DataManager.getInstance().setCurrentLevelData(levelData);
                //console.log("levelData",levelData);

                GeometryVibes_DataManager.getInstance().setCurrentProgress(0);
                GeometryVibes_DataManager.getInstance().setIsPassLevel(false);


                // // 2. 初始化飞机
                this.initPlane(false,GeometryVibes_DataManager.getInstance().getCurrentLevelData().startPos,
                ()=>{
                    this.gameCamera.getComponent(GeometryVibes_CameraFollowCtrl).bindNode(this._plane);
                    this.initBgParticle();
                    if(GeometryVibes_DataManager.getInstance().isMusicEnabled()){
                        // GeometryVibes_AudioManager.playLoopAudio(`Level_${currentLevel}`);
                        GeometryVibes_AudioManager.getInstance().playMusic(`Level_${currentLevel}`);
                    }
                    this.onComplete();
                });
            });

            // let levelData= this.parseData(this._level);
            // GeometryVibes_DataManager.getInstance().setCurrentLevelData(levelData) 
            // // // 2. 初始化飞机
            // this.initPlane(()=>{
            //     this.gameCamera.getComponent(GeometryVibes_CameraFollowCtrl).bindNode(this._plane);
            //     this.onComplete();
            // });
        });
    }

    update(dt: number){
        if(GeometryVibes_DataManager.getInstance().getIsPaused() || !this._plane)return;
        let levelData = GeometryVibes_DataManager.getInstance().getCurrentLevelData();
        if(this._plane){
            let planePos = this._plane?.worldPosition;
            if(planePos){
  let progress = (planePos.x - levelData.startPos.x) / levelData.length;
            GeometryVibes_DataManager.getInstance().setCurrentProgress(progress);
            }
        }
       
    }

    public revivalGame(onComplete: Function){
        const levelData = GeometryVibes_DataManager.getInstance().getCurrentLevelData();
        const planePos = this._plane.worldPosition;
        
        //console.log("revivalPos",levelData.totalRevivalPoses);

        // // 找到比飞机位置小的最近复活点
        // let closestRevivalPos = levelData.totalRevivalPoses
        //     .filter(pos => pos.x < planePos.x)
        //     .reduce((prev, curr) => 
        //         (curr.x > prev.x) ? curr : prev, 
        //         new Vec3(-Infinity, 0, 0)
        //     );

        // 找到x轴位置比当前小且距离最近的点
        let closestRevivalPos = levelData.totalRevivalPoses
        .filter(pos => pos.x < planePos.x)
        .reduce((closest, current) => {
            // 计算当前点与飞机位置的平方距离（避免开根号）
            const currentDist = current.clone().subtract(planePos).lengthSqr();
            const closestDist = closest.clone().subtract(planePos).lengthSqr();
            return currentDist < closestDist ? current : closest;
        }, new Vec3(-Infinity, 0, 0));


        //console.log("closestRevivalPos",closestRevivalPos);
            
        // 设置飞机位置
        this.initPlane(true,closestRevivalPos,

            ()=>{
                this.gameCamera.getComponent(GeometryVibes_CameraFollowCtrl).resetFollow(this._plane);
                this.initBgParticle();
                onComplete();
        });
        // this._plane.setWorldPosition(closestRevivalPos);
        // this._plane.setScale(new Vec3(1,1,1));
        // this._plane.active = true;
        
        // //console.log("_planePos",this._plane.worldPosition);

        // // 重新设置相机位置
        // this.gameCamera.getComponent(GeometryVibes_CameraFollowCtrl).resetFollow(this._plane);
        // onComplete();
    }
 

 private initPlane(isRevival:boolean,startWorPos:Vec3,onComplete:Function) {
        // 加载飞机预制体并应用外观配置
        if(this._plane){
            this._plane.destroy();
            this._plane = null;
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
    }

    private initBgParticle(){
        let Particle2DNode = this.Particle2DNode;
        tween( Particle2DNode)
        .call(()=>{
            Particle2DNode.setPosition(-1390,0,0);
        })
        .delay(0.1)
        .call(()=>{
            Particle2DNode.setPosition(1390,0,0);
            this.gameCamera.getComponent(GeometryVibes_CameraFollowCtrl).addFlowNode(Particle2DNode)
        })
        .start();
    }

    parseData(levelNode:Node):GeometryVibes_LevelData{
        let revivalPoses:Vec3[] = [];
        let polyCollider = levelNode.getChildByName("resurrectionPoses").getComponent(PolygonCollider2D);
        polyCollider.points.forEach((point)=>{
            revivalPoses.push(new Vec3(point.x,point.y));
        })


        let ceilingNode = levelNode.getChildByName("WallLayer").getChildByName("Ceiling");
        let floorNode = levelNode.getChildByName("WallLayer").getChildByName("Floor");
        let heightCeiling = ceilingNode.getComponent(UITransform).height;
        let heightFloor = floorNode.getComponent(UITransform).height;
        let ceilingPosY = ceilingNode.worldPosition.y - heightCeiling/2;
        let floorPosY = floorNode.worldPosition.y + heightFloor/2;

        let endLinePosX = levelNode.getChildByName("endLine").worldPosition.x;
        let length = endLinePosX - levelNode.getChildByName("startPos").worldPosition.x;


        let levelData:GeometryVibes_LevelData = {
            levelID:parseInt(levelNode.name.split("_")[1]),
            startPos:levelNode.getChildByName("startPos").worldPosition,
            length:length,
            endPos:levelNode.getChildByName("endPos").worldPosition,
            totalRevivalPoses:revivalPoses,
            ceilingPosY:ceilingPosY,
            floorPosY:floorPosY,
        };
        return levelData;
    }

    // private initTouchControl() {
    //     // 全屏触摸监听节点（已在场景预制体中设置）
    //     this.touchLayer.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
    //     this.touchLayer.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    // }

    // public gameOver(isSuccess: boolean) {
    //     GeometryVibes_DataManager.getInstance().setIsPaused(true);
    //     const progress = this.calculateProgress();


    //     // EventManager.emit("GameOver", {
    //     //     level: GeometryVibes_DataManager.getInstance().getCurrentLevel(),
    //     //     progress: progress,
    //     //     isSuccess: isSuccess
    //     // });
    // }

    // private calculateProgress(): number {
    //     if (GeometryVibes_DataManager.getInstance().getCurrentGameMode() === 0) {
    //         // 闯关模式进度计算
    //         return this._plane.position.x / this._level.getComponent(GeometryVibes_LevelManager).totalLength;

    //     } else {
    //         // 无尽模式米数计算
    //         return this._plane.position.x;
    //     }
    // }

    // private onTouchStart() {
    //     GeometryVibes_DataManager.getInstance().setIsTouching(true);
    // }

    // private onTouchEnd() {
    //     GeometryVibes_DataManager.getInstance().setIsTouching(false);
    // }

    // 获取商店物品配置（实际应该从DataManager获取，这里为了简化代码）
    private get shopItemsConfig(): GeometryVibes_ShopItemConfig[] {
        return GeometryVibes_DataManager.getInstance().getShopItemsByType(GeometryVibes_ItemType.PLANE)
            .concat( GeometryVibes_DataManager.getInstance().getShopItemsByType(GeometryVibes_ItemType.TRAIL))
            .concat( GeometryVibes_DataManager.getInstance().getShopItemsByType(GeometryVibes_ItemType.COLOR));
    }
}
