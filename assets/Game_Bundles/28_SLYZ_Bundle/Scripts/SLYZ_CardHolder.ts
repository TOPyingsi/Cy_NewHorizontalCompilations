import { _decorator, AudioClip, Component, director, EventTouch, instantiate, JsonAsset, Node, Prefab, SkeletalAnimation, Skeleton, Sprite, SpriteFrame, tween, Vec2, Vec3 } from 'cc';
import { SLYZ_Card } from './SLYZ_Card';
import { SLYZ_Cassette } from './SLYZ_Cassette';
import { SLYZ_UIControl } from './SLYZ_UIControl';
import { SLYZ_AudioControl } from './SLYZ_AudioControl';
import { SLYZ_AudioManager } from './SLYZ_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('SLYZ_CardHolder')
export class SLYZ_CardHolder extends Component {
    @property(AudioClip)
    private sound:AudioClip=null;

   @property(Prefab)
   private cardPrefab:Prefab=null;
    private _cards:Node[]=[];
    private touchStartPos: Vec2 = new Vec2();
    private isSwiping = false;
    @property([SpriteFrame])
    private cardHolderCover: SpriteFrame[] = [];
    @property([SpriteFrame])
    private cardHolderTop: SpriteFrame[] = [];
    private cardOrder:number=0;

    private isSlider:boolean=false;
    private isTouch:boolean=false;

    private animationID:number=-1;
    public isAllGet:boolean=false;

    private cardID:number=0;

    private cardData:number[]=[];

    protected onLoad(): void {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }
    start() {
         
    }
    onDestroy() {
        this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    allCardSpawn(ID){
        for(let i=0;i<4;i++){
            director.emit("updateCard");
            let card=instantiate(this.cardPrefab);
            this.node.getChildByName("卡牌生成处").addChild(card);
            switch(ID){
                case 0:
                    this.cardID = this.drawCard();
                    break;
                case 1:
                    this.cardID = this.drawCardOne();
                    break;
                case 2:
                    this.cardID = this.drawCardTwo();
                    break;
                case 3:
                    this.cardID = this.drawCardThree();
                    break;
                case 4:
                    this.cardID = this.drawCardFour();
                    break;              
            }
            const rarityID = this.getRarityByCardId(this.cardID);
            card.getComponent(SLYZ_Card).cardSpawn(this.cardID, rarityID);
            card.getComponent(SLYZ_Card).cardDrawState();
            card.getComponent(SLYZ_Card).cardDataID=this.cardID;
            const AllCardData=this.node.parent.parent.parent.parent.getComponent(SLYZ_UIControl).cardData;
            // console.log(AllCardData);
            if(AllCardData[this.cardID]==1){
                  card.getComponent(SLYZ_Card).isHaveCard=true;
                  card.getComponent(SLYZ_Card).haveCard();
                } 
           
            this._cards.push(card);
            this.cardData.push(this.cardID);
        }
        this.node.getChildByName("卡牌生成处").active=false;
    }

    cardDataGet(){
        this.cardData.forEach(cardID => {
           return cardID;
        })
    }

    update(deltaTime: number) {
        
    }
    private drawCard(): number {
        const weights = [
            { start: 0, end: 19, weight: 0.9 / 20 },   
            { start: 20, end: 33, weight: 0.05 / 14 }, 
            { start: 34, end: 43, weight: 0.02 / 10 }, 
            { start: 44, end: 49, weight: 0.02 / 7 },  
            { start: 50, end: 53, weight: 0.01 / 4 }   
        ];
        const weightArray: number[] = [];
        for (const range of weights) {
            for (let i = range.start; i <= range.end; i++) {
                weightArray[i] = range.weight;
            }
        }
        const totalWeight = weightArray.reduce((sum, w) => sum + w, 0);
        let random = Math.random() * totalWeight;
        for (let i = 0; i < weightArray.length; i++){
            if (random < weightArray[i]) {
                return i;
            }
            random -= weightArray[i];
        }
        return 0; 
    }
    private drawCardOne(): number {
        const weights = [
            { start: 0, end: 19, weight: 0.3 / 20 },   
            { start: 20, end: 33, weight: 0.6 / 14 }, 
            { start: 34, end: 43, weight: 0.05 / 10 }, 
            { start: 44, end: 49, weight: 0.03 / 7 },  
            { start: 50, end: 53, weight: 0.02 / 4 }   
        ];
        const weightArray: number[] = [];
        for (const range of weights) {
            for (let i = range.start; i <= range.end; i++) {
                weightArray[i] = range.weight;
            }
        }
        const totalWeight = weightArray.reduce((sum, w) => sum + w, 0);
        let random = Math.random() * totalWeight;
        for (let i = 0; i < weightArray.length; i++){
            if (random < weightArray[i]) {
                return i;
            }
            random -= weightArray[i];
        }
        return 0; 
    }
    private drawCardTwo(): number {
        const weights = [
            { start: 0, end: 19, weight: 0.3 / 20 },   
            { start: 20, end: 33, weight: 0.3 / 14 }, 
            { start: 34, end: 43, weight: 0.35 / 10 }, 
            { start: 44, end: 49, weight: 0.03 / 7 },  
            { start: 50, end: 53, weight: 0.02 / 4 }   
        ];
        const weightArray: number[] = [];
        for (const range of weights) {
            for (let i = range.start; i <= range.end; i++) {
                weightArray[i] = range.weight;
            }
        }
        const totalWeight = weightArray.reduce((sum, w) => sum + w, 0);
        let random = Math.random() * totalWeight;
        for (let i = 0; i < weightArray.length; i++){
            if (random < weightArray[i]) {
                return i;
            }
            random -= weightArray[i];
        }
        return 0; 
    }
    private drawCardThree(): number {
        const weights = [
            { start: 0, end: 19, weight: 0.3 / 20 },   
            { start: 20, end: 33, weight: 0.3 / 14 }, 
            { start: 34, end: 43, weight: 0.05 / 10 }, 
            { start: 44, end: 49, weight: 0.23 / 7 },  
            { start: 50, end: 53, weight: 0.02 / 4 }   
        ];
        const weightArray: number[] = [];
        for (const range of weights) {
            for (let i = range.start; i <= range.end; i++) {
                weightArray[i] = range.weight;
            }
        }
        const totalWeight = weightArray.reduce((sum, w) => sum + w, 0);
        let random = Math.random() * totalWeight;
        for (let i = 0; i < weightArray.length; i++){
            if (random < weightArray[i]) {
                return i;
            }
            random -= weightArray[i];
        }
        return 0; 
    }
    private drawCardFour(): number {
        const weights = [
            { start: 0, end: 19, weight: 0.1 / 20 },   
            { start: 20, end: 33, weight: 0.1 / 14 }, 
            { start: 34, end: 43, weight: 0.3 / 10 }, 
            { start: 44, end: 49, weight: 0.4 / 7 },  
            { start: 50, end: 53, weight: 0.1 / 4 }   
        ];
        const weightArray: number[] = [];
        for (const range of weights) {
            for (let i = range.start; i <= range.end; i++) {
                weightArray[i] = range.weight;
            }
        }
        const totalWeight = weightArray.reduce((sum, w) => sum + w, 0);
        let random = Math.random() * totalWeight;
        for (let i = 0; i < weightArray.length; i++){
            if (random < weightArray[i]) {
                return i;
            }
            random -= weightArray[i];
        }
        return 0; 
    }
    
    private getRarityByCardId(cardId: number): number {
        if (cardId <= 19) return 0;
        if (cardId <= 33) return 1;    
        if (cardId <= 43) return 2;    
        if (cardId <= 49) return 3;    
        return 4;                     
    }


    cardSelect(){
        this.cardOrder++;
        if(this.cardOrder>=4){
            this.cardOrder=0;
            //console.log("卡牌抽取结束");
            this.node.active=false;
            const cassette=this.node.parent.parent.parent.getComponent(SLYZ_Cassette)
            if(cassette.currentIndex==5||cassette.isSelected){
                cassette.showNextBtn();
            }
            cassette.showNextCard();
        }
        
    }

    drawCardHolder(rarityID:number){
        this.node.getChildByName("卡包封面").getComponent(Sprite).spriteFrame=this.cardHolderCover[rarityID];
        this.node.getChildByName("卡包封面").getChildByName("卡包撕条").getComponent(Sprite).spriteFrame=this.cardHolderTop[rarityID];
        this.animationID=rarityID;
        this.allCardSpawn(this.animationID);
    }

    onTouchCardHolder(){
        if(this.isTouch)return;
        this.node.setPosition(0,0,0);
        if(!this.isAllGet){
            this.node.parent.parent.parent.getComponent(SLYZ_Cassette).cardHolderSelect(this.node);
        }
        tween(this.node)
            .to(0.4, 
                { scale: new Vec3(1.8, 1.8, 1) }, 
                { easing: "backOut" } 
            )
            .start();
            this.isTouch=true;
            this.node.getChildByName("手势").active=true;
        this.scheduleOnce(()=>{
            this.isSlider=true;
        },0.5)
        
    }

     private onTouchStart(event: EventTouch) {
            if(!this.isSlider) return;
            event.getStartLocation(this.touchStartPos);
            this.isSwiping = true;
        }
    
        private onTouchEnd(event: EventTouch) {
            if (!this.isSwiping) return;
            const touchEndPos = event.getLocation();
            const deltaX = touchEndPos.x - this.touchStartPos.x;
            if (deltaX > 50) { 
                this.node.getChildByName("卡包封面").active=false;
                SLYZ_AudioManager.instance.playSound(this.sound);
                switch(this.animationID){
                  case 0:
                    if(!this.node.getChildByName("卡包动画0"))return;
                    this.node.getChildByName("卡包动画0").active=true;
                    this.node.getChildByName("阻挡层").active=true;
                    break;
                  case 1:
                    if(!this.node.getChildByName("卡包动画1"))return;
                    this.node.getChildByName("卡包动画1").active=true;
                    this.node.getChildByName("阻挡层").active=true;
                    break;
                  case 2:
                    if(!this.node.getChildByName("卡包动画2"))return;
                    this.node.getChildByName("卡包动画2").active=true;
                    this.node.getChildByName("阻挡层").active=true;
                    break;
                  case 3:
                    if(!this.node.getChildByName("卡包动画3"))return;
                    this.node.getChildByName("卡包动画3").active=true;
                    this.node.getChildByName("阻挡层").active=true;
                    break;
                  case 4:
                    if(!this.node.getChildByName("卡包动画4"))return;
                    this.node.getChildByName("卡包动画4").active=true;
                    this.node.getChildByName("阻挡层").active=true;
                    break; 
                }
                this.node.getChildByName("卡牌生成处").active=true;
                this.scheduleOnce(()=>{
                    switch(this.animationID){
                        case 0:
                          this.node.getChildByName("卡包动画0").destroy();
                          this.node.getChildByName("阻挡层").active=false;
                          this.node.getChildByName("手势").active=false;
                          break;
                        case 1:
                          this.node.getChildByName("卡包动画1").destroy();
                          this.node.getChildByName("阻挡层").active=false;
                          this.node.getChildByName("手势").active=false;
                          break;
                        case 2:
                          this.node.getChildByName("卡包动画2").destroy();
                          this.node.getChildByName("阻挡层").active=false;
                          this.node.getChildByName("手势").active=false;
                          break;
                        case 3:
                          this.node.getChildByName("卡包动画3").destroy();
                          this.node.getChildByName("阻挡层").active=false;
                          this.node.getChildByName("手势").active=false;
                          break;
                        case 4:
                          this.node.getChildByName("卡包动画4").destroy();
                          this.node.getChildByName("阻挡层").active=false;
                          this.node.getChildByName("手势").active=false;
                          break; 
                      }
                },1);
            }
            this.isSwiping = false;
        }
}


