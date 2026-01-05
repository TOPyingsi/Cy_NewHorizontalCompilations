import { _decorator, Component, Node, ScrollView, Button, Sprite, Label, instantiate, resources, SpriteFrame, Color } from 'cc';
import { DH_AnglerJsonData, DH_DataManager } from '../Manager/DH_DataManager';
import { DH_LoadManager } from '../Manager/DH_LoadManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { DH_GameEvents } from '../Common/DH_GameEvents';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
// import { FishingSkill, RoleData, RoleListData } from './RoleData';
const { ccclass, property } = _decorator;

@ccclass('DH_AnglerPanel')
export class DH_AnglerPanel extends Component {
  // 编辑器关联节点
  @property(Node) 
  roleItemTemplate: Node = null!; // 角色项模板

  @property(Node) 
  roleItemContent: Node = null!;  // 角色项容器

  @property(Sprite) 
  rolePortrait: Sprite = null!; // 角色立绘

  @property(Label) 
  lblRoleName: Label = null!;    // 角色名称

  @property(Label) 
  lblRoleLevel: Label = null!;   // 角色等级

  @property(Label) 
  lblRoleDesc: Label = null!;    // 角色描述

  @property(Label) 
  lblPullForce: Label = null!;   // 拉力值

  @property(Label) 
  lblSkillBonus: Label = null!;  // 钓法加成

  @property(Node) 
  skillItemTemplate: Node = null!;// 钓法项模板

  @property(Node) 
  skillItemContent: Node = null!; // 钓法项容器

  @property(Button) 
  btnBattle: Button = null!; // 取消出战按钮

  @property(Button) 
  btnCancelBattle: Button = null!; // 取消出战按钮

  @property(Button) 
  btnUpgrade: Button = null!;      // 升级按钮

  @property(Label) 
  lblUpgradePrice: Label = null!;  // 升级价格

  @property(Button) 
  btnBack: Button = null!;  // 返回按钮

  
  @property(Node) 
  nodeLock: Node = null!;  // 返回按钮

  @property(Label) 
  lblLock: Label = null!;  // 返回按钮
  

  

  private roleId:string = "钓友_0";
  private currentRole: DH_AnglerJsonData | null = null; // 当前选中角色
  private currentRoleSaveData :{     // 钓友ID映射到具体数据
            pullForce: number;          // 拉力值
            level: number;              // 当前等级
            isUnlocked: boolean;        // 是否解锁
            unlockedSkillIds: string[]; // 已解锁技能ID列表
            isActive: boolean;          // 是否出战
        } | null = null; // 当前选中角色的保存数据

  onLoad() {

  }

  init(){
    // 绑定按钮事件
    this.btnCancelBattle.node.on("click", this.onCancelBattle, this);
    this.btnUpgrade.node.on("click", this.onUpgradeRole, this);
    this.btnBattle.node.on("click", this.onBattle, this);
    this.btnBack.node.on("click", this.onBack, this);
    this.roleItemTemplate.active = false;
    this.skillItemTemplate.active = false;
    // 初始化角色列表
    this.initRoleList();
    this.currentRole =  DH_DataManager.Instance.getItemDataById(this.roleId);
    this.currentRoleSaveData = DH_DataManager.Instance.saveData.anglerData[this.roleId];
    this.onRoleItemClick(this.currentRole ,this.currentRoleSaveData);
       ProjectEventManager.emit(ProjectEvent.弹出窗口, "钓魂");
  }

  // 初始化左侧角色列表
  private initRoleList() {
    // 清空容器
        // 清空容器
    this.roleItemContent.children.forEach(child =>{
      if(child.active) child.destroy(); 
    });
    // 遍历角色数据创建项
    let anglersJsonData = DH_DataManager.Instance.getAllAnglersData();
    Object.values(anglersJsonData).forEach(angler => {
      let role: DH_AnglerJsonData = angler;
      let saveData = DH_DataManager.Instance.saveData.anglerData[role.id];
      if(!saveData){
        saveData = {
          level: 0,
          isUnlocked: false,
          isActive: false,
          pullForce: 0,
          unlockedSkillIds: [],
        }
      }
      const roleItem = instantiate(this.roleItemTemplate);
      roleItem.parent = this.roleItemContent;
      roleItem.active = true;
      roleItem.name = role.id;

      // 设置头像
      const avatarSprite = roleItem.getChildByName("spAngler").getComponent(Sprite);
      DH_LoadManager.Instance.getAnglerIconById(role.id, (frame) => {
        if (!frame) return;
        avatarSprite.spriteFrame = frame;
      });

     
      // 设置等级
      const levelLabel = roleItem.getChildByName("LblLevel")?.getComponent(Label);
      if (levelLabel) levelLabel.string = `Lv.${saveData.level}`;

      // 设置标签（已出战/锁定）
      const tagLabel = roleItem.getChildByName("LblTag")?.getComponent(Label);
      const nameLabel = roleItem.getChildByName("LblName")?.getComponent(Label);
      roleItem.getChildByName("LblTag").active = saveData.isActive;
      let gou = roleItem.getChildByName("勾")
      gou.active = saveData.isActive;

      const locked = roleItem.getChildByName("lock");
      locked.active = !saveData.isUnlocked;

      const Lock2 = roleItem.getChildByName("Lock2");
      Lock2.active = !saveData.isUnlocked;
      


      if (nameLabel) nameLabel.string = role.名称;

      if (tagLabel) {
        if (saveData.isUnlocked) {
          tagLabel.string = "";
        }
        if (saveData.isActive) {
          tagLabel.string = "已出战";

        //   tagLabel.node.color = new Color(0, 255, 0);
        } else {
          tagLabel.string = "";
        }
      }

      // 绑定角色项点击事件
      const btn = roleItem.getComponent(Button);
      btn.node.on("click", () => this.onRoleItemClick(role,saveData));
    });
  }

  // 角色项点击事件：更新详情面板
  private onRoleItemClick(role: DH_AnglerJsonData,roleSaveData:{     // 钓友ID映射到具体数据
            pullForce: number;          // 拉力值
            level: number;              // 当前等级
            isUnlocked: boolean;        // 是否解锁
            unlockedSkillIds: string[]; // 已解锁技能ID列表
            isActive: boolean;          // 是否出战
        }) {
    this.currentRole = role;
    this.currentRoleSaveData = roleSaveData;

      // 清空容器
    this.roleItemContent.children.forEach(child =>{
      if(child.active) child.getChildByName("selected").active = false;
      if(child.name == role.id) child.getChildByName("selected").active = true; 
    });

    // 更新立绘
     DH_LoadManager.Instance.getAnglerIconById(role.id, (frame) => {
        if (!frame) return;
        this.rolePortrait.spriteFrame = frame;
        this.rolePortrait.color = roleSaveData.isUnlocked?new Color("FFFFFF"):new Color("777777");
        this.nodeLock.active = !roleSaveData.isUnlocked;
        this.lblLock.string = roleSaveData.isUnlocked?"":role.解锁条件;
      });

    // 更新基础信息
    this.lblRoleName.string = role.名称;
    this.lblRoleLevel.string = `Lv.${roleSaveData.level}`;
    this.lblRoleDesc.string = role.描述;
    this.lblPullForce.string = `拉力：${role.等级配置["1"].拉力+roleSaveData.level*2}`;
    this.lblSkillBonus.string = `钓法加成：${role.等级配置["1"].钓法加成+roleSaveData.level*5}%`;
    this.btnBattle.node.active = !roleSaveData.isActive && roleSaveData.isUnlocked;
    this.btnUpgrade.node.active = roleSaveData.isUnlocked && roleSaveData.level < 50;
    this.btnCancelBattle.node.active = roleSaveData.isActive;
    let scale = Math.floor(roleSaveData.level/10);
    let price =(scale+1)*roleSaveData.level*role.等级配置["1"].下一等级解锁价格;

    this.lblUpgradePrice.string = `${price}`;
    this.lblUpgradePrice.node.active = price > 0 && roleSaveData.level < 50;

    // 更新钓法列表
    this.initSkillList(role.技能列表,role.id);

    // // 更新按钮状态（锁定角色禁用按钮）
    // this.btnCancelBattle.node.active = !roleSaveData.isActive;
    // this.btnUpgrade.node.active = !roleSaveData.isActive;

  }

  // 初始化钓法列表
  private initSkillList(skills: {[skillId: string]: number},anglerId: string) {

    let unlockSkillIds: string[] = [];

      let angerSaveData = DH_DataManager.Instance.saveData.anglerData[anglerId];
      let level = angerSaveData?.level  || 0;
      let anglerData = DH_DataManager.Instance.getItemDataById(anglerId) as DH_AnglerJsonData;
      Object.keys(anglerData.技能列表).forEach((key)=>{
          let skillData = anglerData.技能列表[key];
          if(skillData<= level){
              unlockSkillIds.push(key);
          }
      })

    // 清空容器
    this.skillItemContent.children.forEach(child =>{
      if(child.active) child.destroy(); 
    });
    // 无钓法时提示
    if (Object.keys(skills).length === 0) {
      const emptyTip = new Node("EmptyTip");
      emptyTip.parent = this.skillItemContent;
      const lbl = emptyTip.addComponent(Label);
      lbl.string = "暂无解锁钓法";
      return;
    }
    // 遍历钓法创建项
    Object.keys(skills).forEach(skillId => {
      const skillUnlockNum = skills[skillId];
      const skillData = DH_DataManager.Instance.getItemDataById(skillId);
      const skillItem = instantiate(this.skillItemTemplate);
      skillItem.parent = this.skillItemContent;
      skillItem.active = true;

      // 设置图标
      const skillIcon = skillItem.getChildByName("spSkillIcon")?.getComponent(Sprite);
      if (skillIcon) {
         // 更新立绘
        DH_LoadManager.Instance.getSkillIconById(skillId, (frame) => {
          if (!frame) return;
          skillIcon.spriteFrame = frame;
        });
      }

      let isUnlocked = false;
      if(unlockSkillIds.includes(skillId)){
        isUnlocked = true;
      }

      // 设置锁定标签
      skillItem.getChildByName("lock").active = !isUnlocked;

      // 设置名称（含解锁等级）
      const skillNameLabel = skillItem.getChildByName("LblSkillName")?.getComponent(Label);
      skillNameLabel.string = skillData.名称
      const skillUnlockLvLabel = skillItem.getChildByName("LblSkillUnlockLv")?.getComponent(Label);
      skillUnlockLvLabel.string = isUnlocked ? "" : `Lv.${skillUnlockNum} 解锁`;
    });
  }

    // 取消出战按钮事件
  private onBattle() {
    if (!this.currentRole) return;
    let currentAnglerIds = [ ...DH_DataManager.Instance.saveData.gameData.currentAnglerIds]
    if(currentAnglerIds.length >= 3){
      EventManager.Scene.emit(DH_GameEvents.Show_Tip,"最多只能出战3个角色");
      return;
    }
    currentAnglerIds.push(this.currentRole.id);
    DH_DataManager.Instance.setAnglerIds(currentAnglerIds);
    // 刷新角色列表的标签
    this.initRoleList();
    this.onRoleItemClick(this.currentRole,this.currentRoleSaveData);
    // 可选：添加提示
    console.log(`${this.currentRole.名称}已取消出战`);
  }

  // 取消出战按钮事件
  private onCancelBattle() {
    if (!this.currentRole) return;
    let currentAnglerIds = [ ...DH_DataManager.Instance.saveData.gameData.currentAnglerIds]
    currentAnglerIds.splice(currentAnglerIds.indexOf(this.currentRole.id),1);
    DH_DataManager.Instance.setAnglerIds(currentAnglerIds);

    // 刷新角色列表的标签
    this.initRoleList();
    this.onRoleItemClick(this.currentRole,this.currentRoleSaveData);
    // 可选：添加提示
    console.log(`${this.currentRole.名称}已取消出战`);
  }

  // 升级按钮事件（简化版，无金币校验）
  private onUpgradeRole() {
    if (!this.currentRole) return;
    DH_DataManager.Instance.upgradeAngler(this.currentRole.id);
    // 刷新角色列表
    this.initRoleList();
        // 刷新详情面板
    this.onRoleItemClick(this.currentRole,this.currentRoleSaveData);
    console.log(`${this.currentRole.名称}已升级到Lv.${this.currentRoleSaveData.level}`);
  }

  // 返回按钮事件
  private onBack() {
   this.node.active = false;
  }
}