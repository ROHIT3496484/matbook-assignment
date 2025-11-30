import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { FormSchema } from '../types';
import DynamicForm from '../components/DynamicForm';

export default function FormPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery<FormSchema>({
    queryKey: ['form-schema'],
    queryFn: async () => {
      const res = await api.get('/api/form-schema');
      return res.data;
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-700">Loading form schema...</div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Failed to load form schema</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-semibold">{data.title}</h1>
        <p className="text-gray-600 mt-2">{data.description}</p>
        <div className="mt-6">
          <DynamicForm
            schema={data}
            onSuccess={() => {
              // Invalidate submissions list after new submission
              queryClient.invalidateQueries({ queryKey: ['submissions'] });
            }}
          />
        </div>
      </div>
    </div>
  );
}
