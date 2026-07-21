import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { apiClient } from '../lib/axios-client';
import { AxiosError } from 'axios';

export function useApiQuery<TData = any>(
  queryKey: string[],
  endpoint: string,
  options?: Omit<UseQueryOptions<TData, AxiosError>, 'queryKey' | 'queryFn'>
) {
  return useQuery<TData, AxiosError>({
    queryKey,
    queryFn: async () => {
      const response = await apiClient.get<TData>(endpoint);
      return response.data;
    },
    ...options,
  });
}
