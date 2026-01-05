import { _decorator, Button, Color, Component, instantiate, Label, Node, Sprite, tween, v3 } from 'cc';
import { DH_DataManager, DH_FishJsonData } from '../Manager/DH_DataManager';
import { DH_LoadManager } from '../Manager/DH_LoadManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { DH_GameEvents } from '../Common/DH_GameEvents';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
const { ccclass, property } = _decorator;

@ccclass('DH_FishPanel')
export class DH_FishPanel extends Component {
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

    @property(Node)
    btn_5:Node = null;

    @property(Node)
    btn_6:Node = null;
        @property(Node)
    btn_7:Node = null;
        @property(Node)
    btn_8:Node = null;

    @property(Node)
    btnAllSell:Node = null;

    
    @property(Node)
    btnClose:Node = null;

    @property(Node)
    nodeTip:Node = null;

    @property(Node)
    btnTrue:Node = null;

    @property(Node)
    btnFalse:Node = null;

    @property(Label) 
    fishesValue:Label = null;




    idx:number = 0;

    init(){
        if(!this.isAddListener){
            this.addListener();
        }

        this.onBtnClick_0();

         this.nodeTip.active = false;

         this.updateValue();
        // ProjectEventManager.emit(ProjectEvent.弹出窗口, "钓魂");
       
    }

    showTip(){
        this.nodeTip.active = true;
        // this.nodeTip.setScale(v3(0,0,0));
        // tween(this.nodeTip)
        //     .to(0.2, { scale:v3(1,1,1)})
        //     .start();
    }

    hideTip(){
        // this.nodeTip.setScale(v3(1,1,1));
        //  tween(this.nodeTip)
        //     .to(0.2, { scale:v3(0,0,0)})
        //     .call(()=>{
                this.nodeTip.active = false;
            // })
            // .start();
    }

    initList(id:number){
        this.itemContainer.children.forEach((node,idx)=>{
            if(idx !== 0){
                node.destroy();
            }
            else{
                node.active = false;
            }
        })

         const allMapsDatas = DH_DataManager.Instance.getAllFishsData();
         let allFishesData = allMapsDatas[id.toString()];
                const fishSaveData = DH_DataManager.Instance.saveData.fishData;
                Object.keys(allFishesData).forEach((key,idx2) => {
                    let fishData = allFishesData[key] as DH_FishJsonData;
                    
                    let fishItem = instantiate(this.mapItem);
                    fishItem.parent = this.itemContainer;
                    fishItem.active = true;
        
                    let count = fishSaveData[fishData.id] || 0;
                    let weight = "";
                    // 处理重量显示,大于万斤以万斤为单位，大于亿斤以亿斤为单位
                    if(fishData.斤数 >= 100000000){
                        weight = (fishData.斤数/100000000).toFixed(1)+"亿斤";
                    }
                    else if(fishData.斤数 >= 10000){
                        weight = (fishData.斤数/10000).toFixed(1)+"万斤";
                    }
                    else{
                        weight = fishData.斤数.toFixed(0)+"斤";
                    }
                    fishItem.getChildByName("lblName").getComponent(Label).string = fishData.名称 +"_"+ weight;
                    fishItem.getChildByName("lblCount").getComponent(Label).string = "数量："+count;
                    fishItem.getChildByName("lblPrice").getComponent(Label).string = ""+fishData.单价.toFixed(0);
                    let spMap = fishItem.getChildByName("icon").getComponent(Sprite);
                    let btnSell = fishItem.getChildByName("btnSell");
                    btnSell.active = count > 0;
                    fishItem.getChildByName("Lock").active = !DH_DataManager.Instance.saveData.lockFishes.includes(fishData.id);
                    spMap.color = fishItem.getChildByName("Lock").active ?  new Color("000000"):new Color("FFFFFF");
                     DH_LoadManager.Instance.getFishIconById(fishData.id, (frame) => {
                        if (!frame) return;
                        spMap.spriteFrame = frame;
                        if(id>=4 && id<8){
                            fishItem.getChildByName("icon").eulerAngles = v3(0,0,90);
                                let scale = 150/spMap.spriteFrame.height;
                               
                            fishItem.getChildByName("icon").setScale(scale,scale);
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
                            fishItem.getChildByName("icon").setScale(scale,scale);
                        }
                        
                        
                    });
                    btnSell.off("click");
                    btnSell.on("click", () => this.onBtnSellClick(fishData.id));
                    // // 绑定角色项点击事件
                    // const btn = fishItem.getComponent(Button);
                    // btn.node.on("click", () => this.onFishItemClick(mapData.id));
                })
    }

    onBtnSellClick(fishId:string){
        DH_DataManager.Instance.sellFish(fishId);
        this.initList(this.idx);
    }


    // onFishItemClick(fishId:string){
    //     DH_DataManager.Instance.(fishId);
    //     this.initList(this.idx);
    // }

    onBtnClick_0(){
        this.idx = 0;
        this.initList(0);
                this.btnContainer.children.forEach((node,idx)=>{
            node.getChildByName("selected").active = idx === this.idx;
        })

    }

    onBtnClick_1(){
        this.idx = 1;
        this.initList(1);
                this.btnContainer.children.forEach((node,idx)=>{
            node.getChildByName("selected").active = idx === this.idx;
        })
    }

    onBtnClick_2(){
        this.idx = 2;
        this.initList(2);
                this.btnContainer.children.forEach((node,idx)=>{
            node.getChildByName("selected").active = idx === this.idx;
        })
    }
    onBtnClick_3(){
        this.idx = 3;
        this.initList(3);
                this.btnContainer.children.forEach((node,idx)=>{
            node.getChildByName("selected").active = idx === this.idx;
        })
    }
    onBtnClick_4(){
        this.idx = 4;
        this.initList(4);
                this.btnContainer.children.forEach((node,idx)=>{
            node.getChildByName("selected").active = idx === this.idx;
        })
    }
    onBtnClick_5(){
        this.idx = 5;
        this.initList(5);
                this.btnContainer.children.forEach((node,idx)=>{
            node.getChildByName("selected").active = idx === this.idx;
        })
    }
    onBtnClick_6(){
        this.idx = 6;
        this.initList(6);
                this.btnContainer.children.forEach((node,idx)=>{
            node.getChildByName("selected").active = idx === this.idx;
        })
    }
    onBtnClick_7(){
        this.idx = 7;
        this.initList(7);
                this.btnContainer.children.forEach((node,idx)=>{
            node.getChildByName("selected").active = idx === this.idx;
        })
    }
    onBtnClick_8(){
        this.idx = 8;
        this.initList(8);
                this.btnContainer.children.forEach((node,idx)=>{
            node.getChildByName("selected").active = idx === this.idx;
        })
    }


    updateValue(){
        this.fishesValue.string ="总价："+ DH_DataManager.Instance.dynamicData.currentFishesValue +"金币";
    }


    onAllSellClick(){
        this.showTip();
    }

    onBtnTrueClick(){
        DH_DataManager.Instance.sellAllFishes();
        this.initList(this.idx);
        this.hideTip();
    }

    onBtnFalseClick(){
        this.hideTip();
    }

    onBtnCloseClick(){

        this.node.active = false;
    }
    
        addListener(){
            this.isAddListener = true;

            this.btnAllSell.on("click", this.onAllSellClick, this);
            this.btnClose.on("click", this.onBtnCloseClick, this);

            this.btn_0.on("click", this.onBtnClick_0, this);
            this.btn_1.on("click", this.onBtnClick_1, this);
            this.btn_2.on("click", this.onBtnClick_2, this);
            this.btn_3.on("click", this.onBtnClick_3, this);
            this.btn_4.on("click", this.onBtnClick_4, this);
            this.btn_5.on("click", this.onBtnClick_5, this);
            this.btn_6.on("click", this.onBtnClick_6, this);
            this.btn_7.on("click", this.onBtnClick_7, this);
            this.btn_8.on("click", this.onBtnClick_8, this);

            this.btnTrue.on("click", this.onBtnTrueClick, this);
            this.btnFalse.on("click", this.onBtnFalseClick, this);

            EventManager.on(DH_GameEvents.UI_Update_Value,this.updateValue,this);

        }
    
      
        removeListener(){

            EventManager.off(DH_GameEvents.UI_Update_Value,this.updateValue,this);
        }
    
        protected onDestroy(): void {
            this.removeListener();
        }

}


