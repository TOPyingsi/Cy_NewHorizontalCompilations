import { _decorator, Component, director, instantiate, Node, Prefab } from 'cc';
import { MTRNX_Water_ResourceUtil } from '../Utils/MTRNX_Water_ResourceUtil';
import { MTRNX_Water_RewardItem } from './MTRNX_Water_RewardItem';
import { MTRNX_Water_RewardType } from '../Data/MTRNX_Water_Constant';
import { MTRNX_Water_Panel, MTRNX_Water_UIManager } from '../MTRNX_Water_UIManager';
import { MTRNX_Water_GameManager } from '../MTRNX_Water_GameManager';

const { ccclass, property } = _decorator;

@ccclass('MTRNX_Water_RewardPanel')
export class MTRNX_Water_RewardPanel extends Component {

    rewardItemsNd: Node = null;
    rewardItems: MTRNX_Water_RewardItem[] = [];

    protected onLoad(): void {
        this.rewardItemsNd = this.node.getChildByName("RewardItems");
    }

    Show() {
        this.scheduleOnce(() => {
            // director.pause();
        });

        this.rewardItems.forEach(element => element.node.destroy());
        this.rewardItems = [];

        MTRNX_Water_ResourceUtil.LoadPrefab("UI/RewardItem").then((prefab: Prefab) => {
            let node_1 = instantiate(prefab);
            node_1.setParent(this.rewardItemsNd);
            let item_1 = node_1.getComponent(MTRNX_Water_RewardItem);
            item_1.Init(1, MTRNX_Water_RewardType.增加最大生命值, this.OnRewardItemCallback);
            this.rewardItems.push(item_1);

            let node_2 = instantiate(prefab);
            node_2.setParent(this.rewardItemsNd);
            let item_2 = node_2.getComponent(MTRNX_Water_RewardItem);
            item_2.Init(2, MTRNX_Water_RewardType.立即获得800分数, this.OnRewardItemCallback);
            this.rewardItems.push(item_2);

            let node_3 = instantiate(prefab);
            node_3.setParent(this.rewardItemsNd);
            let item_3 = node_3.getComponent(MTRNX_Water_RewardItem);
            item_3.Init(3, MTRNX_Water_RewardType.能量250, this.OnRewardItemCallback);
            this.rewardItems.push(item_3);

            let node_4 = instantiate(prefab);
            node_4.setParent(this.rewardItemsNd);
            let item_4 = node_4.getComponent(MTRNX_Water_RewardItem);
            item_4.Init(4, MTRNX_Water_RewardType.降低马桶人生成速度, this.OnRewardItemCallback);
            this.rewardItems.push(item_4);
        });

    }

    OnRewardItemCallback(rewardType: MTRNX_Water_RewardType) {
        switch (rewardType) {
            case MTRNX_Water_RewardType.增加最大生命值:
                MTRNX_Water_GameManager.Instance.AddMaxHp(5);
                break;
            case MTRNX_Water_RewardType.立即获得800分数:
                MTRNX_Water_GameManager.Instance.Score += 800;
                break;
            case MTRNX_Water_RewardType.能量250:
                MTRNX_Water_GameManager.Instance.Point += 250;
                break;
            case MTRNX_Water_RewardType.降低马桶人生成速度:
                MTRNX_Water_GameManager.Instance.enemyPoint = 0;
                break;
        }
        // director.resume();
        MTRNX_Water_UIManager.Instance.HidePanel(MTRNX_Water_Panel.RewardPanel);
    }

}