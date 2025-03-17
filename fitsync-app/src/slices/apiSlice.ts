import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs } from '@reduxjs/toolkit/query/react';

const baseQuery: BaseQueryFn<string | FetchArgs> = fetchBaseQuery({ baseUrl: '' });

// Create the API slice
export const apiSlice = createApi({
  reducerPath: 'api', // 
  baseQuery,
  tagTypes: ['User',],
  endpoints: () => ({}), 
});
