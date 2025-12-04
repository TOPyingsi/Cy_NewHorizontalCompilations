import { _decorator, Collider, Color, Component, ITriggerEvent, Node, SkeletalAnimation, tween } from 'cc';
import { TKJWL_DataManager } from '../../Manager/TKJWL_DataManager';
import { TKJWL_RoomBase } from '../../Common/TKJWL_RoomBase';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { TKJWL_GameEvents } from '../../Common/TKJWL_GameEvents';
import { TKJWL_AudioManager } from '../../Manager/TKJWL_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('TKJWL_KillRoom')
export class TKJWL_KillRoom extends TKJWL_RoomBase {


    spine:SkeletalAnimation = null;

    protected onLoad(): void {
        this.spine = this.node.getChildByName("monster").getComponent(SkeletalAnimation);
    }
    start() {
        super.start();
        const currentState = this.spine.getState('attack');
        if (!currentState?.isPlaying) {
            this.spine.crossFade('attack', 0.2);
            this.scheduleOnce(()=>{
                this.animEndCb();
            },5)
        }
    }

    animEndCb(){
        if(TKJWL_DataManager.Instance.isWatchingKill){
            //播放我看见你了动画
            const currentState = this.spine.getState('watch');
            if (!currentState?.isPlaying) {
            //播放发现音效
            TKJWL_AudioManager.getInstance().playSound("发现")
            TKJWL_DataManager.Instance.Tip = "糟了！他看见我了！";
            TKJWL_DataManager.Instance.tipColor = Color.YELLOW;
            EventManager.Scene.emit(TKJWL_GameEvents.UI_SHOW_TIP_PANEL);

                this.spine.crossFade('watch', 0.2);
                TKJWL_DataManager.Instance.isStartKill = true;
                this.scheduleOnce(()=>{
                    //播放跑步动画
                    const currentState = this.spine.getState('run');
                    if (!currentState?.isPlaying) {
                        this.spine.crossFade('run', 0.2);
                        tween(this.node.getChildByName("monster"))
                        .to(2,{worldPosition:this.node.getChildByName("targetPos").worldPosition})
                        .start();

                        TKJWL_DataManager.Instance.Tip = "他在朝我过来！";
                        TKJWL_DataManager.Instance.tipColor = Color.YELLOW;
                        EventManager.Scene.emit(TKJWL_GameEvents.UI_SHOW_TIP_PANEL);

                        this.scheduleOnce(()=>{
                            //开灯1
                            EventManager.Scene.emit(TKJWL_GameEvents.OPEN_ROOM,"lightRoom1");
                            this.scheduleOnce(()=>{
                                //开灯2
                                EventManager.Scene.emit(TKJWL_GameEvents.OPEN_ROOM,"lightRoom2");
                                this.scheduleOnce(()=>{
                                    //创建怪物
                                    if( TKJWL_DataManager.Instance.plotNum == 0){
                                        TKJWL_DataManager.Instance.plotNum = 999;
                                        EventManager.Scene.emit(TKJWL_GameEvents.SET_MONSTER_POLT);
                                    }
                                    EventManager.Scene.emit(TKJWL_GameEvents.SET_MONSTER_POLT)
                                },1)//跑到大门口时长
                            },1)//跑到第二间楼梯房时长
                        },1)//跑到第一间楼梯房时长
                    }
                },2)//我看见你了动画时长
            }
        }
        else{
            this.scheduleOnce(()=>{
               this.animEndCb() 
            },5)
        }
    }

    protected onDestroy(): void {

    }
}


