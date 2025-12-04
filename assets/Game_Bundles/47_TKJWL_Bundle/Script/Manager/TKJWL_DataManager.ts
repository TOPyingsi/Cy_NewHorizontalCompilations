import { _decorator,Color,Component, MeshRenderer, Node, Vec3 } from 'cc';
import { TKJWL_UIItemType } from '../Common/TKJWL_UIType';
import { TKJWL_ItemType } from '../Common/TKJWL_ItemType';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { TKJWL_GameEvents } from '../Common/TKJWL_GameEvents';
import { TKJWL_Waypoint } from '../Game/Monster/TKJWL_Waypoint';
import { TKJWL_TaskType } from '../Common/TKJWL_TaskType';
const { ccclass, property } = _decorator;

@ccclass('TKJWL_DataManager')
export class TKJWL_DataManager extends Component {
    public static Instance: TKJWL_DataManager;

     @property(Node)
    waypointsParent_plot999: Node = null; // 场景中所有路点

    @property(Node)
    waypointsParent_plot1: Node = null; // 场景中所有路点

    @property(Node)
    pathNodes_plot3: Node[] = []; // 场景中所有路点

    @property(Node)
    waypointsParent_plot4: Node = null; // 场景中所有路点

    
    taskMap:{[taskId:string]:{content:string,nextTaskId:TKJWL_TaskType}} = {
        [TKJWL_TaskType.往锅里装水]:{content:TKJWL_TaskType.往锅里装水,nextTaskId:TKJWL_TaskType.等待水装好},
        [TKJWL_TaskType.等待水装好]:{content:TKJWL_TaskType.等待水装好,nextTaskId:TKJWL_TaskType.将锅放到煤气灶上},
        [TKJWL_TaskType.将锅放到煤气灶上]:{content:TKJWL_TaskType.将锅放到煤气灶上,nextTaskId:TKJWL_TaskType.打开煤气灶烧水},
        [TKJWL_TaskType.打开煤气灶烧水]:{content:TKJWL_TaskType.打开煤气灶烧水,nextTaskId:TKJWL_TaskType.把垃圾扔进垃圾桶},
        [TKJWL_TaskType.把垃圾扔进垃圾桶]:{content:TKJWL_TaskType.把垃圾扔进垃圾桶,nextTaskId:TKJWL_TaskType.去楼道的垃圾管道扔掉垃圾袋},
        [TKJWL_TaskType.去楼道的垃圾管道扔掉垃圾袋]:{content:TKJWL_TaskType.去楼道的垃圾管道扔掉垃圾袋,nextTaskId:TKJWL_TaskType.将水饺放到锅里},
        [TKJWL_TaskType.将水饺放到锅里]:{content:TKJWL_TaskType.将水饺放到锅里,nextTaskId:TKJWL_TaskType.等待水饺煮好},
        [TKJWL_TaskType.等待水饺煮好]:{content:TKJWL_TaskType.等待水饺煮好,nextTaskId:TKJWL_TaskType.将煮好的的水饺放到餐桌上},
        [TKJWL_TaskType.将煮好的的水饺放到餐桌上]:{content:TKJWL_TaskType.将煮好的的水饺放到餐桌上,nextTaskId:TKJWL_TaskType.坐到餐桌前吃掉水饺},
        [TKJWL_TaskType.坐到餐桌前吃掉水饺]:{content:TKJWL_TaskType.坐到餐桌前吃掉水饺,nextTaskId:TKJWL_TaskType.在阳台用望远镜查看情况},
        [TKJWL_TaskType.在阳台用望远镜查看情况]:{content:TKJWL_TaskType.在阳台用望远镜查看情况,nextTaskId:TKJWL_TaskType.他正在向你奔来},
        [TKJWL_TaskType.他正在向你奔来]:{content:TKJWL_TaskType.他正在向你奔来,nextTaskId:TKJWL_TaskType.躲起来},
        [TKJWL_TaskType.躲起来]:{content:TKJWL_TaskType.躲起来,nextTaskId:TKJWL_TaskType.找准时机逃跑},
        [TKJWL_TaskType.找准时机逃跑]:{content:TKJWL_TaskType.找准时机逃跑,nextTaskId:TKJWL_TaskType.快跑},
        [TKJWL_TaskType.快跑]:{content:TKJWL_TaskType.快跑,nextTaskId:TKJWL_TaskType.警察来了},
        [TKJWL_TaskType.警察来了]:{content:TKJWL_TaskType.警察来了,nextTaskId:null},
    };

    itemTipMap:{[itemType:string]:string} = {
        [TKJWL_ItemType.GarbageCan]:"垃圾桶：收集的垃圾可以放在这里",
        [TKJWL_ItemType.GarbageContainer]:"垃圾回收点：垃圾袋请丢到此处",
        [TKJWL_ItemType.Sink]:"水槽：将锅放置在这里装水",
        [TKJWL_ItemType.Kettle2]:"装水中，当水装满后才可拿起",
        [TKJWL_ItemType.FullKettle]:"水已装满，可以放到灶台上烧水了",
        [TKJWL_ItemType.GasStove]:"煤气灶：放置锅，打开旋钮后可烧水",//燃气灶
        [TKJWL_ItemType.FullKettle2]:"水还未烧开",
        [TKJWL_ItemType.CookingKettle]:"正在煮水饺",
        [TKJWL_ItemType.Table0]:"做好的饭菜可以放在这里",
        [TKJWL_ItemType.Table1]:"做好的饭菜可以放在这里",
        [TKJWL_ItemType.Table2]:"做好的饭菜可以放在这里",
    };

    itemShowUIMap:{[itemType:string]:TKJWL_UIItemType[]} = {
        [TKJWL_ItemType.Door]:[TKJWL_UIItemType.摇杆,TKJWL_UIItemType.交互],
        [TKJWL_ItemType.LightSwitch]:[TKJWL_UIItemType.摇杆,TKJWL_UIItemType.交互],
        [TKJWL_ItemType.Garbage]:[TKJWL_UIItemType.摇杆,TKJWL_UIItemType.拿起来],
        [TKJWL_ItemType.GarbageCan]:[TKJWL_UIItemType.摇杆,TKJWL_UIItemType.提示,TKJWL_UIItemType.放下],
        [TKJWL_ItemType.GarbageContainer]:[TKJWL_UIItemType.摇杆,TKJWL_UIItemType.提示,TKJWL_UIItemType.放下],
        [TKJWL_ItemType.CokeCan]:[TKJWL_UIItemType.摇杆,TKJWL_UIItemType.拿起来],
        [TKJWL_ItemType.Telescope]:[TKJWL_UIItemType.摇杆,TKJWL_UIItemType.拿起来],

        [TKJWL_ItemType.Kettle]:[TKJWL_UIItemType.摇杆,TKJWL_UIItemType.拿起来],//拿去装水
        [TKJWL_ItemType.Sink]:[TKJWL_UIItemType.摇杆,TKJWL_UIItemType.提示,TKJWL_UIItemType.放下],//水槽
        [TKJWL_ItemType.Kettle2]:[TKJWL_UIItemType.摇杆,TKJWL_UIItemType.提示],//装水中的水壶
        [TKJWL_ItemType.FullKettle]:[TKJWL_UIItemType.摇杆,TKJWL_UIItemType.提示,TKJWL_UIItemType.拿起来],//装满的水壶
        [TKJWL_ItemType.GasStove]:[TKJWL_UIItemType.摇杆,TKJWL_UIItemType.提示,TKJWL_UIItemType.放下],//燃气灶
        [TKJWL_ItemType.FullKettle2]:[TKJWL_UIItemType.摇杆,TKJWL_UIItemType.提示,TKJWL_UIItemType.放下],//烧水中的水壶
        [TKJWL_ItemType.OpenKnob]:[TKJWL_UIItemType.摇杆,TKJWL_UIItemType.开火],//旋钮(打开)
        [TKJWL_ItemType.Refrigerator]:[TKJWL_UIItemType.摇杆,TKJWL_UIItemType.交互],//冰箱
        [TKJWL_ItemType.FrozenDumplings]:[TKJWL_UIItemType.摇杆,TKJWL_UIItemType.拿起来],
        [TKJWL_ItemType.CookingKettle]:[TKJWL_UIItemType.摇杆,TKJWL_UIItemType.提示],//装满水饺的水壶
        [TKJWL_ItemType.CloseKnob]:[TKJWL_UIItemType.摇杆,TKJWL_UIItemType.关火],//旋钮(关闭)
        [TKJWL_ItemType.CookEndDumplings]:[TKJWL_UIItemType.摇杆,TKJWL_UIItemType.拿起来],//煮熟的饺子
       
        [TKJWL_ItemType.Table0]:[TKJWL_UIItemType.摇杆,TKJWL_UIItemType.提示,TKJWL_UIItemType.坐下],
        [TKJWL_ItemType.Table1]:[TKJWL_UIItemType.摇杆,TKJWL_UIItemType.站起来],
        [TKJWL_ItemType.Table2]:[TKJWL_UIItemType.摇杆,TKJWL_UIItemType.提示,TKJWL_UIItemType.放下],
        [TKJWL_ItemType.BeforeEatDumplings]:[TKJWL_UIItemType.摇杆,TKJWL_UIItemType.吃,TKJWL_UIItemType.站起来],
        [TKJWL_ItemType.AfterEatDumplings]:[TKJWL_UIItemType.摇杆,TKJWL_UIItemType.站起来],
    };
    
    itemHoldOnShowUIMap:{[itemType:string]:TKJWL_UIItemType[]} = {
        // [TKJWL_ItemType.Garbage]:[TKJWL_UIItemType.拿起来],
        // [TKJWL_ItemType.GarbageCan]:[TKJWL_UIItemType.放下],
        // [TKJWL_ItemType.GarbageContainer]:[TKJWL_UIItemType.放下],
        // [TKJWL_ItemType.CokeCan]:[TKJWL_UIItemType.拿起来],
        [TKJWL_ItemType.Telescope]:[TKJWL_UIItemType.放下,TKJWL_UIItemType.滑块,TKJWL_UIItemType.望远镜遮罩],
        // [TKJWL_ItemType.Kettle]:[TKJWL_UIItemType.拿起来],
        // [TKJWL_ItemType.FrozenDumplings]:[TKJWL_UIItemType.拿起来],
        // [TKJWL_ItemType.FullKettle]:[TKJWL_UIItemType.拿起来],
        // [TKJWL_ItemType.CookEndKettle]:[TKJWL_UIItemType.放下],
        // [TKJWL_ItemType.CookEndDumplings]:[TKJWL_UIItemType.拿起来],
        // [TKJWL_ItemType.Table]:[TKJWL_UIItemType.坐下],
        // [TKJWL_ItemType.BeforeEatDumplings]:[TKJWL_UIItemType.吃,TKJWL_UIItemType.站起来],
        // [TKJWL_ItemType.AfterEatDumplings]:[TKJWL_UIItemType.站起来],
    };


    itemReleaseShowUIMap:{[itemType:string]:TKJWL_UIItemType[]} = {
        // [TKJWL_ItemType.Garbage]:[TKJWL_UIItemType.拿起来],
        // [TKJWL_ItemType.GarbageCan]:[TKJWL_UIItemType.放下],
        [TKJWL_ItemType.GarbageContainer]:[TKJWL_UIItemType.放下],
        // [TKJWL_ItemType.CokeCan]:[TKJWL_UIItemType.拿起来],
        // [TKJWL_ItemType.Telescope]:[TKJWL_UIItemType.放下,TKJWL_UIItemType.滑块,TKJWL_UIItemType.望远镜遮罩],
        // [TKJWL_ItemType.Kettle]:[TKJWL_UIItemType.拿起来],
        // [TKJWL_ItemType.FrozenDumplings]:[TKJWL_UIItemType.拿起来],
        // [TKJWL_ItemType.FullKettle]:[TKJWL_UIItemType.拿起来],
        // [TKJWL_ItemType.CookEndKettle]:[TKJWL_UIItemType.放下],
        // [TKJWL_ItemType.CookEndDumplings]:[TKJWL_UIItemType.拿起来],
        // [TKJWL_ItemType.Table]:[TKJWL_UIItemType.坐下],
        // [TKJWL_ItemType.BeforeEatDumplings]:[TKJWL_UIItemType.吃,TKJWL_UIItemType.站起来],
        // [TKJWL_ItemType.AfterEatDumplings]:[TKJWL_UIItemType.站起来],
    };

    Tip:string = "";
    tipColor:Color = Color.WHITE;

    // 游戏状态
    isGameStart: boolean = false;
    isFail: boolean = false;

    
    playerNode:Node = null;

    // 任务相关
    completedTaskMap:TKJWL_TaskType[] = [];
    currentTask:TKJWL_TaskType = null;
    subTaskIndex:{[taskId:string]:number} = {};

    isTelescopeWatching:boolean = false;
    isHoldOning:boolean = false;
    isSitting:boolean = false;
    isPutBeforeDumplings:boolean = false;
    isPutAfterDumplings:boolean = false;
    isStartKill:boolean = false;


    //剧情相关
    isCanKill:boolean = false;
    isWatchingKill = false;
 //剧情相关
    plotNum = 0;
    isStartPlot:boolean = false;
    currentArea:string = null;
    plotArray:string[] = [];
    doorMap:{[doorId:string]:boolean} = {};

    //剧情0路点
    path_plot999: TKJWL_Waypoint[] = []; 
    //剧情1、2路点
    waypoints_plot1: TKJWL_Waypoint[] = []; 
    //剧情3路点
    paths_plot3: {[pathId:string]:TKJWL_Waypoint[]} = {}; 
    //剧情1、2路点
    waypoints_plot4: TKJWL_Waypoint[] = []; 

//玩家移动旋转
    isMove: boolean = false;
    delta: Vec3 = null;
//道具
    lookAtItem:Node = null;
    HoldItem:Node = null;
    targetItemType:string = null;
    isLookTargetContainer:boolean = false;

    isTelescopeTutorialShowed:boolean = false;



    onLoad(){
        TKJWL_DataManager.Instance = this;

        this.path_plot999 = [];
        this.collectWaypointsRecursively(this.waypointsParent_plot999, this.path_plot999);
        //剧情1路径
        this.waypoints_plot1 = [];
        this.collectWaypointsRecursively(this.waypointsParent_plot1, this.waypoints_plot1);
        //剧情3路径
        this.paths_plot3 = {};
        this.pathNodes_plot3.forEach((pathNode)=>{
            let pathId = pathNode.name.split("_")[1];
            this.paths_plot3[pathId] = [];
            this.collectWaypointsRecursively(pathNode, this.paths_plot3[pathId]);
        })

        //剧情1路径
        this.waypoints_plot4 = [];
        this.collectWaypointsRecursively(this.waypointsParent_plot4, this.waypoints_plot4);
    }

    
    start(){
        this.addEventListener();
    }

    
    // 初始化数据
    initData() {
        this.currentTask = TKJWL_TaskType.往锅里装水;
        EventManager.Scene.emit(TKJWL_GameEvents.SHOW_TASK_TIP,TKJWL_TaskType.往锅里装水);
    }

    //任务相关
    updateTask(completedTask:TKJWL_TaskType){
        switch(completedTask){
            //不可能出现乱序的情况
            case TKJWL_TaskType.往锅里装水:
            case TKJWL_TaskType.等待水装好:
            case TKJWL_TaskType.将锅放到煤气灶上:

            case TKJWL_TaskType.将水饺放到锅里 :
            case TKJWL_TaskType.等待水饺煮好:
            case TKJWL_TaskType.将煮好的的水饺放到餐桌上 :


            case TKJWL_TaskType.他正在向你奔来:
            case TKJWL_TaskType.躲起来:
            case TKJWL_TaskType.找准时机逃跑:
                this.completedTaskMap.push(completedTask);
                this.currentTask = this.taskMap[completedTask].nextTaskId;
                EventManager.Scene.emit(TKJWL_GameEvents.SHOW_TASK_TIP,this.currentTask);
                break;
            //有可能出现乱序的情况
            case TKJWL_TaskType.把垃圾扔进垃圾桶 :
                this.subTaskIndex[completedTask]++;
                //当前任务与完成任务不一致的情况
                if(this.currentTask == completedTask){
                    EventManager.Scene.emit(TKJWL_GameEvents.UPDATE_TASK_Tip,this.currentTask);
                    if(this.subTaskIndex[completedTask] >= 2){
                        this.completedTaskMap.push(completedTask);
                        this.currentTask = this.taskMap[this.currentTask].nextTaskId;
                        EventManager.Scene.emit(TKJWL_GameEvents.SHOW_TASK_TIP,this.currentTask);
                        EventManager.Scene.emit(TKJWL_GameEvents.SHOW_item_Garbage_2);
                        EventManager.Scene.emit(TKJWL_GameEvents.Hide__Garbage_Can);
                        EventManager.Scene.emit(TKJWL_GameEvents.SHOW_item_Garbage_1);
                    }
                }
                else{
                    if(this.subTaskIndex[completedTask] >= 2){
                        this.completedTaskMap.push(completedTask);
                    }
                }
                break;
            case TKJWL_TaskType.去楼道的垃圾管道扔掉垃圾袋 :
                this.subTaskIndex[completedTask]++;
                if(this.currentTask == completedTask){
                    EventManager.Scene.emit(TKJWL_GameEvents.UPDATE_TASK_Tip,this.currentTask);
                    if(this.subTaskIndex[completedTask] >= 2){
                        this.completedTaskMap.push(completedTask);
                        //冒烟（待完成）
                        EventManager.Scene.emit(TKJWL_GameEvents.SHOW_BOIL_SMOKE);
                        this.itemTipMap[TKJWL_ItemType.FullKettle2] = "水已烧开，请放入水饺";
                        this.currentTask = this.taskMap[this.currentTask].nextTaskId;
                        EventManager.Scene.emit(TKJWL_GameEvents.SHOW_TASK_TIP,this.currentTask);
                        EventManager.Scene.emit(TKJWL_GameEvents.SHOW_DUMPLINGS);
                    }
                }
                else{
                    if(this.subTaskIndex[completedTask] >= 2){
                        this.completedTaskMap.push(completedTask);
                    }
                }
                break;
            case TKJWL_TaskType.打开煤气灶烧水 :
                //当前任务和完成任务只可能一致，但要跳过已完成的任务（垃圾）
                if(!this.completedTaskMap.includes(TKJWL_TaskType.把垃圾扔进垃圾桶)){
                    EventManager.Scene.emit(TKJWL_GameEvents.SHOW_item_All_Garbage);
                    this.currentTask = TKJWL_TaskType.把垃圾扔进垃圾桶;
                    EventManager.Scene.emit(TKJWL_GameEvents.SHOW_TASK_TIP,this.currentTask);
                }
                else if(!this.completedTaskMap.includes(TKJWL_TaskType.去楼道的垃圾管道扔掉垃圾袋)){
                    this.currentTask = TKJWL_TaskType.去楼道的垃圾管道扔掉垃圾袋;
                    EventManager.Scene.emit(TKJWL_GameEvents.SHOW_TASK_TIP,this.currentTask);
                }
                else{
                    //自动烧好水
                    EventManager.Scene.emit(TKJWL_GameEvents.HIDE_TASK_TIP);
                    this.scheduleOnce(()=>{
                        //冒烟（待完成）
                        EventManager.Scene.emit(TKJWL_GameEvents.SHOW_BOIL_SMOKE);
                        this.currentTask = TKJWL_TaskType.将水饺放到锅里;
                        EventManager.Scene.emit(TKJWL_GameEvents.SHOW_TASK_TIP,this.currentTask);
                    },10)
                }
                break;
            case TKJWL_TaskType.坐到餐桌前吃掉水饺 :
                //开启杀人房间
                EventManager.Scene.emit(TKJWL_GameEvents.CLOSE_ROOM,"idleMonster");
                EventManager.Scene.emit(TKJWL_GameEvents.OPEN_ROOM,"danceRoom");
                EventManager.Scene.emit(TKJWL_GameEvents.OPEN_ROOM,"killRoom");
                this.isCanKill = true;

                this.currentTask = this.taskMap[this.currentTask].nextTaskId;
                EventManager.Scene.emit(TKJWL_GameEvents.SHOW_TASK_TIP,this.currentTask);
                break;

            case TKJWL_TaskType.在阳台用望远镜查看情况 :
                if(this.currentTask == completedTask){
                    this.currentTask = this.taskMap[this.currentTask].nextTaskId;
                    EventManager.Scene.emit(TKJWL_GameEvents.HIDE_TASK_TIP);
                }
                break;
            // case TKJWL_TaskType.他正在向你奔来:
            // case TKJWL_TaskType.躲起来:
            // case TKJWL_TaskType.找准时机逃跑:
            //     this.currentTask = this.taskMap[this.currentTask].nextTaskId;
            //     EventManager.Scene.emit(TKJWL_GameEvents.SHOW_TASK_TIP,this.currentTask);
            //     break;
            case TKJWL_TaskType.快跑:
                EventManager.Scene.emit(TKJWL_GameEvents.HIDE_TASK_TIP);
                break;
        }
    }


    //剧情相关
    startPolt(){
        this.isStartPlot = true;
        EventManager.Scene.emit(TKJWL_GameEvents.OPEN_AREA,"1");
    }

    setDoor(doorId:string, isOpen:boolean){
        this.doorMap[doorId] = isOpen;
        if(this.isStartPlot && doorId == "3" && !isOpen){//剧情1
            if(this.currentArea == "area_2"){
                if(this.plotNum == 0){
                    this.plotNum = 1;
                    EventManager.Scene.emit(TKJWL_GameEvents.SET_MONSTER_POLT);
                    EventManager.Scene.emit(TKJWL_GameEvents.CLOSE_AREA,"2");
                }
            }
        }
    }
    

    setPoltArea(areaName:string,isIn:boolean){
        this.plotArray.push(areaName);
        switch(areaName){
            case "area_1":
                if(isIn){
                    this.plotNum = 0;
                    EventManager.Scene.emit(TKJWL_GameEvents.HIDE_MONSTER_POLT,"999");
                    EventManager.Scene.emit(TKJWL_GameEvents.CLOSE_LIGHT,1);
                    EventManager.Scene.emit(TKJWL_GameEvents.CLOSE_LIGHT,2);
                    EventManager.Scene.emit(TKJWL_GameEvents.CLOSE_LIGHT,3);
                    EventManager.Scene.emit(TKJWL_GameEvents.CLOSE_LIGHT,4);
                    EventManager.Scene.emit(TKJWL_GameEvents.CLOSE_LIGHT,5);
                    EventManager.Scene.emit(TKJWL_GameEvents.CLOSE_AREA,"1");
                    EventManager.Scene.emit(TKJWL_GameEvents.OPEN_AREA,"2");
                    EventManager.Scene.emit(TKJWL_GameEvents.OPEN_AREA,"3");
                    EventManager.Scene.emit(TKJWL_GameEvents.OPEN_AREA,"4");
                    EventManager.Scene.emit(TKJWL_GameEvents.OPEN_AREA,"42");
                    EventManager.Scene.emit(TKJWL_GameEvents.OPEN_AREA,"43");
                    TKJWL_DataManager.Instance.updateTask(TKJWL_TaskType.他正在向你奔来);
                }
                break; 
            case "area_2":
                if(isIn){
                    this.currentArea = areaName;
                }
                else{
                    this.currentArea = null;
                }
                break; 
            case "area_3":
                if(isIn){
                    if(this.plotNum == 0){
                        this.plotNum = 2;
                        EventManager.Scene.emit(TKJWL_GameEvents.SET_MONSTER_POLT);
                        EventManager.Scene.emit(TKJWL_GameEvents.CLOSE_AREA,"3");
                    }
                }
                else{
                    this.currentArea = null;
                }
                break; 
            case "area_42":
            case "area_4":
                if(isIn){
                    if(this.plotNum == 0){
                        this.plotNum = 3;
                        EventManager.Scene.emit(TKJWL_GameEvents.SET_MONSTER_POLT);
                        EventManager.Scene.emit(TKJWL_GameEvents.OPEN_AREA,"5");
                        EventManager.Scene.emit(TKJWL_GameEvents.OPEN_AREA,"6");
                        EventManager.Scene.emit(TKJWL_GameEvents.OPEN_AREA,"7");
                        EventManager.Scene.emit(TKJWL_GameEvents.CLOSE_AREA,"2");
                        EventManager.Scene.emit(TKJWL_GameEvents.CLOSE_AREA,"3");
                        TKJWL_DataManager.Instance.updateTask(TKJWL_TaskType.躲起来);
                    }
                }
                else{
                    this.currentArea = null;
                }
                break; 
            case "area_5":
                if(isIn){
                    this.currentArea = areaName;
                }
                else{
                    this.currentArea = null;
                }
                break; 
            case "area_6":
                if(isIn){
                    this.currentArea = areaName;
                }
                else{
                    this.currentArea = null;
                }
                break; 
            case "area_7":
                if(isIn){
                    this.currentArea = areaName;
                    if(this.plotNum == 3){
                        this.plotNum = 4;
                        EventManager.Scene.emit(TKJWL_GameEvents.HIDE_MONSTER_POLT,"3");
                        EventManager.Scene.emit(TKJWL_GameEvents.SET_MONSTER_POLT);
                        EventManager.Scene.emit(TKJWL_GameEvents.OPEN_AREA,"8");
                        EventManager.Scene.emit(TKJWL_GameEvents.CLOSE_AREA,"6");
                        EventManager.Scene.emit(TKJWL_GameEvents.CLOSE_AREA,"7");
                        TKJWL_DataManager.Instance.updateTask(TKJWL_TaskType.找准时机逃跑);

                    }
                }
                else{
                    this.currentArea = null;
                }
                break; 
              case "area_8":
                if(isIn){
                    this.currentArea = areaName;
                    // if(this.plotNum == 3){
                    //     this.plotNum = 4;
                        EventManager.Scene.emit(TKJWL_GameEvents.HIDE_MONSTER_POLT,"4");
                        EventManager.Scene.emit(TKJWL_GameEvents.SET_MONSTER_POLT);
                        EventManager.Scene.emit(TKJWL_GameEvents.CLOSE_AREA,"8");
                        EventManager.Scene.emit(TKJWL_GameEvents.OPEN_DOOR,"7");
                        EventManager.Scene.emit(TKJWL_GameEvents.OPEN_ROOM,"policeRoom");
                        
                        TKJWL_DataManager.Instance.updateTask(TKJWL_TaskType.快跑);
                        TKJWL_DataManager.Instance.isFail = false;
                        TKJWL_DataManager.Instance.isGameStart = false;
                        this.scheduleOnce(()=>{
                            EventManager.Scene.emit(TKJWL_GameEvents.UI_SHOW_END_PANEL);
                        },2)

                  
                    // }
                }
                else{
                    this.currentArea = null;
                }
                break; 
        }
    }


    //路径相关
    hideAllPath(){
        //剧情0路点
        this.path_plot999.forEach(waypoint =>{
            waypoint.node.active = false;
        })
        //剧情1、2路点
        this.waypoints_plot1.forEach(waypoint =>{
            waypoint.node.active = false;
        })
        //剧情3路点
        for(let pathId in this.paths_plot3){
            this.paths_plot3[pathId].forEach(waypoint =>{
                waypoint.node.active = false;
            })
        }
        //剧情1、2路点
        this.waypoints_plot4.forEach(waypoint =>{
            waypoint.node.active = false;
        })
    }

    showPath(Waypoints:TKJWL_Waypoint[]){
        for(let waypoint of Waypoints){
            waypoint.node.active = true;
        }
    }

    // 新增递归收集方法
    private collectWaypointsRecursively(node: Node, waypoints: TKJWL_Waypoint[]): void {
        const waypoint = node.getComponent(TKJWL_Waypoint);
      
        let mesh = node.getComponent(MeshRenderer);
        if(mesh){
            mesh.enabled = false;
        }
        if (waypoint) {
            waypoints.push(waypoint);
        }

        // 递归处理所有子节点
        for (const child of node.children) {
            this.collectWaypointsRecursively(child, waypoints);
        }
    }

    addEventListener(){

    }

    removeEventListener(){

    }

    onDestroy(){
        this.removeEventListener();
    }
}
