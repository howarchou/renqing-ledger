import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { Banquet, BanquetType, BANQUET_TYPES } from '@/types';

interface Props {
  onAdd: (b: Omit<Banquet, 'id' | 'createdAt'>) => void;
}

const TYPE_EMOJI: Record<string, string> = {
  '婚礼': '💒',
  '满月宴': '👶',
  '乔迁宴': '🏠',
  '寿宴': '🎂',
  '升学宴': '🎓',
  '其他': '🎉',
};

export default function CreateBanquetDialog({ onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState<BanquetType>('婚礼');

  const handleSubmit = () => {
    if (!name.trim() || !date) return;
    onAdd({ name: name.trim(), date, location: location.trim(), type });
    setName(''); setDate(''); setLocation(''); setType('婚礼');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="h-12 px-6 text-base gap-2 gradient-festive shadow-festive rounded-xl font-semibold">
          <Plus className="w-5 h-5" />
          新建宴会
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">🎉 新建宴会</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">宴会名称 *</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="如：张三婚礼" className="h-12 text-base rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">日期 *</Label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="h-12 text-base rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">地点</Label>
            <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="如：XX酒店" className="h-12 text-base rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">类型</Label>
            <Select value={type} onValueChange={v => setType(v as BanquetType)}>
              <SelectTrigger className="h-12 text-base rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {BANQUET_TYPES.map(t => (
                  <SelectItem key={t} value={t}>
                    {TYPE_EMOJI[t] || '🎉'} {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSubmit} className="w-full h-12 text-lg font-semibold rounded-xl gradient-festive shadow-festive" disabled={!name.trim() || !date}>
            ✨ 创建
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
