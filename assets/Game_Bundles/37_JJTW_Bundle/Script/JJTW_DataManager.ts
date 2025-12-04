import { _decorator, Component, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('JJTW_DataManager')
export class JJTW_DataManager extends Component {
    // 单例实例
    public static Instance: JJTW_DataManager = null;

    @property(Node)
    pathWaypointsParent: Node = null; // 场景中所有路点

    public isGameStart: boolean = false;
    public isGuidanding:boolean = false;
    public isStartToLightDownCount:boolean = false;

    public currentStepIndex:number = 0;
    public isMove: boolean = false;
    public delta: Vec3 = null;
    public isScream: boolean = false;
    public isFlashlight: boolean = true;
    public isLightCanOpen:boolean = true;
    public isScaning:boolean = false;

    public currentTargetPos:Vec3 = null;
    public currentPlayerPos:Vec3 = null;
    public itemFloorNumber:number = 1;

    public isPlayerDead:boolean = false;

    public isDownStairDoorOpen:boolean = false;
    public isUpStairDoorOpen:boolean = false;

    public keyData:{worldPos:Vec3,isGot:boolean,floorNumber:number} = {
        worldPos:new Vec3(-3.271, -1.344, 8.185),
        // worldPos:new Vec3(18.881 ,-0.588, -6.663),
        isGot:false,
        floorNumber:2
    };

    public compassData:{id:number,worldPos:Vec3,isGot:boolean,isSet:boolean,floorNumber:number}[] = [
        {id:0,worldPos:new Vec3(18.881 ,-0.588, -6.663),isGot:false,isSet:false,floorNumber:2},
        {id:1,worldPos:new Vec3(27.876, -0.466, 2.233),isGot:false,isSet:false,floorNumber:2},
        {id:2,worldPos:new Vec3(-7.237, -1.348, 13.335),isGot:false,isSet:false,floorNumber:2},
        {id:3,worldPos:new Vec3(25.634, -0.411, 6.003),isGot:false,isSet:false,floorNumber:2},
        {id:4,worldPos:new Vec3(17.939, -4.838, -3.945),isGot:false,isSet:false,floorNumber:1},
        {id:5,worldPos:new Vec3(9.145, -3.927, -7.711),isGot:false,isSet:false,floorNumber:1},
    ]

    public fileData:{worldPos:Vec3,isGot:boolean,isSet:boolean,floorNumber:number} = 
        {worldPos:new Vec3(-4.782,-0.301,-3.04),isGot:false,isSet:false,floorNumber:2}


    public liveNPCData:{id:number,isDead:boolean}[]=[
        {id:1,isDead:false},
        {id:2,isDead:false},
    ]

    onLoad(){
        // 确保单例
        JJTW_DataManager.Instance = this;

        // 收集所有路点
        //this.pathWaypoints = [];
        // this.collectWaypointsRecursively(this.pathWaypointsParent, this.pathWaypoints);
    }
    
    resetData(){
        this.isGameStart= false;
        this. isGuidanding = false;
        this. isStartToLightDownCount = false;

        this. currentStepIndex = 0;
        this. isMove = false;
        this. delta= null;
        this. isScream = false;
        this. isFlashlight = true;
        this. isLightCanOpen = true;

        this. currentTargetPos= null;
        this. currentPlayerPos = null;
        this. itemFloorNumber = 1;

        this. isPlayerDead= false;

        this. isDownStairDoorOpen= false;
        this. isUpStairDoorOpen= false;

        this. keyData= {
            worldPos:new Vec3(-3.271, -1.344, 8.185),
            isGot:false,
            floorNumber:2
        };

        this. compassData = [
            {id:0,worldPos:new Vec3(18.881 ,-0.588, -6.663),isGot:false,isSet:false,floorNumber:2},
            {id:1,worldPos:new Vec3(27.876, -0.466, 2.233),isGot:false,isSet:false,floorNumber:2},
            {id:2,worldPos:new Vec3(-7.237, -1.348, 13.335),isGot:false,isSet:false,floorNumber:2},
            {id:3,worldPos:new Vec3(25.634, -0.411, 6.003),isGot:false,isSet:false,floorNumber:2},
            {id:4,worldPos:new Vec3(17.939, -4.838, -3.945),isGot:false,isSet:false,floorNumber:1},
            {id:5,worldPos:new Vec3(9.145, -3.927, -7.711),isGot:false,isSet:false,floorNumber:1},
        ]

        this. fileData = 
            {worldPos:new Vec3(-4.275,-0.391,-5.533),isGot:false,isSet:false,floorNumber:2}

        this.liveNPCData=[
            {id:1,isDead:false},
            {id:2,isDead:false},
        ]
    }



    setTargetPos(){
        if(!this.keyData.isGot){
            this.currentTargetPos = this.keyData.worldPos;
            //console.log("设置目标位置为钥匙:"+ this.currentTargetPos )
            this.itemFloorNumber = this.keyData.floorNumber;
            return;
        }
        for(let i=0;i<this.compassData.length;i++){
            if(!this.compassData[i].isSet && !this.compassData[i].isGot){
                this.currentTargetPos = this.compassData[i].worldPos;
                //console.log("设置目标位置为指南针:"+i+ this.currentTargetPos )
                this.itemFloorNumber = this.compassData[i].floorNumber;
               return;
            }
        }

        if(!this.fileData.isGot){
            this.currentTargetPos = this.fileData.worldPos;
            //console.log("设置目标位置为文件:"+ this.currentTargetPos )
            this.itemFloorNumber = this.fileData.floorNumber;
            return;
        }
        this.currentTargetPos = null;
        this.itemFloorNumber = 1;
    }

}


