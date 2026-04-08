import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBanquets } from '@/hooks/useBanquets';
import { usePresets } from '@/hooks/usePresets';
import GiftRecordForm from '@/components/GiftRecordForm';
import GiftRecordList from '@/components/GiftRecordList';
import Statistics from '@/components/Statistics';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Download, Scroll, Archive } from 'lucide-react';
import { exportToCSV } from '@/lib/export';
import { GiftRecord } from '@/types';

export default function BanquetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getBanquet, getRecords, addRecord, deleteRecord, updateRecord } = useBanquets();
  const presets = usePresets();
  const [editingRecord, setEditingRecord] = useState<GiftRecord | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const banquet = getBanquet(id || '');
  const records = getRecords(id || '');
  const isFrozen = banquet?.frozen === true;

  const handleEdit = (record: GiftRecord) => {
    if (isFrozen) return;
    setEditingRecord(record);
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleUpdate = (record: GiftRecord) => {
    updateRecord(record);
    setEditingRecord(null);
  };

  if (!banquet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background festive-pattern">
        <div className="text-center animate-fade-in">
          <div className="text-5xl mb-4">😅</div>
          <p className="text-xl mb-4 font-semibold">宴会不存在</p>
          <Button onClick={() => navigate('/')} size="lg" className="gradient-festive shadow-festive">
            返回首页
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background festive-pattern">
      {/* Header */}
      <header className="sticky top-0 z-10 glass border-b border-border/40">
        <div className="container max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="h-10 w-10 rounded-xl hover:bg-accent">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl gradient-festive shadow-festive flex items-center justify-center">
                <Scroll className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-foreground">{banquet.name}</h1>
                  {isFrozen && (
                    <Badge variant="secondary" className="gap-1 text-xs bg-muted text-muted-foreground">
                      <Archive className="w-3 h-3" /> 已归档
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{banquet.date} · {banquet.location || banquet.type}</p>
              </div>
            </div>
          </div>
          <Button variant="outline" className="h-10 gap-2 rounded-xl" onClick={() => exportToCSV(records, banquet.name, banquet.date)}>
            <Download className="w-4 h-4" /> 导出
          </Button>
        </div>
      </header>

      {/* Main */}
      <main className="container max-w-5xl mx-auto px-4 py-4 space-y-4">
        {!isFrozen && (
          <div ref={formRef} className="animate-fade-in">
            <GiftRecordForm
              banquetId={banquet.id}
              onAdd={addRecord}
              giftPresets={presets.giftPresets}
              amountPresets={presets.amountPresets}
              onAddGiftPreset={presets.addGiftPreset}
              onRemoveGiftPreset={presets.removeGiftPreset}
              onAddAmountPreset={presets.addAmountPreset}
              onRemoveAmountPreset={presets.removeAmountPreset}
              editingRecord={editingRecord}
              onUpdate={handleUpdate}
              onCancelEdit={() => setEditingRecord(null)}
            />
          </div>
        )}

        {isFrozen && (
          <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground text-sm rounded-2xl bg-muted/50 border border-border/40 animate-fade-in">
            <Archive className="w-4 h-4" />
            该宴会已归档，记录仅供查看，无法修改或删除
          </div>
        )}

        <Tabs defaultValue="records">
          <TabsList className="w-full grid grid-cols-2 h-12 rounded-xl bg-muted/60 p-1">
            <TabsTrigger value="records" className="text-base rounded-lg data-[state=active]:shadow-sm">📋 记录列表</TabsTrigger>
            <TabsTrigger value="stats" className="text-base rounded-lg data-[state=active]:shadow-sm">📊 统计分析</TabsTrigger>
          </TabsList>
          <TabsContent value="records" className="mt-4 animate-fade-in">
            <GiftRecordList
              records={records}
              onDelete={isFrozen ? undefined : deleteRecord}
              onEdit={isFrozen ? undefined : handleEdit}
            />
          </TabsContent>
          <TabsContent value="stats" className="mt-4 animate-fade-in">
            <Statistics records={records} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
