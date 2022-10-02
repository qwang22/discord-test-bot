type CommandType = 'function' | 'where';

interface ITextCommand {
  name: string;
  type: CommandType;
  callback: string;
}

interface ITextCommandList {
  commands: ITextCommand[]
}

export { CommandType, ITextCommand, ITextCommandList }