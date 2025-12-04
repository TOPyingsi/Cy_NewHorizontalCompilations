import { _decorator, AudioClip, Component, director, instantiate, Label, Layout, Node, Prefab } from 'cc';
import { SLYZ_CardHolder } from './SLYZ_CardHolder';
import { SLYZ_UIControl } from './SLYZ_UIControl';
import { SLYZ_AudioManager } from './SLYZ_AudioManager';
import Banner from 'db://assets/Scripts/Banner';
const { ccclass, property } = _decorator;

@ccclass('SLYZ_Cassette')
export class SLYZ_Cassette extends Component {
    @property(AudioClip)
    private cassetteSound:AudioClip=null;
    @property(Prefab)
    private cardHolderPrefab:Prefab=null;
    public currentIndex: number = 0;
    private CardHolders:Node[]=[];
    private cardID:number=0;
    private baodi:boolean=false;
    public isSelected:boolean=false;
    private cardData:number[]=[];
    start() {
        const setCoin=this.node.parent.getComponent(SLYZ_UIControl).setCoin;
        this.node.getChildByName("结算按钮层").getChildByName("再来一次").getChildByName("金币值").getComponent(Label).string=setCoin.toString();
    }

    update(deltaTime: number) {
        
    }

    cassetteDataSpawn(id){
        if(id==1){
            this.scheduleOnce(()=>{
                this.node.getChildByName("抽卡页面背景暗").active=true;
                this.node.getChildByName("Node").getChildByName("普通卡盒").active=true;
            },0.8); 
            this.scheduleOnce(()=>{
                this.node.getChildByName("抽卡").getChildByName("卡包生成点").active=true;
                this.CarHolderSpawn(id);
                this.node.getChildByName("按钮层").active=true;
            },1.8); 
        }
        if(id==2){
            this.scheduleOnce(()=>{
                this.node.getChildByName("抽卡页面背景暗").active=true;
                this.node.getChildByName("Node").getChildByName("高级卡盒").active=true;
            },0.8);
            this.scheduleOnce(()=>{
                this.node.getChildByName("抽卡").getChildByName("卡包生成点").active=true;
                this.CarHolderSpawn(id);
                this.node.getChildByName("按钮层").active=true;
            },2); 
        }
    }

    CarHolderSpawn(id){
        this.CardHolders = [];
        for(let i=0;i<5;i++){
            let cardHolder=instantiate(this.cardHolderPrefab);
            this.node.getChildByName("抽卡").getChildByName("卡包生成点").addChild(cardHolder);
            switch(id){
                case 1:
                    this.cardID = this.drawCassette();
                    break;
                case 2:
                    this.cardID = this.drawCassetteOne();
                    break;
            }
            cardHolder.getComponent(SLYZ_CardHolder).drawCardHolder(this.cardID);
            this.CardHolders.push(cardHolder);
            this.node.getChildByName("抽卡").getChildByName("卡包生成点").getComponent(Layout).updateLayout();
            // console.log(this.cardID);
        }
    }

    drawCassette(){
        const random = Math.random();
        const weights = [0.6, 0.8, 0.9, 0.96, 1]; 
        for (let i = 0; i < weights.length; i++) {
            if (random <= weights[i]) {
                return i;
            }
        }
        return 0
    }
    drawCassetteOne(){
        if(!this.baodi){
        this.baodi=true;
        const random = Math.random();
        const weights = [0, 0, 0, 0, 1]; 
        for (let i = 0; i < weights.length; i++) {
            if (random <= weights[i]) {
                return i;
            }
        }
        }
        const random = Math.random();
        const weights = [0.6, 0.8, 0.9, 0.96, 1]; 
        for (let i = 0; i < weights.length; i++) {
            if (random <= weights[i]) {
                return i;
            }
        }
        return 0
    }

    cardHolderSelect(selectedHolder: Node){
        this.node.getChildByName("按钮层").active=false;
        this.node.getChildByName("抽卡").getChildByName("卡包结算点").addChild(selectedHolder);
        this.CardHolders.forEach(holder => {
            if(holder !== selectedHolder) {
                holder.destroy();
            }
        });
        this.CardHolders = [selectedHolder];
        this.isSelected=true;

    }
    cardHolderAllGet(){
        Banner.Instance.ShowVideoAd(()=>{
            SLYZ_AudioManager.instance.playSound(this.cassetteSound);
            this.node.getChildByName("按钮层").active=false;
            const settlement = this.node.getChildByName("抽卡").getChildByName("卡包结算点");
            this.CardHolders.forEach(holder => {
                holder.removeFromParent();
                settlement.addChild(holder);
                holder.active = false;
            });
            this.currentIndex = 0;
            this.showNextCard();
        })
    }
   

    showNextCard() {
        if (this.currentIndex < this.CardHolders.length) {
            const currentHolder = this.CardHolders[this.currentIndex];
            currentHolder.active = true;
            currentHolder.getComponent(SLYZ_CardHolder).isAllGet=true;
            currentHolder.getComponent(SLYZ_CardHolder).onTouchCardHolder();
            this.currentIndex++;
            //console.log(this.currentIndex);
            
        }
    }

    showNextBtn(){
        this.node.getChildByName("结算按钮层").active=true;
    }

    Next(){

        this.node.parent.getComponent(SLYZ_UIControl).cardBookOpen();
        director.emit("cardBookOpen");
        this.node.destroy();
        

    }

    oneMore(){
        SLYZ_AudioManager.instance.playSound(this.cassetteSound);
        this.node.parent.getComponent(SLYZ_UIControl).ordinarySpawn();
        this.node.destroy();
    }

}


