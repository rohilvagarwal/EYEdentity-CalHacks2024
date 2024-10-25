export interface Fetch extends ScriptComponent {
  fetch: (
    data: string,
    width: number,
    height: number,
    callback: (text: string) => void
  ) => string;
}
