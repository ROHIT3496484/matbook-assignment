import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { PaginatedSubmissions } from '../types';
import { Button } from '../components/ui/button';
import { Select } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';

export default function SubmissionsPage() {
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');
  const [viewItem, setViewItem] = React.useState<any | null>(null);

  const { data, isLoading, isError } = useQuery<PaginatedSubmissions>({
    queryKey: ['submissions', page, limit, sortOrder],
    queryFn: async () => {
      const params = { page, limit, sortBy: 'createdAt', sortOrder };
      const res = await api.get('/api/submissions', { params });
      return res.data;
    },
    keepPreviousData: true
  });

  function exportCsv() {
    if (!data?.items?.length) return;
    const header = ['id', 'createdAt', 'data'];
    const rows = data.items.map((item) => {
      const json = JSON.stringify(item.data).replace(/"/g, '""');
      return [item.id, item.createdAt, `"${json}"`].join(',');
    });
    const csv = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `submissions_page${page}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-700">Loading submissions...</div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Failed to load submissions</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Submissions</h1>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => setSortOrder((s) => (s === 'asc' ? 'desc' : 'asc'))}>
              Sort: {sortOrder.toUpperCase()}
            </Button>
            <Button onClick={exportCsv}>Export CSV (page)</Button>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <span className="text-sm text-gray-700">Items per page:</span>
          <Select
            value={String(limit)}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </Select>
        </div>

        <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-white dark:bg-gray-900">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">ID</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">Name</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">Department</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">Created At</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {data.items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{item.id}</td>
                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                    <div className="flex items-center gap-2">
                      <span>{item.data?.fullName || '-'}</span>
                      {item.data?.remote ? (
                        <span className="inline-flex items-center rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">Remote</span>
                      ) : (
                        <span className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700">On-site</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                    {item.data?.department || '-'}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{new Date(item.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-2 text-sm">
                    <Button variant="secondary" onClick={() => setViewItem(item)}>View</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Page {data.page} of {data.totalPages} • Total {data.total}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" disabled={data.page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Prev
            </Button>
            <Button variant="secondary" disabled={data.page >= data.totalPages} onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}>
              Next
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={!!viewItem} onOpenChange={(o) => !o && setViewItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submission Detail</DialogTitle>
            <DialogDescription>
              {viewItem ? (
                <div className="space-y-1 text-sm">
                  <div><span className="text-gray-600">Name:</span> {viewItem.data?.fullName || '-'}</div>
                  <div><span className="text-gray-600">Email:</span> {viewItem.data?.email || '-'}</div>
                  <div><span className="text-gray-600">Department:</span> {viewItem.data?.department || '-'}</div>
                  <div><span className="text-gray-600">Start Date:</span> {viewItem.data?.startDate || '-'}</div>
                </div>
              ) : 'View the submitted JSON payload.'}
            </DialogDescription>
          </DialogHeader>
          <pre className="max-h-80 overflow-auto rounded bg-gray-100 p-3 text-xs dark:bg-gray-800 dark:text-gray-100">
{viewItem ? JSON.stringify(viewItem.data, null, 2) : ''}
          </pre>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setViewItem(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
