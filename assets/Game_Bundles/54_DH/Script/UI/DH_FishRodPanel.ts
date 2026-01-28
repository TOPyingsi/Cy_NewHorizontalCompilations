import { _decorator, Button, Component, instantiate, Label, Node, Sprite, v3 } from 'cc';
import { DH_DataManager, DH_FishingRodJsonData, DH_FishJsonData, DH_SkillJsonData } from '../Manager/DH_DataManager';
import { DH_LoadManager } from '../Manager/DH_LoadManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
const { ccclass, property } = _decorator;

@ccclass('DH_FishRodPanel')
export class DH_FishRodPanel extends Component {
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

    // @property(Node)
    // btn_2:Node = null;

    // @property(Node)
    // btn_3:Node = null;

    //  @property(Node)
    // btn_4:Node = null;

    // @property(Node)
    // btn_5:Node = null;

    @property(Node)
    btnAllSole:Node = null;

    
    @property(Node)
    btnClose:Node = null;

       
    @property(Node)
    btnLeft:Node = null;

    @property(Node)
    btnRight:Node = null;

    currentAllFishRodData:any;

    currentSkillTypeData:{[key:string]:DH_SkillJsonData} = {};

    idx:number = 0;

    currentIdx_0:number;
    currentIdx_1:number;

    init(){
        if(!this.isAddListener){
            this.addListener();
        }

        this.currentAllFishRodData = DH_DataManager.Instance.getAllFishRodData();
        this.currentSkillTypeData = this.currentAllFishRodData["0"];
        this.onBtnClick_0();
        ProjectEventManager.emit(ProjectEvent.弹出窗口, "钓魂");
        
    }

    initList(id:number){
        this.updateBtnState();
        let ids = [this.currentIdx_0,this.currentIdx_1];
        ids.forEach((id,idx)=>{
            let skillId = "钓竿_"+this.idx+"_"+id;
            this.itemContainer.children[idx].active = true;
            let fishRodData = DH_DataManager.Instance.getItemDataById(skillId) as DH_FishingRodJsonData;
            if(!fishRodData){
                fishRodData = {} as DH_FishingRodJsonData;
                this.itemContainer.children[idx].active = false;
                return;
            }
       
                let fishItem = this.itemContainer.children[idx];
      
                const skillSaveData = DH_DataManager.Instance.saveData.fishingRodData;
                // let skillLv = skillSaveData[skillId] || 0;
 

                let lblName =  fishItem.getChildByName("lblName").getComponent(Label);
                let icon =  fishItem.getChildByName("Icon").getComponent(Sprite);
                let lblLength =  fishItem.getChildByName("lblLength").getComponent(Label);
                let lblForce =  fishItem.getChildByName("Node").getChildByName("lblForce").getComponent(Label);
                let lblDamage =  fishItem.getChildByName("Node").getChildByName("lblDamage").getComponent(Label);
                // let lblAngrels =  fishItem.getChildByName("lblAngrels").getComponent(Label);
                let lblPrice =  fishItem.getChildByName("lblPrice").getComponent(Label);


                let btnUnLock =  fishItem.getChildByName("btnUnLock");
                let btnSet =  fishItem.getChildByName("btnSet");
                let setedNode =  fishItem.getChildByName("setedNode");

                lblName.string = fishRodData.名称 ;
                lblLength.string = "鱼线长度："+fishRodData.鱼线长度.toFixed(0);
                lblForce.string = "拉力："+fishRodData.拉力.toFixed(0);
                lblDamage.string = "秒伤："+fishRodData.秒伤.toFixed(0);
                // lblAngrels.string = "角度："+skillData.角度;
                lblPrice.string = "价格："+fishRodData.解锁价格.toFixed(0);

                btnUnLock.active = !skillSaveData[skillId]?.isUnlocked;
                btnSet.active = !skillSaveData[skillId]?.isEquipped && skillSaveData[skillId]?.isUnlocked;
                setedNode.active = skillSaveData[skillId]?.isEquipped;
                
                btnUnLock.getChildByName("video").active = this.idx === 1  && !skillSaveData[skillId]?.isUnlocked;
                if(this.idx === 1){
                    lblPrice.node.active = false;
                }
                else{
                    lblPrice.node.active = true;
                }
                
                
                // lblLimit.string ="解锁条件："+ skillData.解锁描述;
                DH_LoadManager.Instance.getFishingRodIconById(skillId, (frame) => {
                    if (!frame) return;
                    icon.node.eulerAngles = v3(0,0,60);
                    icon.spriteFrame = frame;
                    let scale = 300/frame.width;
                    icon.node.setScale(scale,scale);
                }); 

                btnUnLock.off("click");
                btnUnLock.on("click", () => {
                    this.btnUnlClick(skillId);
                })
                btnSet.off("click");
                btnSet.on("click", () => {
                    this.btnSetClick(skillId); 
                })
        })
    }

    btnUnlClick(skillId:string){
        DH_DataManager.Instance.getFishRod(skillId);
        this.initList(this.idx);
    }
    btnSetClick(skillId:string){
       DH_DataManager.Instance.changeRod(skillId);
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
        this.currentSkillTypeData = this.currentAllFishRodData["0"];
        this.initList(0);
                this.btnContainer.children.forEach((node,idx)=>{
            node.getChildByName("selected").active = idx === this.idx;
        })

    }

    onBtnClick_1(){
        this.idx = 1;
        this.currentIdx_0 = 0;
        this.currentIdx_1 = 1;
        this.currentSkillTypeData = this.currentAllFishRodData["1"];
        this.initList(1);
                this.btnContainer.children.forEach((node,idx)=>{
            node.getChildByName("selected").active = idx === this.idx;
        })
    }

    // onBtnClick_2(){
    //     this.idx = 2;
    //             this.currentIdx_0 = 0;
    //     this.currentIdx_1 = 1;
    //     this.currentSkillTypeData = this.currentAllSkillData["2"];
    //     this.initList(2);
    //             this.btnContainer.children.forEach((node,idx)=>{
    //         node.getChildByName("selected").active = idx === this.idx;
    //     })
    // }
    // onBtnClick_3(){
    //     this.idx = 3;
    //             this.currentIdx_0 = 0;
    //     this.currentIdx_1 = 1;
    //     this.currentSkillTypeData = this.currentAllSkillData["3"];
    //     this.initList(3);
    //             this.btnContainer.children.forEach((node,idx)=>{
    //         node.getChildByName("selected").active = idx === this.idx;
    //     })
    // }
    // onBtnClick_4(){
    //     this.idx = 4;
    //             this.currentIdx_0 = 0;
    //     this.currentIdx_1 = 1;
    //     this.currentSkillTypeData = this.currentAllSkillData["4"];
    //     this.initList(4);
    //             this.btnContainer.children.forEach((node,idx)=>{
    //         node.getChildByName("selected").active = idx === this.idx;
    //     })
    // }
    // onBtnClick_5(){
    //     this.idx = 5;
    //             this.currentIdx_0 = 0;
    //     this.currentIdx_1 = 1;
    //     this.currentSkillTypeData = this.currentAllSkillData["5"];
    //     this.initList(5);
    //             this.btnContainer.children.forEach((node,idx)=>{
    //         node.getChildByName("selected").active = idx === this.idx;
    //     })
    // }
    // onBtnClick_6(){
    //     this.idx = 6;
    //             this.currentIdx_0 = 0;
    //     this.currentIdx_1 = 1;
    //     this.currentSkillTypeData = this.currentAllSkillData["6"];
    //     this.initList(6);
    //             this.btnContainer.children.forEach((node,idx)=>{
    //         node.getChildByName("selected").active = idx === this.idx;
    //     })
    // }




    onAllSoleClick(){
        DH_DataManager.Instance.sellAllFishes();
        this.initList(0);
    }

    onBtnCloseClick(){

        this.node.active = false;
    }
    
        addListener(){
            this.isAddListener = true;

            this.btnAllSole.on("click", this.onAllSoleClick, this);
            this.btnClose.on("click", this.onBtnCloseClick, this);
             this.btnLeft.on("click", this.onBtnLeftClick, this);
             this.btnRight.on("click", this.onBtnRightClick, this);

            this.btn_0.on("click", this.onBtnClick_0, this);
            this.btn_1.on("click", this.onBtnClick_1, this);
            // this.btn_2.on("click", this.onBtnClick_2, this);
            // this.btn_3.on("click", this.onBtnClick_3, this);
            // this.btn_4.on("click", this.onBtnClick_4, this);
            // this.btn_5.on("click", this.onBtnClick_5, this);

        }
    
      
        removeListener(){

    
    
    
        }
    
        protected onDestroy(): void {
            this.removeListener();
        }

}


