import { ApiResponseDto } from '../types/api-response.type';

export const ApiResponseBuilder = {
  success<T = null>(message: string, data?: T): ApiResponseDto<T | null> {
    return {
      message,
      data: data ?? null,
    };
  },

  created<T = null>(
    data?: T,
    message = 'Успешно создано',
  ): ApiResponseDto<T | null> {
    return {
      message,
      data: data ?? null,
    };
  },

  updated<T = null>(
    data?: T,
    message = 'Успешно обновлено',
  ): ApiResponseDto<T | null> {
    return {
      message,
      data: data ?? null,
    };
  },

  deleted(message = 'Успешно удалено'): ApiResponseDto<null> {
    return {
      message,
      data: null,
    };
  },
};
