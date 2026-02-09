import { _decorator, Animation, Component, instantiate, Label,Node,  RigidBody,  Sprite, tween, v3, Vec3 } from 'cc';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XGDY_GameEvents } from '../Common/XGDY_GameEvents';
import { XGDY_DataManager, XGDY_ItemType } from '../Manager/XGDY_DataManager';
import { XGDY_AudioManager } from '../Manager/XGDY_AudioManager';
import { DH_ItemType } from '../../../54_DH/Script/Manager/DH_DataManager';
import { XGDY_Constant } from '../Common/XGDY_Constant';
import { XGDY_LoadManager } from '../Manager/XGDY_LoadManager';
import { XGDY_SwimingFish } from '../Game/XGDY_SwimingFish';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
const { ccclass, property } = _decorator;

@ccclass('XGDY_PoolPanel')
export class XGDY_PoolPanel extends Component {


    @property(Label)
    lblMoney:Label = null;

    @property(Node)
    btnAddMoney:Node = null;

    @property(Label)
    lblIncome:Label = null;

  
    @property(Node)
    btnShowSetPanel:Node = null;

    
    @property(Node)
    btnCloseSetPanel:Node = null;

    @property(Node)
    nodeSetPanel:Node = null;

    @property(Node)
    fishContainer:Node = null;

    @property(Node)
    btnSetFish:Node = null;

    @property(Node)
    btnGetAllIncome:Node = null;

    
    @property(Node)
    btnClearPool:Node = null;

    @property(Node)
    btnClose:Node = null;


    @property(Node)
    paths:Node = null;

    
    @property(Node)
    swimingFishContainer:Node = null;
    

    isAddListener:boolean = false;


    fishMap:Map<string,number> = new Map();

    swimingFishMap:Map<string,Node[]> = new Map();

    fishSpeed:number = 300;


    init(){
        if(!this.isAddListener){
            this.addListener();
        }

        this.updateIncome();
        this.onCloseSetPanel();
        this.UI_Update_Money();
        this.btnShowSetPanel.getComponent(Animation).play('shake');
                  ProjectEventManager.emit(ProjectEvent.弹出窗口, "修勾钓鱼");
    }


    showSetPanel(){
        this.btnShowSetPanel.getComponent(Animation).play("stop");
        this.fishMap.clear();
        this.fishContainer.children.forEach((child,idx) => {
           if(idx !== 0){
                child.destroy();
           }
           else{
                child.active = false;
           }
        });
        let allSaveFishDate = XGDY_DataManager.Instance.saveData.fishData;

        Object.keys(allSaveFishDate).forEach(key => {
            let fishId = key;
            let fishCount = allSaveFishDate[fishId];
            if(fishCount > 0){
                let item = instantiate(this.fishContainer.children[0]);
                item.parent = this.fishContainer;
                item.active = true;
                item.name

                let lblRemain = item.getChildByName("lblRemain").getComponent(Label);
                lblRemain.string = "库存："+fishCount.toString();

                let lblCount = item.getChildByName("lblCount").getComponent(Label);
                lblCount.string = "0";
                this.fishMap.set(fishId,0);

                let lblIncomePerMinute = item.getChildByName("lblIncomePerMinute").getComponent(Label);
                let fishLevel = fishId.split("_")[1];
                lblIncomePerMinute.string = "每分钟收益："+(XGDY_Constant.fishLevelIncomePerMinute[parseInt(fishLevel)]).toString()+"金币";

                let spMap = item.getChildByName("icon").getComponent(Sprite);
                 XGDY_LoadManager.Instance.getFishIconById(fishId, (frame) => {
                    if (!frame) return;
                    spMap.spriteFrame = frame;
                    let id = parseInt(fishId.split("_")[1]);
                    let idx2 = parseInt(fishId.split("_")[2]);
                    if(id>=4 && id<8){
                        item.getChildByName("icon").eulerAngles = v3(0,0,90);
                            let scale = 150/spMap.spriteFrame.height;
                            
                        item.getChildByName("icon").setScale(scale,scale);
                    }
                    else{
                            let scale = 150/spMap.spriteFrame.width;
                            if(id ===0 ){
                                if(idx2 === 4||idx2 === 5){
                                    scale = 0.25;
                                }
                            }
                            if(id ===8 ){
                                if(idx2 === 0||idx2 === 1 ||idx2 === 3||idx2 === 4){
                                    scale = 0.15;
                                }
                                if(idx2 === 2){
                                    scale = 0.07;
                                }
                            }
                        item.getChildByName("icon").setScale(scale,scale);
                    }
                });




                let btnAdd = item.getChildByName("btnAdd");
                let btnSub = item.getChildByName("btnSub");
                btnAdd.off("click");
                btnAdd.on("click",()=>{
                    let currentCount = parseInt(lblCount.string);
                    if(currentCount < fishCount){
                        currentCount++;
                        lblCount.string = currentCount.toString();
                        this.fishMap.set(fishId,currentCount);
                    }
                },this);
                btnSub.off("click");
                btnSub.on("click",()=>{
                    let currentCount = parseInt(lblCount.string);
                    if(currentCount > 0){
                        currentCount--;
                        lblCount.string = currentCount.toString();
                        this.fishMap.set(fishId,currentCount);
                    }
                },this);
            }
        });

        this.nodeSetPanel.active = true;
    }

    onClickSetFish(){
        let poolFish = XGDY_DataManager.Instance.saveData.poolFishes;
        this.fishMap.forEach((value,key) => {
            if(!poolFish[key]){
                poolFish[key] = value;
            }
            else{
                poolFish[key] += value;

            }
            XGDY_DataManager.Instance.saveData.itemData[key] -= value;
            XGDY_DataManager.Instance.saveData.fishData[key] -= value;
        });
        XGDY_DataManager.Instance.saveData.poolFishes = poolFish;
            //更新总价值
            XGDY_DataManager.Instance.dynamicData.currentFishesValue =XGDY_DataManager.Instance.calculateTotalFishValue();
            EventManager.Scene.emit(XGDY_GameEvents.UI_Update_Value);
        XGDY_DataManager.Instance.saveToStorage();
        this.onCloseSetPanel();
    }


    onCloseSetPanel(){
        this.nodeSetPanel.active = false;
    }


    onClearPool(){
        let poolFish = XGDY_DataManager.Instance.saveData.poolFishes;
        // this.fishMap.forEach((value,key) => {
        //     if(poolFish[key]){
        //         poolFish[key] = 0;
        //         XGDY_DataManager.Instance.saveData.itemData[key] += value;
        //         XGDY_DataManager.Instance.saveData.fishData[key] += value;
        //     }
        // });

        Object.keys(poolFish).forEach((key) => {
            let value = poolFish[key];
            XGDY_DataManager.Instance.saveData.itemData[key] += value;
            XGDY_DataManager.Instance.saveData.fishData[key] += value;
            poolFish[key] = 0;
        });

        this.fishMap.clear();


        XGDY_DataManager.Instance.saveData.poolFishes = poolFish;

        EventManager.Scene.emit(XGDY_GameEvents.Show_Tip,"鱼已放回鱼店");
            //更新总价值
        XGDY_DataManager.Instance.dynamicData.currentFishesValue =XGDY_DataManager.Instance.calculateTotalFishValue();
        EventManager.Scene.emit(XGDY_GameEvents.UI_Update_Value);

        XGDY_DataManager.Instance.saveToStorage();

        let allFishNode = [];
        this.swimingFishMap.forEach((value,key) => {
            value.forEach((fishNode) => {
                // if(fishNode && fishNode.isValid){
                    allFishNode.push(fishNode);
                // }
            });
        });

        while(allFishNode.length > 0){
            let fishNode = allFishNode.pop();
            if(fishNode && fishNode.isValid){
                fishNode.getComponent(XGDY_SwimingFish).destoryFish();
            }
        }
       
        this.swimingFishMap.clear();
        this.onCloseSetPanel();
    }


    onbtnGetAllIncome(){
        XGDY_DataManager.Instance.saveData.itemData[XGDY_ItemType.Coin] += XGDY_DataManager.Instance.saveData.addIncome;
        XGDY_DataManager.Instance.saveData.addIncome = 0;
        XGDY_DataManager.Instance.saveToStorage();
        EventManager.Scene.emit(XGDY_GameEvents.UI_Update_Money);
        EventManager.Scene.emit(XGDY_GameEvents.Show_Tip,"已获取所有收益");
        this.updateIncome();
    }


    updateIncome(){
        if(!XGDY_DataManager.Instance.saveData.addIncome){
            XGDY_DataManager.Instance.saveData.addIncome = 0;
        }
        let money = XGDY_DataManager.Instance.saveData.addIncome;
        let displayMoney: string;
        
        if (money >= 100000000) {
            // 超过亿时转换为亿单位并保留1位小数
            displayMoney = (money / 100000000).toFixed(1) + "亿";
        } else if (money >= 10000) {
            // 超过万时转换为万单位并保留1位小数
            displayMoney = (money / 10000).toFixed(1) + "万";
        } else {
            // 保留1位小数
            displayMoney = money.toFixed(0);
        }
                
        this.lblIncome.string = "累计收益：" + displayMoney + "金币";
    }


    update(dt){
        this.updateFishAnim(dt);
    }

    // 鱼 swim 动画
    randomTime:number = 0.3;
    passTime:number = 0;
    updateFishAnim(dt){
        this.passTime += dt;
        if(this.passTime >= this.randomTime){
            this.passTime = 0;
            this.randomTime = Math.random() * 1 + 1;

            

          let poolFish = XGDY_DataManager.Instance.saveData.poolFishes;
          let selectedFish:string = null;
          let poolFishIds = Object.keys(poolFish);
          let randomIdx = Math.floor(Math.random() * poolFishIds.length);
          let key = poolFishIds[randomIdx];
            // poolFishIds.forEach((key) => {
            //     if(!selectedFish){
                    let count = poolFish[key];
                    if(!this.swimingFishMap.has(key)){
                        this.swimingFishMap.set(key,[]);
                    }
                    if(count > 0 && this.swimingFishMap.get(key).length < count){
                        selectedFish = key;
                        let randomPath = this.paths.children[Math.floor(Math.random() * this.paths.children.length)];
                        let startNode = randomPath.children[Math.floor(Math.random() * randomPath.children.length)]
                        //randomPath共两个节点，选取另一个作为结束点
                        let endNode = randomPath.children[1 - Math.floor(Math.random() * randomPath.children.length)];
                        let fishNode = instantiate(this.swimingFishContainer.children[0]);
                        fishNode.setParent(this.swimingFishContainer);
                        fishNode.setWorldPosition(startNode.worldPosition);
                        fishNode.active = true;

                        XGDY_LoadManager.Instance.getFishIconById(selectedFish, (frame) => {
                            if (!frame){
                                console.error(`【鱼图标】${selectedFish} 缺少图标，无法显示！`);
                                return;
                            } 
                        
                            fishNode.getChildByName("sp").getComponent(Sprite).sizeMode = Sprite.SizeMode.RAW;
                            fishNode.getChildByName("sp").getComponent(Sprite).spriteFrame = frame;

                            let id = parseInt(selectedFish.split("_")[1]);
                            let idx2 = parseInt(selectedFish.split("_")[2]);
                            if(id>=4 && id<=8){
                                fishNode.getChildByName("sp").eulerAngles = v3(0,0,90);
                                    // let scale = 150/frame.height;
                                
                                // fishNode.getChildByName("sp").setScale(scale,scale);
                            }
                            else{
                                // let scale = 150/frame.width;
                                // if(id ===0 ){
                                //     if(idx2 === 4||idx2 === 5){
                                //         scale = 0.25;
                                //     }
                                // }
                                // if(id ===8 ){
                                //     if(idx2 === 0||idx2 === 1 ||idx2 === 3||idx2 === 4){
                                //         scale = 0.15;
                                //     }
                                //     if(idx2 === 2){
                                //         scale = 0.07;
                                //     }
                                // }
                                // fishNode.getChildByName("sp").setScale(scale,scale);
                            }
                            
                            this.swimingFishMap.get(key).push(fishNode);
                      
                            fishNode.getComponent(XGDY_SwimingFish).init(startNode.worldPosition,endNode.worldPosition,() => {
                                console.log("鱼到达终点");
                                if(this.swimingFishMap.has(key)){
                                    this.swimingFishMap.get(key).splice(this.swimingFishMap.get(key).indexOf(fishNode),1);
                                }
                                console.log("鱼到达终点后，剩余鱼数",this.swimingFishMap.get(key).length);
                            });
                        });

                      

                        // //设置鱼的方向
                        // fishNode.setRotationFromUnitVectors(new Vec3(1,0,0),direction);
                      
           

                        // // 保存目标点
                        // let targetWorldPos = endNode.worldPosition;
                        // let startWorldPos = startNode.worldPosition;
                        // let moveDir = new Vec3();
                        // // 计算从起点到终点的单位移动方向
                        // Vec3.subtract(moveDir, targetWorldPos, startWorldPos);
                        // Vec3.normalize(moveDir, moveDir);
                
                        // // 车辆朝向目标点（车头朝前）
                        // fishNode.lookAt(targetWorldPos);
                        // fishNode.eulerAngles = new Vec3(0, fishNode.eulerAngles.y-180, 0);
                        // //核心：给刚体设置【线性速度】，物理驱动移动，替代原来的坐标修改
                        // fishNode.getComponent(RigidBody).setLinearVelocity(moveDir.multiplyScalar(this.fishSpeed));
                    }
            //     }
            // });
        }
    }

    onClickClose(){
        this.node.active = false;
    }

      
    UI_Update_Money(){
        let money = XGDY_DataManager.Instance.saveData.itemData[XGDY_ItemType.Coin];
        let displayMoney: string;
        
        if (money >= 100000000) {
            // 超过亿时转换为亿单位并保留1位小数
            displayMoney = (money / 100000000).toFixed(1) + "亿";
        } else if (money >= 10000) {
            // 超过万时转换为万单位并保留1位小数
            displayMoney = (money / 10000).toFixed(1) + "万";
        } else {
            // 保留1位小数
            displayMoney = money.toFixed(0);
        }
        
        this.lblMoney.string = displayMoney;
    }

    onAddMoneyClick(){
        EventManager.Scene.emit(XGDY_GameEvents.UI_SHOW_ADD_MONEY_PANEL);
    }
    

    addListener(){
        this.isAddListener = true;
        this.btnShowSetPanel.on("click",this.showSetPanel,this)
        this.btnCloseSetPanel.on("click",this.onCloseSetPanel,this);
        this.btnSetFish.on("click",this.onClickSetFish,this);
        this.btnClose.on("click",this.onClickClose,this);
        this.btnGetAllIncome.on("click",this.onbtnGetAllIncome,this);
        this.btnClearPool.on("click",this.onClearPool,this);
        this.btnAddMoney.on("click", this.onAddMoneyClick, this);
        

        EventManager.on(XGDY_GameEvents.UI_Update_Income,this.updateIncome,this);
        EventManager.on(XGDY_GameEvents.UI_Update_Money,this.UI_Update_Money,this);
    }

  
    removeListener(){
        EventManager.off(XGDY_GameEvents.UI_Update_Income,this.updateIncome,this);
        EventManager.off(XGDY_GameEvents.UI_Update_Money,this.UI_Update_Money,this);
    }

    protected onDestroy(): void {
        this.removeListener();
    }
}


