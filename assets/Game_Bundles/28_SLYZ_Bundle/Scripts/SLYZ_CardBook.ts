import { _decorator, AudioClip, Component, director, instantiate, Label, Node, Prefab, ProgressBar } from 'cc';
import { SLYZ_Card } from './SLYZ_Card';
import { SLYZ_AudioManager } from './SLYZ_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('SLYZ_CardBook')
export class SLYZ_CardBook extends Component {
    @property(Prefab)
    private cardPrefab:Prefab=null;
    @property([Node])
    private anchorPoint:Node[]=[];

    @property(Node)
    private progressBar:Node=null;

    @property([AudioClip])
    private pageSound:AudioClip[]=[];
    private pageNumber:number=1;
    private cardID:number=0;
    public verifyArray:number[]=[];

    private cardStateJudge:number=0;

    private cardNormalNum:number=0;

    private sortedIDs: number[] = []; 
    private currentIndex: number = 0; 
    private autoPageEnabled: boolean = false; 
    protected onLoad(): void {
        director.on("cardData",this.slidCardSpawn,this);
        director.on("normalState",this.cardJudge,this);
        director.on("cardBookOpen",this.firstJoin,this);
        this.loadCardData();
    }
    start() {
         
    }

    private loadCardData() {
        const savedData = localStorage.getItem('cardData');
        if (savedData) {
            this.verifyArray = JSON.parse(savedData);
            // 加载时生成已有卡牌
            for (let i = 0; i < this.verifyArray.length; i++) {
                if (this.verifyArray[i] === 1) {
                    this.spawnStaticCard(i);
                }
            }
        } else {
            this.initVerifyArray();
        }
    }
    protected onDestroy(): void {
        director.off("cardData",this.slidCardSpawn,this);
        director.off("normalState",this.cardJudge,this);
        director.off("cardBookOpen",this.firstJoin,this);
    }

    update(deltaTime: number) {
        
    }

    firstJoin(){
        const firstCardID=this.sortedIDs[0];
        const firstPage = this.getPageByCardId(firstCardID);
        this.pageNumber=firstPage;
        this.node.getChildByName("翻页").getChildByName("页数").getComponent(Label).string=this.pageNumber+"/5";
        this.pageControl(this.pageNumber);
    }

    cardJudge(){
        this.cardNormalNum++;
        if (this.autoPageEnabled && this.currentIndex < this.sortedIDs.length-1) {
            const currentCardId = this.sortedIDs[this.currentIndex+1];
            const targetPage = this.getPageByCardId(currentCardId);
            this.pageNumber=targetPage;
            this.node.getChildByName("翻页").getChildByName("页数").getComponent(Label).string=this.pageNumber+"/5";
            this.pageControl(this.pageNumber);
            SLYZ_AudioManager.instance.playSound(this.pageSound[2]);
            this.currentIndex++;
        }
        if(this.cardNormalNum==this.cardStateJudge)
        {
            this.node.getChildByName("返回").active=true;
        }
    }

    bookClose(){
        SLYZ_AudioManager.instance.playSound(this.pageSound[0]);
        this.currentIndex = 0;
        this.node.active=false;
        this.node.parent.parent.getChildByName("UI").active=true;
        this.node.parent.parent.getChildByName("封面").getChildByName("卡册封面").active=true;
        this.sortedIDs = [];
    }
    slidCardSpawn(id){
        if(this.verifyArray[id]==1)return;
        this.node.getChildByName("返回").active=false;
        this.verifyArray[id]=1;
        this.sortedIDs.push(id);
        this.sortedIDs.sort((a, b) => a - b);
        console.log(this.sortedIDs);
        const rarityID = this.getRarityByCardId(id);
        let card=instantiate(this.cardPrefab);
        this.anchorPoint[id].addChild(card);
        card.getComponent(SLYZ_Card).cardSpawn(id,rarityID);
        // console.log(this.anchorPoint[id].getPosition());
        card.getComponent(SLYZ_Card).cardSlidState(card.getPosition());
        localStorage.setItem('cardData', JSON.stringify(this.verifyArray));
        this.updateProgress();
        this.cardStateJudge++;
        this.autoPageEnabled = true;
    }

    private updateProgress() {
        const collectedCount = this.verifyArray.filter(v => v == 1).length;
        const progress = collectedCount / this.verifyArray.length;
        const progressComp = this.progressBar.getComponent(ProgressBar);
        this.progressBar.getChildByName("进度值").getComponent(Label).string=collectedCount+"/54";
        progressComp.progress = progress;
        const progressBar=this.node.parent.parent.getChildByName("UI").getChildByName("收集卡片").getChildByName('收集卡片进度底').getComponent(ProgressBar);
        progressBar.progress=progress;
        this.node.parent.parent.getChildByName("UI").getChildByName("收集卡片").getChildByName("收集进度值").getComponent(Label).string=collectedCount+"/54";
    }

    private getRarityByCardId(cardId: number): number {
        if (cardId <= 19) return 0;
        if (cardId <= 33) return 1;    
        if (cardId <= 43) return 2;    
        if (cardId <= 49) return 3;    
        return 4;                     
    }

    pageAdd(){
        if(this.pageNumber==5)return;
        SLYZ_AudioManager.instance.playSound(this.pageSound[1]);
        this.pageNumber++;
        this.node.getChildByName("翻页").getChildByName("页数").getComponent(Label).string=this.pageNumber+"/5";
        this.pageControl(this.pageNumber);
    }
    pageSub(){
        if(this.pageNumber==1)return
        SLYZ_AudioManager.instance.playSound(this.pageSound[1]);
        this.pageNumber--;
        this.node.getChildByName("翻页").getChildByName("页数").getComponent(Label).string=this.pageNumber+"/5";
        this.pageControl(this.pageNumber);
    }

    pageControl(id){
        switch(id){
            case 1:
                 this.node.getChildByName("卡牌层1").active=true;
                 this.node.getChildByName("卡牌层2").active=false;
                 this.node.getChildByName("卡牌层3").active=false;
                 this.node.getChildByName("卡牌层4").active=false;
                 this.node.getChildByName("卡牌层5").active=false;
                 break;
             case 2:
                 this.node.getChildByName("卡牌层1").active=false;
                 this.node.getChildByName("卡牌层2").active=true;
                 this.node.getChildByName("卡牌层3").active=false;
                 this.node.getChildByName("卡牌层4").active=false;
                 this.node.getChildByName("卡牌层5").active=false;
                 break;
             case 3:
                 this.node.getChildByName("卡牌层1").active=false;
                 this.node.getChildByName("卡牌层2").active=false;
                 this.node.getChildByName("卡牌层3").active=true;
                 this.node.getChildByName("卡牌层4").active=false;
                 this.node.getChildByName("卡牌层5").active=false;
                 break;
             case 4:
                 this.node.getChildByName("卡牌层1").active=false;
                 this.node.getChildByName("卡牌层2").active=false;
                 this.node.getChildByName("卡牌层3").active=false;
                 this.node.getChildByName("卡牌层4").active=true;
                 this.node.getChildByName("卡牌层5").active=false;
                 break;
             case 5:
                 this.node.getChildByName("卡牌层1").active=false;
                 this.node.getChildByName("卡牌层2").active=false;
                 this.node.getChildByName("卡牌层3").active=false;
                 this.node.getChildByName("卡牌层4").active=false;
                 this.node.getChildByName("卡牌层5").active=true;
                 break;
         }
    }
    initVerifyArray(){
       for(let i=0;i<54;i++){
           this.verifyArray.push(0); 
       }
       console.log(this.verifyArray);
       this.updateProgress();
    }


    private getPageByCardId(cardId: number): number {
        if (cardId < 12) return 1;
        if (cardId < 24) return 2;    
        if (cardId < 36) return 3;    
        if (cardId < 48) return 4;    
        return 5; 
    }

    private spawnStaticCard(id: number) {
        const rarityID = this.getRarityByCardId(id);
        let card = instantiate(this.cardPrefab);
        this.anchorPoint[id].addChild(card);
        card.getComponent(SLYZ_Card).cardSpawn(id, rarityID);
        card.getComponent(SLYZ_Card).cardNormalState();
        this.updateProgress(); 
    }
    
    
}


