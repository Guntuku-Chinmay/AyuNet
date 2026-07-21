import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { apiClient } from '../lib/axios-client';
import { AxiosError } from 'axios';

type HttpMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface MutationConfig<TVariables> {
  endpoint: string | ((variables: TVariables) => string);
  method?: HttpMethod;
}

export function useApiMutation<TData = any, TVariables = any>(
  config: MutationConfig<TVariables>,
  options?: Omit<UseMutationOptions<TData, AxiosError, TVariables>, 'mutationFn'>
) {
  return useMutation<TData, AxiosError, TVariables>({
    mutationFn: async (variables: TVariables) => {
      const url = typeof config.endpoint === 'function' ? config.endpoint(variables) : config.endpoint;
      const method = config.method || 'POST';

      let response;
      if (method === 'POST') {
        response = await apiClient.post<TData>(url, variables);
      } else if (method === 'PUT') {
        response = await apiClient.put<TData>(url, variables);
      } else if (method === 'PATCH') {
        response = await apiClient.patch<TData>(url, variables);
      } else {
        response = await apiClient.delete<TData>(url, { data: variables });
      }

      return response.data;
    },
    ...options,
  });
}
