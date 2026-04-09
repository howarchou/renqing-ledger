import { useState, useMemo } from 'react';
import type { GiftRecord } from '@/lib/api';
import { SortOrder, ViewMode } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpDown, Search, LayoutGrid, List, Trash2, Pencil } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Props {
  records: GiftRecord[];
  onDelete?: (id: string) => void;
  onEdit?: (record: GiftRecord) => void;
}

export default function GiftRecordList({ records, onDelete, onEdit }: Props) {
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const hasActions = !!(onEdit || onDelete);

  const filtered = useMemo(() => {
    let list = records;
    if (search.trim()) {
      list = list.filter(r => r.guest_name.includes(search.trim()));
    }
    return list.sort((a, b) => sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount);
  }, [records, search, sortOrder]);

  const DeleteButton = ({ id, size = 'icon' }: { id: string; size?: 'icon' | 'sm' }) => {
    if (!onDelete) return null;
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size={size} className={size === 'icon' ? 'h-8 w-8 text-muted-foreground hover:text-destructive' : 'h-7 w-7 text-muted-foreground hover:text-destructive'}>
            <Trash2 className={size === 'icon' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>确定要删除这条记录吗？此操作不可撤销。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

  const EditButton = ({ record, size = 'icon' }: { record: GiftRecord; size?: 'icon' | 'sm' }) => {
    if (!onEdit) return null;
    return (
      <Button variant="ghost" size={size} className={size === 'icon' ? 'h-8 w-8 text-muted-foreground hover:text-primary' : 'h-7 w-7 text-muted-foreground hover:text-primary'} onClick={() => onEdit(record)}>
        <Pencil className={size === 'icon' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      </Button>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索来宾姓名" className="pl-10 h-11" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-11 gap-1" onClick={() => setSortOrder(s => s === 'desc' ? 'asc' : 'desc')}>
            <ArrowUpDown className="w-4 h-4" />
            {sortOrder === 'desc' ? '金额↓' : '金额↑'}
          </Button>
          <Button variant="outline" size="icon" className="h-11 w-11" onClick={() => setViewMode(v => v === 'table' ? 'card' : 'table')}>
            {viewMode === 'table' ? <LayoutGrid className="w-4 h-4" /> : <List className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">暂无记录</p>
      ) : viewMode === 'table' ? (
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-sm w-12">序</TableHead>
                <TableHead className="text-base">来宾</TableHead>
                <TableHead className="text-base">礼金</TableHead>
                <TableHead className="text-base">礼品</TableHead>
                <TableHead className="text-base">备注</TableHead>
                {hasActions && <TableHead className="w-20">操作</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r, i) => (
                <TableRow key={r.id} className="animate-fade-in">
                  <TableCell className="text-muted-foreground text-sm">{i + 1}</TableCell>
                  <TableCell className="font-medium text-base">{r.guest_name}</TableCell>
                  <TableCell className="text-gold font-semibold text-base">¥{r.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {r.gifts.map(g => <Badge key={g} variant="secondary" className="text-xs">{g}</Badge>)}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{r.note}</TableCell>
                  {hasActions && (
                    <TableCell>
                      <div className="flex gap-1">
                        <EditButton record={r} />
                        <DeleteButton id={r.id} />
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((r, i) => (
            <Card key={r.id} className="animate-fade-in group">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">#{i + 1}</span>
                    <span className="font-semibold text-lg">{r.guest_name}</span>
                  </div>
                  {hasActions && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <EditButton record={r} size="sm" />
                      <DeleteButton id={r.id} size="sm" />
                    </div>
                  )}
                </div>
                <p className="text-gold font-bold text-xl mb-2">¥{r.amount.toLocaleString()}</p>
                {r.gifts.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {r.gifts.map(g => <Badge key={g} variant="secondary" className="text-xs">{g}</Badge>)}
                  </div>
                )}
                {r.note && <p className="text-sm text-muted-foreground">{r.note}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
