import { _decorator, Button, Component, instantiate, Label, Node, Sprite, v3 } from 'cc';
import { XGDY_AnglerJsonData, XGDY_DataManager, XGDY_FishJsonData, XGDY_ItemType, XGDY_SkillJsonData } from '../Manager/XGDY_DataManager';
import { XGDY_LoadManager } from '../Manager/XGDY_LoadManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XGDY_GameEvents } from '../Common/XGDY_GameEvents';
const { ccclass, property } = _decorator;

@ccclass('XGDY_SkillPanel')
export class XGDY_SkillPanel extends Component {
    isAddListener:boolean = false;

    @property(Node)
    btnContainer:Node = null;

    // @property(Node)
    // itemContainer:Node = null;

    // @property(Node) 
    // mapItem: Node = null!;  



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

    @property(Node)
    skillContainer:Node = null;
    
    @property(Node)
    btnClose:Node = null;


    @property(Label) 
    lblMoney:Label = null;

    @property(Node)
    btnAddMoney:Node = null;
    





       
    // @property(Node)
    // btnLeft:Node = null;

    // @property(Node)
    // btnRight:Node = null;

    currentAllSkillData:any;

    currentSkillTypeData:{[key:string]:XGDY_SkillJsonData} = {};

    idx:number = 0;


    init(){
        if(!this.isAddListener){
            this.addListener();
        }

        this.currentAllSkillData = XGDY_DataManager.Instance.getAllSkillData();

        this.onBtnSkillTypeClick(0);
        this.UI_Update_Money();
          ProjectEventManager.emit(ProjectEvent.弹出窗口, "修勾钓鱼");
        
    }

    initList(skillTypeId:number){
        // this.updateBtnState();
        const allSkillData = XGDY_DataManager.Instance.getAllSkillData();
        this.skillContainer.children.forEach((node,idx)=>{
            let skillId = node.name;
            let skillItem = node;
            let itemSkillTypeId = skillId.split("_")[1];

            let skillTypeData = allSkillData[node.name.split("_")[1]];
            let skillData = skillTypeData[node.name.split("_")[2]] as XGDY_SkillJsonData;
           
            const skillSaveData = XGDY_DataManager.Instance.saveData.skillData;
            let skillLv = skillSaveData[skillId] || 0;

            let skillLvData = skillData.等级配置[skillLv] ;

            let lblName =  skillItem.getChildByName("lblName").getComponent(Label);
            let icon =  skillItem.getChildByName("Icon").getComponent(Sprite);
            let lblDamage =  skillItem.getChildByName("lblDamage").getComponent(Label);
            let lblForce =  skillItem.getChildByName("Node").getChildByName("lblForce").getComponent(Label);
            let lblHealthCost =  skillItem.getChildByName("Node").getChildByName("lblHealthCost").getComponent(Label);
            let lblAngrels =  skillItem.getChildByName("lblAngler").getComponent(Label);
            let lblLimit =  skillItem.getChildByName("lblLimit").getComponent(Label);
            let lblPrice =  skillItem.getChildByName("lblPrice").getComponent(Label);

            let btnUpgrade =  skillItem.getChildByName("btnUpgrade")
            let lblNo =  skillItem.getChildByName("lblNo");

            lblName.string = skillData.名称 ;
            lblHealthCost.string = "体力消耗："+skillLvData.体力消耗.toFixed(0);
            lblForce.string = "拉力："+skillLvData.拉力.toFixed(0);
            lblDamage.string = "总伤："+skillLvData.总伤.toFixed(0);
            
            let string = "";
            // skillData.钓友id.forEach((id)=>{
            //     let itemId = XGDY_DataManager.Instance.getItemDataById(id);
            //     string += itemId.名称+" ";
            // })
            let itemId = XGDY_DataManager.Instance.getItemDataById(skillData.钓友id[0]);
            string += itemId.名称+" ";
            lblAngrels.string = ""+string;

            let lblLevel =  skillItem.getChildByName("lblLevel").getComponent(Label);
            lblLevel.string = "等级："+skillLv.toFixed(0);
            lblLevel.node.active = skillLv > 0;
            lblLimit.string ="解锁条件：" + skillData.解锁描述;
            lblPrice.string ="升级价格：" + skillLvData.下一等级解锁价格.toFixed(0);
            lblPrice.node.active = skillLvData.下一等级解锁价格 > 0;
            btnUpgrade.active = XGDY_DataManager.Instance.saveData.skillData[skillId] && XGDY_DataManager.Instance.saveData.skillData[skillId] < skillData.等级配置.length - 1;
            lblNo.active =!XGDY_DataManager.Instance.saveData.skillData[skillId] ;
            // let 勾 =  skillItem.getChildByName("勾");
            // 勾.active = btnUpgrade.active;
            XGDY_LoadManager.Instance.getSkillIconById(skillId, (frame) => {
                if (!frame) return;
                icon.spriteFrame = frame;    
            });
            btnUpgrade.off("click");
            btnUpgrade.on("click",()=>this.onBtnUpgradeClick(skillId),this);

            node.active = itemSkillTypeId == skillTypeId.toString();
        })
    }

    onBtnUpgradeClick(skillId:string){
        XGDY_DataManager.Instance.upgradeSkill(skillId);
        this.initList(this.idx);
    }

    // updateBtnState(){
    //     this.btnLeft.active = this.currentIdx_0 > 0;
    //     this.btnRight.active = this.currentIdx_1 < Object.keys(this.currentSkillTypeData).length-1;
    // }

//    onBtnLeftClick(){
//         if(this.currentIdx_0-1 > 0){
//             this.currentIdx_0-=2;
//             this.currentIdx_1-=2;
//             this.initList(this.idx);
//         }
//         else if(this.currentIdx_0-1 === 0){
//             this.currentIdx_0 = 0;
//             this.currentIdx_1 = 1;
//             this.initList(this.idx);
//         }
//     }

//     onBtnRightClick(){
//         if(this.currentIdx_1+1 < Object.keys(this.currentSkillTypeData).length-1){
//             this.currentIdx_0+=2;
//             this.currentIdx_1+=2;
//             this.initList(this.idx);
//         }
//         else if(this.currentIdx_1+1 === Object.keys(this.currentSkillTypeData).length-1){
//             this.currentIdx_0 = this.currentIdx_1;
//             this.currentIdx_1 = this.currentIdx_1+1;
//             this.initList(this.idx);
//         }
//     }

    // onFishItemClick(fishId:string){
    //     XGDY_DataManager.Instance.(fishId);
    //     this.initList(this.idx);
    // }

    onBtnSkillTypeClick(skillTypeId:number){
        this.idx = skillTypeId;
        this.initList(skillTypeId);
        this.btnContainer.children.forEach((node,idx)=>{
            node.getChildByName("selected").active = idx === this.idx;
        })
    }


    onBtnCloseClick(){
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

        this.btnClose.on("click", this.onBtnCloseClick, this);


        this.btn_0.on("click", (node)=>{this.onBtnSkillTypeClick(0)}, this);
        this.btn_1.on("click", (node)=>{this.onBtnSkillTypeClick(1)}, this);
        this.btn_2.on("click", (node)=>{this.onBtnSkillTypeClick(2)}, this);
        this.btn_3.on("click", (node)=>{this.onBtnSkillTypeClick(3)}, this);
        this.btn_4.on("click", (node)=>{this.onBtnSkillTypeClick(4)}, this);

        this.btnAddMoney.on("click", this.onAddMoneyClick, this);
        EventManager.on(XGDY_GameEvents.UI_Update_Money,this.UI_Update_Money,this);

    }

    
    removeListener(){
        EventManager.off(XGDY_GameEvents.UI_Update_Money,this.UI_Update_Money,this);
    }

        protected onDestroy(): void {
            this.removeListener();
        }

}


