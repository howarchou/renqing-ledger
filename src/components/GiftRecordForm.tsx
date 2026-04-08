import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { GiftRecord } from '@/types';
import { Plus, Settings2, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface Props {
  banquetId: string;
  onAdd: (r: Omit<GiftRecord, 'id' | 'createdAt'>) => void;
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
  const [guestName, setGuestName] = useState(editingRecord?.guestName || '');
  const [amount, setAmount] = useState(editingRecord?.amount?.toString() || '');
  const [selectedGifts, setSelectedGifts] = useState<string[]>(editingRecord?.gifts || []);
  const [customGift, setCustomGift] = useState('');
  const [note, setNote] = useState(editingRecord?.note || '');
  const [newPresetGift, setNewPresetGift] = useState('');
  const [newPresetAmount, setNewPresetAmount] = useState('');

  // Sync form when editingRecord changes
  const [prevEditId, setPrevEditId] = useState(editingRecord?.id);
  if (editingRecord?.id !== prevEditId) {
    setPrevEditId(editingRecord?.id);
    setGuestName(editingRecord?.guestName || '');
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
    if (!guestName.trim()) return;
    const data = {
      banquetId,
      guestName: guestName.trim(),
      amount: Number(amount) || 0,
      gifts: selectedGifts,
      note: note.trim(),
    };
    if (editingRecord && onUpdate) {
      onUpdate({ ...editingRecord, ...data });
    } else {
      onAdd(data);
    }
    setGuestName(''); setAmount(''); setSelectedGifts([]); setNote('');
  };

  const handleCancel = () => {
    setGuestName(''); setAmount(''); setSelectedGifts([]); setNote('');
    onCancelEdit?.();
  };

  return (
    <div className={`rounded-xl border p-5 space-y-4 ${editingRecord ? 'bg-accent/20 border-primary/30' : 'bg-card border-border'}`}>
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Plus className="w-5 h-5 text-primary" />
        {editingRecord ? '编辑记录' : '快速录入'}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-base">来宾姓名 *</Label>
          <Input value={guestName} onChange={e => setGuestName(e.target.value)} placeholder="姓名" className="h-12 text-base mt-1" />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label className="text-base">礼金金额</Label>
          </div>
          <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" className="h-12 text-base mt-1" />
          <div className="flex flex-wrap gap-2 mt-2">
            {amountPresets.map(a => (
              <Badge
                key={a}
                variant={Number(amount) === a ? 'default' : 'outline'}
                className="cursor-pointer h-8 px-3 text-sm transition-colors"
                onClick={() => setAmount(a.toString())}
              >
                ¥{a}
              </Badge>
            ))}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Settings2 className="w-3.5 h-3.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 space-y-3">
                <p className="text-sm font-medium">管理金额预设</p>
                <div className="flex flex-wrap gap-1.5">
                  {amountPresets.map(a => (
                    <Badge key={a} variant="secondary" className="gap-1 cursor-pointer" onClick={() => onRemoveAmountPreset(a)}>
                      ¥{a} <X className="w-3 h-3" />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input type="number" value={newPresetAmount} onChange={e => setNewPresetAmount(e.target.value)} placeholder="新金额" className="h-9" />
                  <Button size="sm" className="h-9" onClick={() => {
                    const v = Number(newPresetAmount);
                    if (v > 0) { onAddAmountPreset(v); setNewPresetAmount(''); }
                  }}>添加</Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-base">礼品</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 gap-1 text-muted-foreground">
                <Settings2 className="w-3.5 h-3.5" /> 管理预设
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 space-y-3">
              <p className="text-sm font-medium">管理礼品预设</p>
              <div className="flex flex-wrap gap-1.5">
                {giftPresets.map(g => (
                  <Badge key={g} variant="secondary" className="gap-1 cursor-pointer" onClick={() => onRemoveGiftPreset(g)}>
                    {g} <X className="w-3 h-3" />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={newPresetGift} onChange={e => setNewPresetGift(e.target.value)} placeholder="新礼品名称" className="h-9" />
                <Button size="sm" className="h-9" onClick={() => {
                  if (newPresetGift.trim()) { onAddGiftPreset(newPresetGift.trim()); setNewPresetGift(''); }
                }}>添加</Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex flex-wrap gap-2 mb-2">
          {giftPresets.map(g => (
            <Badge
              key={g}
              variant={selectedGifts.includes(g) ? 'default' : 'outline'}
              className="cursor-pointer h-9 px-4 text-sm transition-colors"
              onClick={() => toggleGift(g)}
            >
              {g}
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input value={customGift} onChange={e => setCustomGift(e.target.value)} placeholder="自定义礼品" className="h-10"
            onKeyDown={e => e.key === 'Enter' && addCustomGift()} />
          <Button variant="outline" size="sm" onClick={addCustomGift} className="h-10">添加</Button>
        </div>
        {selectedGifts.filter(g => !giftPresets.includes(g)).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedGifts.filter(g => !giftPresets.includes(g)).map(g => (
              <Badge key={g} className="cursor-pointer" onClick={() => toggleGift(g)}>{g} ✕</Badge>
            ))}
          </div>
        )}
      </div>
      <div>
        <Label className="text-base">备注</Label>
        <Textarea value={note} onChange={e => setNote(e.target.value)} placeholder="关系/说明" className="mt-1 text-base" rows={2} />
      </div>
      <div className="flex gap-3">
        <Button onClick={handleSubmit} className="flex-1 h-12 text-lg" disabled={!guestName.trim()}>
          {editingRecord ? '保存修改' : '添加记录'}
        </Button>
        {editingRecord && (
          <Button variant="outline" onClick={handleCancel} className="h-12 text-lg px-6">
            取消
          </Button>
        )}
      </div>
    </div>
  );
}
