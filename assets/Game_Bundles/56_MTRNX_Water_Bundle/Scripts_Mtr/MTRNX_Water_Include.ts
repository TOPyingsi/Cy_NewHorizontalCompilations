import { _decorator, Component, Node } from 'cc';
import { MTRNX_Water_EventManager, MTRNX_Water_MyEvent } from './MTRNX_Water_EventManager';
import { MTRNX_Water_Panel, MTRNX_Water_UIManager } from './MTRNX_Water_UIManager';
import { MTRNX_Water_GameDate } from './MTRNX_Water_GameDate';
import { MTRNX_Water_Constant } from './Data/MTRNX_Water_Constant';

const { ccclass, property } = _decorator;

@ccclass('MTRNX_Water_Include')
export class MTRNX_Water_Include extends Component {
    //获得科技点
    public static AddPoint(num: number, islook: boolean = true) {
        if (num == 0) {
            MTRNX_Water_EventManager.Scene.emit(MTRNX_Water_MyEvent.ChanggeMoney); return;
        }
        if (islook) {
            MTRNX_Water_UIManager.HopHint("获得科技点*" + num);
        }
        MTRNX_Water_GameDate.Instance.Money += num;
        MTRNX_Water_GameDate.DateSave();
        MTRNX_Water_EventManager.Scene.emit(MTRNX_Water_MyEvent.ChanggeMoney);
    }
    //获得碎片
    public static AddDebris(num: number, islook: boolean = true) {
        if (num == 0) {
            MTRNX_Water_EventManager.Scene.emit(MTRNX_Water_MyEvent.ChanggeMoney); return;
        }
        if (islook) {
            MTRNX_Water_UIManager.HopHint("获得角色碎片*" + num);
        }
        MTRNX_Water_GameDate.Instance.Debris += num;
        MTRNX_Water_GameDate.DateSave();
        MTRNX_Water_EventManager.Scene.emit(MTRNX_Water_MyEvent.ChanggeDebris);
    }

    //判断科技点是否足够，不足够的时候弹出获取界面
    public static GetPointIsCan(Pint: number): boolean {
        if (MTRNX_Water_GameDate.Instance.Money >= Pint) {
            return true;
        } else {
            MTRNX_Water_UIManager.Instance.ShowPanel(MTRNX_Water_Panel.acquireMoneyPanel);
        }
        return false;
    }


    //通过名字获取角色id
    public static GetPlayerNameById(name: string): number {
        return MTRNX_Water_Constant.PlayerName.indexOf(name);
    }
    //解锁角色
    public static UnlookPlayer(Name: string, islook: boolean = true) {
        if (MTRNX_Water_GameDate.Instance.PlayerDate[MTRNX_Water_Include.GetPlayerNameById(Name)] == 0) {
            MTRNX_Water_GameDate.Instance.PlayerDate[MTRNX_Water_Include.GetPlayerNameById(Name)] = 1;
            if (islook) {
                MTRNX_Water_UIManager.HopHint("成功解锁角色:" + Name);
            }
        } else {
            MTRNX_Water_Include.AddPoint(1000);
            MTRNX_Water_UIManager.HopHint("解锁重复角色，返回科技点*1000");
        }
    }
}


