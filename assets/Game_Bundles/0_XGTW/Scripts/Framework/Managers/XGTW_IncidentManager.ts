import { _decorator, Component } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('XGTW_IncidentManager')
export default class XGTW_IncidentManager extends Component {
    public Incident: Function[] = [];
    public IncidentTime: number[] = [];
    public HaveBeenNum: number = 0;
    //    //添加事件
    Pushincident(incident: Function, time: number) {
        this.Incident.push(incident);
        this.IncidentTime.push(time);
    }
    //    //添加事件数组
    Pushincidents(incidents: Function[], Times: number[]) {
        for (let i = 0; i < incidents.length; i++) {
            this.Incident.push(incidents[i]);
            this.IncidentTime.push(Times[i]);
        }
    }
    //    //删除事件（根据下标）
    RemoveOfIndex(index: number, deleteCount: number = 1) {
        this.Incident.splice(index, deleteCount);
    }
    //    //执行
    start() {
        this.HaveBeenNum = 0;
        this.Begin();
    }
    //    //结束（当前这件事情结束后不在执行下一个事件）
    Stop() {
        this.HaveBeenNum = -999;
    }
    //    //开启事件
    private Begin() {
        if (this.HaveBeenNum < 0) {
            return;
        }
        if (this.HaveBeenNum < this.Incident.length) {
            this.Incident[this.HaveBeenNum]();
            this.scheduleOnce(() => {
                this.Begin();
            }, this.IncidentTime[this.HaveBeenNum])
            this.HaveBeenNum++;
        }
    }
}