export interface GAResponse<T = undefined> {
  ok: boolean
  message: string
  data: T
}
