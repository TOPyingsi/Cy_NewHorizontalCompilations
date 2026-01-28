import { _decorator, Component, Node } from 'cc';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { DH_GameEvents } from './Common/DH_GameEvents';
import { DH_DataManager } from './Manager/DH_DataManager';
import { DH_SkillManager } from './Manager/DH_SkillManager';
import { DH_SkillDamageParams, DH_SkillId, DH_SkillPullParams } from './Common/DH_ISkillParams';
const { ccclass, property } = _decorator;

@ccclass('tset')
export class tset extends Component {

    onbtnClick1(){
       DH_DataManager.Instance.sellAllFishes();
    }

    onbtnClick2(){
        DH_DataManager.Instance.sellAllFishes();
    }
}


