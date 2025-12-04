import { _decorator, Animation, Component, EventTouch, Node, v3 } from 'cc';

import { KKDKF_MoveTouch } from './KKDKF_MoveTouch';
import { KKDKF_GameManager } from './KKDKF_GameManager';
import { KKDKF_GameData } from '../KKDKF_GameData';
import { KKDKF_EventManager, KKDKF_MyEvent } from '../KKDKF_EventManager';
import { KKDKF_Place } from './KKDKF_Place';
import { KKDKF_Guest } from './KKDKF_Guest';
import { KKDKF_Incident } from '../KKDKF_Incident';
const { ccclass, property } = _decorator;

@ccclass('KKDKF_Cup')
export class KKDKF_Cup extends KKDKF_MoveTouch {
    @property()
    public ID: number = 0;//0碗1杯子2.牛奶杯3大杯子
    public OnWhere: Node = null;//所在的放置处

    public materials: number[] = [];//已经加入的材料(0咖啡1热水2冷水3牛奶4泡奶5草莓汁6冰块7草莓酱)
    OnTouchStar(TouchData: EventTouch) {
        super.OnTouchStar(TouchData);
        if (!KKDKF_GameManager.Instance.IsOnShop) {
            KKDKF_GameManager.Instance.UI.getChildByName("垃圾桶").active = true;
            KKDKF_GameManager.Instance.UI.getChildByName("上菜").active = true;
            if (KKDKF_GameData.Instance.GameData[3] == 0 && KKDKF_GameManager.Instance.Beginnerschedule < 10) {
                KKDKF_GameManager.Instance.UI.getChildByName("垃圾桶").active = false;
                KKDKF_GameManager.Instance.UI.getChildByName("上菜").active = false;
            }
            if (KKDKF_GameData.Instance.GameData[3] == 0 && KKDKF_GameManager.Instance.Beginnerschedule == 10) {
                KKDKF_GameManager.Instance.UI.getChildByName("垃圾桶").active = false;
            }
        }

    }
    //抬起事件
    TouchEndEvent() {
        if (this.Target && this.Target.name == "上菜") {
            KKDKF_EventManager.Scene.emit(KKDKF_MyEvent.上菜);
            this.OnWhere.getComponent(KKDKF_Place).NdExit();
            this.node.setParent(KKDKF_GameManager.Instance.MainCanvase.getChildByPath("接客区/饮料位置"));
            this.node.setPosition(v3(0, 0, 0));
            this.StarPosition = v3(0, 0, 0);
            this.node.scale = v3(0.6, 0.6, 0.6);
            KKDKF_GameManager.Instance.ReShop();
            KKDKF_GameManager.Instance.UI.getChildByName("上菜").active = false;
            KKDKF_GameManager.Instance.UI.getChildByName("垃圾桶").active = false;
            return;
        }
        if (this.Target && this.Target.name == "垃圾桶") {
            this.OnWhere.getComponent(KKDKF_Place).NdExit();
            this.node.destroy();
            KKDKF_GameManager.Instance.UI.getChildByName("上菜").active = false;
            KKDKF_GameManager.Instance.UI.getChildByName("垃圾桶").active = false;
            return;
        }
        KKDKF_GameManager.Instance.UI.getChildByName("垃圾桶").active = false;
        KKDKF_GameManager.Instance.UI.getChildByName("上菜").active = false;
        if (!this.Target) return;
        if (this.Target.name == "客人") {//将饮料给客人
            KKDKF_EventManager.Scene.emit(KKDKF_MyEvent.饮料给客人);
            this.Target.getComponent(KKDKF_Guest).GetCoffee(this.materials);
            this.node.destroy();
            return;
        }
        if ((this.ID == 2 || this.ID == 3) && this.Target.name == "咖啡机放置处") {
            return;
        }
        if (this.Target.getComponent(KKDKF_Place) != null && this.Target.getComponent(KKDKF_Place).IsHaveCpu == false) {
            this.OnWhere.getComponent(KKDKF_Place).NdExit();
            this.Target.getComponent(KKDKF_Place).Movethis(this.node);
            if (this.Target.name != "咖啡机放置处") {
                KKDKF_EventManager.Scene.emit(KKDKF_MyEvent.杯子放到桌面);
            }
        }
        if (this.ID == 2 && this.Target.name == "碗" && this.Target.getComponent(KKDKF_Cup).materials.length == 1) {//将泡奶给咖啡碗
            this.Target.getComponent(KKDKF_Cup).Add_MilkPlus();
            this.OnWhere.getComponent(KKDKF_Place).NdExit();
            this.node.destroy();
            return;
        }
        if (this.ID == 2 && this.Target.name == "碗" && this.Target.getComponent(KKDKF_Cup).materials.length == 2) {//将泡奶给草莓咖啡底碗
            this.Target.getComponent(KKDKF_Cup).Add_MilkPlus();
            this.OnWhere.getComponent(KKDKF_Place).NdExit();
            this.node.destroy();
            return;
        }
        if (KKDKF_Incident.arraysAreEqual(this.materials, [0]) && this.Target.name == "大杯子") {//将咖啡给大杯子
            this.Target.getComponent(KKDKF_Cup).Add_Coffee();
            this.OnWhere.getComponent(KKDKF_Place).NdExit();
            this.node.destroy();
            return;
        }
    }

    //添加咖啡
    Add_Coffee() {
        if (this.ID == 0 && this.materials.length == 0) {
            this.node.getChildByName("咖啡").active = true;
            this.node.getChildByName("咖啡").getComponent(Animation).play("碗咖啡");
            this.materials.push(0);
        }
        if (this.ID == 1 && this.materials.length == 0) {
            this.node.getChildByName("咖啡").active = true;
            this.node.getChildByName("咖啡").getComponent(Animation).play("小杯咖啡");
            this.materials.push(0);
        }
        if (this.ID == 3 && this.materials.length == 0) {
            KKDKF_EventManager.Scene.emit(KKDKF_MyEvent.大杯加咖啡);
            this.node.getChildByName("咖啡").getComponent(Animation).play("大杯加咖啡");
            this.materials.push(0);
        }

        if (this.ID == 3 && KKDKF_Incident.arraysAreEqual(this.materials, [6, 3])) {//大杯牛奶冰块加咖啡
            this.node.getComponent(Animation).play("大杯牛奶冰块加咖啡");
            this.materials.push(0);
        }
        if (this.ID == 3 && KKDKF_Incident.arraysAreEqual(this.materials, [6, 5, 3])) {//给大杯冰块草莓牛奶底加咖啡
            this.node.getComponent(Animation).play("大杯冰块草莓牛奶底加咖啡");
            this.materials.push(0);
        }
    }

    //添加牛奶
    Add_Milk() {
        if (this.ID == 2 && this.materials.length == 0) {//给奶壶加奶
            this.node.getChildByName("牛奶").getComponent(Animation).play("奶壶加奶");
            this.IsEnable = false;
            this.scheduleOnce(() => {
                KKDKF_Incident.Tween_To(this.node, KKDKF_GameManager.FindOfBG("蒸牛奶机器").getPosition().add(v3(155, -325)), 0.5, () => {
                    KKDKF_GameManager.FindOfBG("蒸牛奶机器/喷气").active = true;
                    this.scheduleOnce(() => {
                        KKDKF_GameManager.FindOfBG("蒸牛奶机器/喷气").active = false;
                        this.IsEnable = true;
                        this.node.position = this.StarPosition.clone();
                    }, 1)
                });
            }, 1)
            this.materials.push(3);
        }
        if (this.ID == 3 && KKDKF_Incident.arraysAreEqual(this.materials, [6])) {//大杯子冰块底加牛奶
            this.node.getComponent(Animation).play("大杯冰块底加牛奶");
            this.materials.push(3);
        }
        if (this.ID == 3 && KKDKF_Incident.arraysAreEqual(this.materials, [6, 5])) {//给大杯冰块草莓底加牛奶
            this.node.getComponent(Animation).play("大杯冰块草莓底加牛奶");
            this.materials.push(3);
        }
    }
    //添加泡奶
    Add_MilkPlus() {
        if (this.ID == 0 && this.materials.length == 1) {//给咖啡碗加泡奶
            this.node.getChildByName("咖啡").getComponent(Animation).play("碗加泡奶");
            this.materials.push(4);
            return;
        }
        if (this.ID == 0 && this.materials.length == 2) {//给草莓咖啡底碗加泡奶
            this.node.getChildByName("咖啡").getComponent(Animation).play("草莓咖啡底碗加泡奶");
            this.materials.push(4);
            return;
        }
    }
    //添加草莓汁
    Add_StrawberrySauce() {
        if (this.ID == 0 && this.materials.length == 1) {//给咖啡碗加草莓咖啡底
            this.node.getChildByName("咖啡").getComponent(Animation).play("碗加草莓咖啡底");
            this.materials.push(5);
        }

        if (this.ID == 3 && KKDKF_Incident.arraysAreEqual(this.materials, [6])) {//给大杯冰块底加草莓汁
            this.node.getComponent(Animation).play("大杯冰块底加草莓");
            this.materials.push(5);
        }
    }
    //加热水
    Add_Water_Hot() {
        if (this.ID == 0 && this.materials.length == 1) {
            this.node.getChildByName("咖啡").active = true;
            this.node.getChildByName("咖啡").getComponent(Animation).play("碗加水");
            this.materials.push(1);
        }

    }
    //加冷水
    Add_Water_cold() {
        if (this.ID == 0 && this.materials.length == 1) {
            this.node.getChildByName("咖啡").active = true;
            this.node.getChildByName("咖啡").getComponent(Animation).play("碗加水");
            this.materials.push(2);
        }
        if (this.ID == 3 && KKDKF_Incident.arraysAreEqual(this.materials, [0])) {//大杯咖啡底加冰水
            KKDKF_EventManager.Scene.emit(KKDKF_MyEvent.大杯加冰水);
            this.node.getChildByName("咖啡").getComponent(Animation).play("大杯咖啡底加冰水");
            this.materials.push(2);
        }

    }
    //加冰块
    Add_Icecube() {
        if (this.materials.indexOf(6) != -1) return;//如果有冰块不能二次添加
        if (this.ID == 3 && this.materials.length == 2) {
            KKDKF_EventManager.Scene.emit(KKDKF_MyEvent.大杯加冰块);
            this.node.getChildByName("冰块").active = true;
            this.materials.push(6);
        }
        if (this.ID == 3 && this.materials.length == 0) {//大杯子空加冰块
            KKDKF_EventManager.Scene.emit(KKDKF_MyEvent.大杯加冰块);
            this.node.getChildByName("冰块").position = v3(7, 20);
            this.node.getChildByName("冰块").scale = v3(0.8, 0.8, 1);
            this.node.getChildByName("冰块").active = true;
            this.materials.push(6);
        }
    }
}


