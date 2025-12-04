import { _decorator, Collider, Component, ITriggerEvent, Node, RigidBody } from 'cc';
import { HXTJB_PHY_GROUP } from '../Common/HXTJB_PHY_GROUP';
import { HXTJB_DataManager } from '../Manager/HXTJB_DataManager';
const { ccclass, property } = _decorator;

@ccclass('HXTJB_ScoreChecker')
export class HXTJB_ScoreChecker extends Component {
    onLoad() {
        const rigidBody = this.getComponent(RigidBody);
        rigidBody.useCCD = true;
        // 获取碰撞体组件
        let collider = this.node.getComponent(Collider);
        // console.log("collider:", collider);
        // 监听触发事件
        collider.on('onTriggerEnter', this.onTriggerEnter, this);
}

    private onTriggerEnter (event: ITriggerEvent) {
        console.log(event.type, event);

        //  // 检测到障碍物（墙壁/障碍）
        //  if(event.otherCollider.getComponent(RigidBody).group == HXTJB_PHY_GROUP.Coin){
        //   // 计算实际得分
        //     // 通知分数管理器加分
        //     HXTJB_DataManager.Instance.addScore(1);
            
        //     // 播放收集效果
        //     // this.playCollectEffect();
            
        //     // 销毁金币节点
        //     // this.scheduleOnce(() => {
        //         event.otherCollider.node.destroy();
        
        
        // }
           
             
         
    }
}


