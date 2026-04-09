import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Settings2, X, Pencil } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { GiftRecord } from '@/lib/api';

interface Props {
  banquetId: string;
  onAdd: (r: { guest_name: string; amount: number; gifts: string[]; note: string }) => void;
  giftPresets: string[];
  amountPresets: number[];
  onAddGiftPreset: (g: string) => void;
  onRemoveGiftPreset: (g: string) => void;
  onAddAmountPreset: (a: number) => void;
  onRemoveAmountPreset: (a: number) => void;
  editingRecord?: GiftRecord | null;
  onUpdate?: (r: GiftRecord) => void;
  onCancelEdit?: () => void;
}

export default function GiftRecordForm({
  banquetId, onAdd, giftPresets, amountPresets,
  onAddGiftPreset, onRemoveGiftPreset,
  onAddAmountPreset, onRemoveAmountPreset,
  editingRecord, onUpdate, onCancelEdit,
}: Props) {
  const [guestName, setGuestName] = useState(editingRecord?.guest_name || '');
  const [amount, setAmount] = useState(editingRecord?.amount?.toString() || '');
  const [selectedGifts, setSelectedGifts] = useState<string[]>(editingRecord?.gifts || []);
  const [customGift, setCustomGift] = useState('');
  const [note, setNote] = useState(editingRecord?.note || '');
  const [newPresetGift, setNewPresetGift] = useState('');
  const [newPresetAmount, setNewPresetAmount] = useState('');

  const [prevEditId, setPrevEditId] = useState(editingRecord?.id);
  if (editingRecord?.id !== prevEditId) {
    setPrevEditId(editingRecord?.id);
    setGuestName(editingRecord?.guest_name || '');
    setAmount(editingRecord?.amount?.toString() || '');
    setSelectedGifts(editingRecord?.gifts || []);
    setNote(editingRecord?.note || '');
  }

  const toggleGift = (g: string) => {
    setSelectedGifts(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  };

  const addCustomGift = () => {
    if (customGift.trim() && !selectedGifts.includes(customGift.trim())) {
      setSelectedGifts(prev => [...prev, customGift.trim()]);
      setCustomGift('');
    }
  };

  const handleSubmit = () => {
    if (!guestName.trim() || !Number(amount)) return;
    const data = {
      guest_name: guestName.trim(),
      amount: Number(amount) || 0,
      gifts: selectedGifts,
      note: note.trim(),
    };
    if (editingRecord && onUpdate) {
      onUpdate({
        ...editingRecord,
        guest_name: data.guest_name,
        amount: data.amount,
        gifts: data.gifts,
        note: data.note,
      });
    } else {
      onAdd(data);
    }
    setGuestName(''); setAmount(''); setSelectedGifts([]); setNote('');
  };

  const handleCancel = () => {
    setGuestName(''); setAmount(''); setSelectedGifts([]); setNote('');
    onCancelEdit?.();
  };

  const isEditing = !!editingRecord;

  return (
    <div className={`rounded-2xl border shadow-card p-6 space-y-5 transition-colors ${isEditing ? 'bg-accent/40 border-primary/20' : 'bg-card border-border/40'}`}>
      <h3 className="text-lg font-bold flex items-center gap-2.5">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isEditing ? 'bg-primary/10' : 'gradient-festive shadow-festive'}`}>
          {isEditing
            ? <Pencil className="w-4 h-4 text-primary" />
            : <Plus className="w-4 h-4 text-primary-foreground" />
          }
        </div>
        {isEditing ? '编辑记录' : '快速录入'}
      </h3>

      <div className="space-y-1.5">
          <Label className="text-sm font-medium h-6">来宾姓名 *</Label>
          <Input value={guestName} onChange={e => setGuestName(e.target.value)} placeholder="姓名" className="h-12 text-base rounded-xl" />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium h-6">礼金金额</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-1 text-muted-foreground text-xs rounded-lg">
                  <Settings2 className="w-3.5 h-3.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 space-y-3 rounded-xl">
                <p className="text-sm font-semibold">管理金额预设</p>
                <div className="flex flex-wrap gap-1.5">
                  {amountPresets.map(a => (
                    <Badge key={a} variant="secondary" className="gap-1 cursor-pointer rounded-lg" onClick={() => onRemoveAmountPreset(a)}>
                      ¥{a} <X className="w-3 h-3" />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input type="number" value={newPresetAmount} onChange={e => setNewPresetAmount(e.target.value)} placeholder="新金额" className="h-9 rounded-lg" />
                  <Button size="sm" className="h-9 rounded-lg" onClick={() => {
                    const v = Number(newPresetAmount);
                    if (v > 0) { onAddAmountPreset(v); setNewPresetAmount(''); }
                  }}>添加</Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" className="h-12 text-base rounded-xl" />
          <div className="flex flex-wrap gap-2 mt-2">
            {amountPresets.map(a => (
              <div
                key={a}
                className={`cursor-pointer h-10 px-3 text-sm font-medium rounded-xl border leading-none ${Number(amount) === a ? 'gradient-festive shadow-festive border-primary/20 text-primary-foreground' : 'border-border bg-transparent text-foreground hover:border-primary/40'} flex items-center justify-center`}
                onClick={() => setAmount(a.toString())}
              >
                ¥{a}
              </div>
            ))}
          </div>
        </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium h-6">礼品</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 gap-1 text-muted-foreground text-xs rounded-lg">
                <Settings2 className="w-3.5 h-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 space-y-3 rounded-xl">
              <p className="text-sm font-semibold">管理礼品预设</p>
              <div className="flex flex-wrap gap-1.5">
                {giftPresets.map(g => (
                  <Badge key={g} variant="secondary" className="gap-1 cursor-pointer rounded-lg" onClick={() => onRemoveGiftPreset(g)}>
                    {g} <X className="w-3 h-3" />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={newPresetGift} onChange={e => setNewPresetGift(e.target.value)} placeholder="新礼品名称" className="h-9 rounded-lg" />
                <Button size="sm" className="h-9 rounded-lg" onClick={() => {
                  if (newPresetGift.trim()) { onAddGiftPreset(newPresetGift.trim()); setNewPresetGift(''); }
                }}>添加</Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex flex-wrap gap-2">
          {giftPresets.map(g => (
            <div
              key={g}
              className={`cursor-pointer h-10 px-3 text-sm font-medium rounded-xl border leading-none ${selectedGifts.includes(g) ? 'gradient-festive shadow-festive border-primary/20 text-primary-foreground' : 'border-border bg-transparent text-foreground hover:border-primary/40'} flex items-center justify-center`}
              onClick={() => toggleGift(g)}
            >
              {g}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input value={customGift} onChange={e => setCustomGift(e.target.value)} placeholder="自定义礼品" className="h-10 rounded-xl"
            onKeyDown={e => e.key === 'Enter' && addCustomGift()} />
          <Button variant="outline" size="sm" onClick={addCustomGift} className="h-10 rounded-xl px-4">添加</Button>
        </div>
        {selectedGifts.filter(g => !giftPresets.includes(g)).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {selectedGifts.filter(g => !giftPresets.includes(g)).map(g => (
              <Badge key={g} className="cursor-pointer rounded-lg gap-1" onClick={() => toggleGift(g)}>{g} <X className="w-3 h-3" /></Badge>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium h-6">备注</Label>
        <Textarea value={note} onChange={e => setNote(e.target.value)} placeholder="关系/说明" className="text-base rounded-xl" rows={2} />
      </div>

      <div className="flex gap-3 pt-1">
        <Button onClick={handleSubmit} className={`flex-1 h-13 text-lg font-semibold rounded-xl ${isEditing ? '' : 'gradient-festive shadow-festive'}`} disabled={!guestName.trim() || !Number(amount)}>
          {isEditing ? '💾 保存修改' : '✨ 添加记录'}
        </Button>
        {isEditing && (
          <Button variant="outline" onClick={handleCancel} className="h-13 text-lg px-8 rounded-xl">
            取消
          </Button>
        )}
      </div>
    </div>
  );
}
