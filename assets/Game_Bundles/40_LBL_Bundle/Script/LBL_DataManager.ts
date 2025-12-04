import { _decorator, Component, Node, RigidBody, Vec3 } from 'cc';
import { LBL_ILevelData } from './LBL_ILevelData';
import { LBL_SaveData } from './LBL_SaveData';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { LBL_Const } from './LBL_Const';
const { ccclass, property } = _decorator;

@ccclass('LBL_DataManager')
export class LBL_DataManager {
    private static instance: LBL_DataManager;

    public static get Instance(): LBL_DataManager {
        if (!LBL_DataManager.instance) {
            LBL_DataManager.instance = new LBL_DataManager();
        }
        return LBL_DataManager.instance;
    }

    STORAGE_KEY = "LBL_Data";

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

    public currentPointNodes:Node[] = [];

    public isGetIcon:boolean = false;

    public currentLevelParentNode:Node = null;



    public levelData:LBL_ILevelData= {
    };


    public currentPoints:{
        level:number,
        round:number,
    } = {
        level:1,
        round:1,
    }


    public passLevels:number[] = [];


    clearData(){
        this.passLevels = [];
        this.currentPoints.level = 1;
        this.currentPoints.round = 1;
    }


    initData(levelData:LBL_ILevelData){
        this.levelData = levelData;
        for(let level in this.levelData){
            for(let round in this.levelData[level].round){
                for(let number in this.levelData[level].round[round]){
                    this.levelData[level].round[round][number].isGot = false;
                }
            }
        }
    }


    initcurrentLevel(){
        this.initData(this.levelData);
        this.currentPoints.round = 1;
    }


    initlevelData(levelData:LBL_ILevelData){
        this.initData(levelData);
        const savedData = localStorage.getItem(this.STORAGE_KEY);
        let data
        if (savedData) {
            data = JSON.parse(savedData);
            this.passLevels = data.passLevels;
            if(this.passLevels.length > 4){
                this.currentPoints.level = 4;
            }
            else{
                this.currentPoints.level = this.passLevels.length + 1;
            }
            this.currentPoints.round = 1;
        }
        else{
            this.passLevels = [];
            this.currentPoints.level = 1;
            this.currentPoints.round = 1;
            this.saveData();
        }
    }


    getCurrentIconIds(){
        let iconIds:string[] = [];
        let level = this.currentPoints.level;
           for(let round in this.levelData[level].round){
                for(let number in this.levelData[level].round[round]){
                     if(this.levelData[level].round[round][number].iconId && this.levelData[level].round[round][number].isGot){
                        iconIds.push(this.levelData[level].round[round][number].iconId);
                    }
                }
            }
        return iconIds;
    }

    saveData(){
        let data:LBL_SaveData = {
            passLevels:this.passLevels
        }
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    }

    checkPassRound(){
        let level = this.currentPoints.level;
        let round = this.currentPoints.round;
        for(let number in this.levelData[level].round[round]){
            if(!this.levelData[level].round[round][number].isGot){
                return false;
            }
        }
        return true;
    }

    checkPassLevel(){
        let level = this.currentPoints.level;
            for(let round in this.levelData[level].round){
                for(let number in this.levelData[level].round[round]){
                    if(!this.levelData[level].round[round][number].isGot){
                        return false;
                    }
                }
            }
       return true;
    }

    goNextRound(){
        let level = this.currentPoints.level;
        let round = this.currentPoints.round;
        if(round < this.levelData[level].roundCount){
            this.currentPoints.round++;
        }
    }

    passLevel(){
        this.passLevels.push(this.currentPoints.level);
            if(this.passLevels.length > 4){
                this.currentPoints.level = 4;
            }
            else{
                this.currentPoints.level = this.passLevels.length + 1;
            }
            this.currentPoints.round = 1;
        this.saveData();
    }


    initLevelParentNode(levelParentNode:Node){
        this.currentLevelParentNode = levelParentNode;
        this.traverseAndDeactivateRigidBodies(levelParentNode);
    }

    
private traverseAndDeactivateRigidBodies(node: Node) {
    // 检查当前节点是否有RigidBody组件
    const rigidBody = node.getComponent(RigidBody);
    if (rigidBody) {
        node.active = false;
    }

    // 递归遍历所有子节点
    node.children.forEach(child => {
        this.traverseAndDeactivateRigidBodies(child);
    });
}

    setCurrentRoundNodes(){
        let level = this.currentPoints.level;
        let round = this.currentPoints.round;
        let roundNode = this.currentLevelParentNode.getChildByName("level_"+level).getChildByName("round_"+round);
        // this.currentPointNodes = roundNode.children;

        let nodes:Node[]=[];
        for(let number in this.levelData[level].round[round]){
            if(!this.levelData[level].round[round][number].isGot){
                let nodeName = `point_${level}_${round}_${number}`
                let pointNode = roundNode.getChildByName(nodeName);
                pointNode.children.forEach((node)=>{
                    node.active = true;
                })
                nodes.push(pointNode);
            }
        }
        this.currentPointNodes = nodes;
        return this.currentPointNodes;
    }

    clearlevelData(){
        this.initlevelData(this.levelData)
    }

    gotPoint(number:number){
        let level = this.currentPoints.level;
        let round = this.currentPoints.round;
        this.levelData[level].round[round][number].isGot = true;
        // this.currentPointNodes.forEach((node)=>{
        //     if(parseInt(node.name.split("_")[3]) == number){
        //         node.destroy();
        //     }
        // })
        if(this.checkPassLevel()){
            EventManager.Scene.emit(LBL_Const.EventName.PassGame);
            // LBL_GameManager.getInstance().passGame();
        }
        else{
            if(this.checkPassRound()){
                this.goNextRound();
            }
            this.setCurrentRoundNodes();
        }
    }


    getCurrentEndingIconId(){
        let level = this.currentPoints.level;
        return this.levelData[level].endingIconId;
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
    }

    destroyInstance(){
        if (LBL_DataManager.instance) {
        // 重置所有数据
        LBL_DataManager.instance.resetData();
        // 销毁实例
        LBL_DataManager.instance = null;
    }
    }
}


