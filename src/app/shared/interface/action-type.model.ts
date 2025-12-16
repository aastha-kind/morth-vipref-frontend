export interface ActionType {
  actionConfigId:number
  actionName:string
  actionType:string
  description:string,
  fromQueue:string,
  requiresTargetUser:boolean,
  toQueue:string
}
