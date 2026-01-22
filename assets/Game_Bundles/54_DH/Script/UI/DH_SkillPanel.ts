import { _decorator, Button, Component, instantiate, Label, Node, Sprite, v3 } from 'cc';
import { DH_AnglerJsonData, DH_DataManager, DH_FishJsonData, DH_SkillJsonData } from '../Manager/DH_DataManager';
import { DH_LoadManager } from '../Manager/DH_LoadManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
const { ccclass, property } = _decorator;

@ccclass('DH_SkillPanel')
export class DH_SkillPanel extends Component {
    isAddListener:boolean = false;

    @property(Node)
    btnContainer:Node = null;

    @property(Node)
    itemContainer:Node = null;

    @property(Node) 
    mapItem: Node = null!;  


    @property(Node)
    btn_0:Node = null;
    @property(Node)
    btn_1:Node = null;

    @property(Node)
    btn_2:Node = null;

    @property(Node)
    btn_3:Node = null;

     @property(Node)
    btn_4:Node = null;


    // @property(Node)
    // btnAllSole:Node = null;

    
    @property(Node)
    btnClose:Node = null;

       
    @property(Node)
    btnLeft:Node = null;

    @property(Node)
    btnRight:Node = null;

    currentAllSkillData:any;

    currentSkillTypeData:{[key:string]:DH_SkillJsonData} = {};

    idx:number = 0;

    currentIdx_0:number;
    currentIdx_1:number;

    init(){
        if(!this.isAddListener){
            this.addListener();
        }

        this.currentAllSkillData = DH_DataManager.Instance.getAllSkillData();

        this.onBtnClick_0();
        // ProjectEventManager.emit(ProjectEvent.弹出窗口, "钓魂");
        
    }

    initList(id:number){
        this.updateBtnState();
        // this.itemContainer.children.forEach((node,idx)=>{
        //     if(idx !== 0){
        //         node.destroy();
        //     }
        //     else{
        //         node.active = false;
        //     }
        // })

        //  const allMapsDatas = DH_DataManager.Instance.getAllFishsData();
        //  let allMapsData = allMapsDatas[id.toString()];
        let ids = [this.currentIdx_0,this.currentIdx_1];
        ids.forEach((id,idx)=>{
        // let unLockSkillIds:string[] = [];
        // let anglerIds = DH_DataManager.Instance.getAllAnglersData().map((item)=>item.id);
        // anglerIds.forEach((anglerId)=>{
        //         let angerSaveData = DH_DataManager.Instance.saveData.anglerData[anglerId];
        //         let level = angerSaveData.level;
        //         let anglerData = DH_DataManager.Instance.getItemDataById(anglerId) as DH_AnglerJsonData;
        //         Object.keys(anglerData.技能列表).forEach((key)=>{
        //             let skillData = anglerData.技能列表[key];
        //             if(skillData<= level){
        //                 unLockSkillIds.push(key);
        //             }
        //         })
        //     })



            let skillId = "技能_"+this.idx+"_"+id;
            this.itemContainer.children[idx].active = true;
                   let skillData = DH_DataManager.Instance.getItemDataById(skillId) as DH_SkillJsonData;
            if(!skillData){
                skillData = {} as DH_SkillJsonData;
                this.itemContainer.children[idx].active = false;
                return;
            }
       
                let fishItem = this.itemContainer.children[idx];
      
                const skillSaveData = DH_DataManager.Instance.saveData.skillData;
                let skillLv = skillSaveData[skillId] || 0;
 
                let skillLvData = skillData.等级配置[skillLv] ;

                let lblName =  fishItem.getChildByName("lblName").getComponent(Label);
                let icon =  fishItem.getChildByName("Icon").getComponent(Sprite);
                let lblHealthCost =  fishItem.getChildByName("lblHealthCost").getComponent(Label);
                let lblForce =  fishItem.getChildByName("Node").getChildByName("lblForce").getComponent(Label);
                let lblDamage =  fishItem.getChildByName("Node").getChildByName("lblDamage").getComponent(Label);
                let lblAngrels =  fishItem.getChildByName("lblAngrels").getComponent(Label);
                let lblLimit =  fishItem.getChildByName("lblLimit").getComponent(Label);
                let lblPrice =  fishItem.getChildByName("lblPrice").getComponent(Label);

                let btnUpgrade =  fishItem.getChildByName("btnUpgrade")
                let lblNo =  fishItem.getChildByName("lblNo");

                lblName.string = skillData.名称 ;
                lblHealthCost.string = "体力消耗："+skillLvData.体力消耗.toFixed(0);
                lblForce.string = "拉力："+skillLvData.拉力.toFixed(0);
                lblDamage.string = "总伤："+skillLvData.总伤.toFixed(0);
                
                let string = "";
                skillData.钓友id.forEach((id)=>{
                    let itemId = DH_DataManager.Instance.getItemDataById(id);
                    string += itemId.名称+" ";
                })
                lblAngrels.string = "可施展钓友:"+string;

                // let limitId = skillData.解锁条件[0].解锁物品id
                // let limitItem = DH_DataManager.Instance.getItemDataById(limitId);
                let lblLevel =  fishItem.getChildByName("lblLevel").getComponent(Label);
                lblLevel.string = "等级："+skillLv.toFixed(0);
                lblLimit.string ="解锁条件：" + skillData.解锁描述;
                lblPrice.string ="升级价格：" + skillLvData.下一等级解锁价格.toFixed(0);
                lblPrice.node.active = skillLvData.下一等级解锁价格 > 0;
                btnUpgrade.active = DH_DataManager.Instance.saveData.skillData[skillId] && DH_DataManager.Instance.saveData.skillData[skillId] < skillData.等级配置.length - 1;
                lblNo.active =!DH_DataManager.Instance.saveData.skillData[skillId] ;
                let 勾 =  fishItem.getChildByName("勾");
                勾.active = btnUpgrade.active;
                DH_LoadManager.Instance.getSkillIconById(skillId, (frame) => {
                    if (!frame) return;
                    icon.spriteFrame = frame;    
                });
                btnUpgrade.off("click");
                btnUpgrade.on("click",()=>this.onBtnUpgradeClick(skillId),this);
        })
    }

    onBtnUpgradeClick(skillId:string){
        DH_DataManager.Instance.upgradeSkill(skillId);
        this.initList(this.idx);
    }

    updateBtnState(){
        this.btnLeft.active = this.currentIdx_0 > 0;
        this.btnRight.active = this.currentIdx_1 < Object.keys(this.currentSkillTypeData).length-1;
    }

    onBtnLeftClick(){
        if(this.currentIdx_0 > 0){
            this.currentIdx_0--;
            this.currentIdx_1--;
            this.initList(this.idx);
        
        }
    }

    onBtnRightClick(){
        if(this.currentIdx_1 < Object.keys(this.currentSkillTypeData).length-1){
            this.currentIdx_0++;
            this.currentIdx_1++;
            this.initList(this.idx);
        }
    }


    // onFishItemClick(fishId:string){
    //     DH_DataManager.Instance.(fishId);
    //     this.initList(this.idx);
    // }

    onBtnClick_0(){
        this.idx = 0;
        this.currentIdx_0 = 0;
        this.currentIdx_1 = 1;
                this.currentSkillTypeData = this.currentAllSkillData["0"];
        this.initList(0);
                this.btnContainer.children.forEach((node,idx)=>{
            node.getChildByName("selected").active = idx === this.idx;
        })

    }

    onBtnClick_1(){
        this.idx = 1;
                this.currentIdx_0 = 0;
        this.currentIdx_1 = 1;
        this.currentSkillTypeData = this.currentAllSkillData["1"];
        this.initList(1);
                this.btnContainer.children.forEach((node,idx)=>{
            node.getChildByName("selected").active = idx === this.idx;
        })
    }

    onBtnClick_2(){
        this.idx = 2;
                this.currentIdx_0 = 0;
        this.currentIdx_1 = 1;
        this.currentSkillTypeData = this.currentAllSkillData["2"];
        this.initList(2);
                this.btnContainer.children.forEach((node,idx)=>{
            node.getChildByName("selected").active = idx === this.idx;
        })
    }
    onBtnClick_3(){
        this.idx = 3;
                this.currentIdx_0 = 0;
        this.currentIdx_1 = 1;
        this.currentSkillTypeData = this.currentAllSkillData["3"];
        this.initList(3);
                this.btnContainer.children.forEach((node,idx)=>{
            node.getChildByName("selected").active = idx === this.idx;
        })
    }
    onBtnClick_4(){
        this.idx = 4;
                this.currentIdx_0 = 0;
        this.currentIdx_1 = 1;
        this.currentSkillTypeData = this.currentAllSkillData["4"];
        this.initList(4);
                this.btnContainer.children.forEach((node,idx)=>{
            node.getChildByName("selected").active = idx === this.idx;
        })
    }


    // onAllSoleClick(){
    //     DH_DataManager.Instance.sellAllFishes();
    //     this.initList(0);
    // }

    onBtnCloseClick(){

        this.node.active = false;
    }
    
        addListener(){
            this.isAddListener = true;

            // this.btnAllSole.on("click", this.onAllSoleClick, this);
            this.btnClose.on("click", this.onBtnCloseClick, this);
             this.btnLeft.on("click", this.onBtnLeftClick, this);
             this.btnRight.on("click", this.onBtnRightClick, this);

            this.btn_0.on("click", this.onBtnClick_0, this);
            this.btn_1.on("click", this.onBtnClick_1, this);
            this.btn_2.on("click", this.onBtnClick_2, this);
            this.btn_3.on("click", this.onBtnClick_3, this);
            this.btn_4.on("click", this.onBtnClick_4, this);

        }
    
      
        removeListener(){

    
    
    
        }
    
        protected onDestroy(): void {
            this.removeListener();
        }

}


