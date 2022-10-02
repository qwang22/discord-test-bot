type Action = 'send' | 'reply';

interface IMessageResponse {
  message: string;
  action: Action;
  response: string;
}

interface IMessageResponseList {
  responses: IMessageResponse[]
}

export { Action, IMessageResponse, IMessageResponseList }