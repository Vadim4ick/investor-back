export type ApiResponseDto<T = null> = {
  message: string;
  data: T;
};
