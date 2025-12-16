export interface Action{
    value:string;
    label:string;
}

export const ROLE_BASED_ACTION_OPTIONS: { [key: string]: Action[] } = {
  VIP_Assigner: [
    { value: 'forward', label: 'Forward' },
    { value: 'discard', label: 'Discard' }
  ],
  VIP_Assignee: [
    { value: 'forward', label: 'Forward' },
    { value: 'assign_back', label: 'Assign Back To Assigner' }
  ], 
  VIP_Final_Reply: [
    { value: 'forward', label: 'Forward' },
    { value: 'close', label: 'Close' }
  ]
};