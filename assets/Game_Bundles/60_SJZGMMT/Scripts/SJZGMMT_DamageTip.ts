import { _decorator, Component, Label, Node, tween, Vec3 } from 'cc';
import { SJZGMMT_GameManager } from './SJZGMMT_GameManager';
import { SJZGMMT_PoolManager } from './SJZGMMT_PoolManager';
const { ccclass, property } = _decorator;

@ccclass('SJZGMMT_DamageTip')
export class SJZGMMT_DamageTip extends Component {
    Show(num: number, worldpos: Vec3) {
        this.node.getChildByName("数值").getComponent(Label).string = num.toString();
        this.node.setParent(SJZGMMT_GameManager.Instance.GameNode);
        // 添加随机位置偏移
        const randomPos = worldpos.clone();
        randomPos.x += (Math.random() - 0.5) * 100; // 随机左右偏移 ±50
        randomPos.y += (Math.random() - 0.5) * 60; // 随机上下偏移 ±30
        this.node.setWorldPosition(randomPos);
        this.PlayAnimation();
    }

    //动画
    PlayAnimation() {
        // 创建一个随机的初始缩放和位置变化
        const startPos = this.node.worldPosition;

        //使用tween创建动画序列
        tween(this.node)
            //快速放大到1.3倍
            .to(0.3, { scale: new Vec3(1.5, 1.5, 1), worldPosition: new Vec3(startPos.x, startPos.y + 15, startPos.z) })
            //缩小到正常大小并继续向上移动
            .to(0.3, {
                scale: new Vec3(1, 1, 1),
                worldPosition: new Vec3(startPos.x, startPos.y + 30, startPos.z)
            })
            //向上飘移的同时逐渐消失
            .by(0.8, {
                position: new Vec3(0, 40, 0),
                scale: new Vec3(-0.1, -0.1, 0)
            })
            .call(() => {
                //动画完成后销毁节点
                SJZGMMT_PoolManager.Instance.Put(this.node);
            })
            .start();
    }


}


