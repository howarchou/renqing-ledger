import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import { BanquetType, BANQUET_TYPES } from '@/types';
import { format, parseISO } from 'date-fns';

interface Props {
  onAdd: (b: { name: string; date: string; location: string; type: BanquetType }) => void;
}

const TYPE_EMOJI: Record<string, string> = {
  '寿宴': '🎂',
  '婚礼': '💒',
  '满月宴': '👶',
  '乔迁宴': '🏠',
  '升学宴': '🎓',
  '其他': '🎉',
};

export default function CreateBanquetDialog({ onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [dateOpen, setDateOpen] = useState(false);
  const [location, setLocation] = useState('');
  const [type, setType] = useState<BanquetType>('寿宴');

  const handleSubmit = () => {
    if (!name.trim() || !date) return;
    onAdd({ name: name.trim(), date, location: location.trim(), type });
    setName(''); setDate(''); setLocation(''); setType('寿宴');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="h-9 px-6 text-base gap-2 gradient-festive shadow-festive rounded-xl font-semibold">
          <Plus className="w-5 h-5" />
          新建宴会
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl w-[calc(100%-2rem)] max-w-[calc(100%-2rem)]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">🎉 新建宴会</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">宴会名称 *</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="如：张三婚礼" className="h-12 text-base rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">类型 *</Label>
            <Select value={type} onValueChange={v => setType(v as BanquetType)}>
              <SelectTrigger className="h-12 text-base rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl max-h-80">
                {BANQUET_TYPES.map(t => (
                  <SelectItem className={"h-10"} key={t} value={t}>
                    {TYPE_EMOJI[t] || '🎉'} {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">日期 *</Label>
            <Popover open={dateOpen} onOpenChange={setDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-12 text-base rounded-xl w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(parseISO(date), 'yyyy年MM月dd日') : '请选择日期'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date ? parseISO(date) : undefined}
                  onSelect={(d) => {
                    setDate(d ? format(d, 'yyyy-MM-dd') : '');
                    setDateOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">地点</Label>
            <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="如：XX酒店" className="h-12 text-base rounded-xl" />
          </div>
          <Button onClick={handleSubmit} className="w-full h-12 text-lg font-semibold rounded-xl gradient-festive shadow-festive" disabled={!name.trim() || !date}>
            ✨ 创建
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
