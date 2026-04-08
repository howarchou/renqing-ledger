import { useBanquets } from '@/hooks/useBanquets';
import BanquetCard from '@/components/BanquetCard';
import CreateBanquetDialog from '@/components/CreateBanquetDialog';
import { Scroll, Sparkles } from 'lucide-react';

export default function Index() {
  const { banquets, records, addBanquet, deleteBanquet, freezeBanquet, getRecords } = useBanquets();

  return (
    <div className="min-h-screen bg-background festive-pattern">
      {/* Header */}
      <header className="sticky top-0 z-10 glass border-b border-border/40">
        <div className="container max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl gradient-festive shadow-festive flex items-center justify-center">
              <Scroll className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">人情簿</h1>
              <p className="text-xs text-muted-foreground">礼金 · 礼品 · 人情往来</p>
            </div>
          </div>
          <CreateBanquetDialog onAdd={addBanquet} />
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-5xl mx-auto px-4 py-8">
        {banquets.length === 0 ? (
          <div className="text-center py-24 animate-fade-in">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-festive-light mb-6">
              <span className="text-5xl">🎉</span>
            </div>
            <h2 className="text-2xl font-bold mb-3 text-foreground">还没有宴会记录</h2>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
              点击右上角「新建宴会」开始记录人情往来
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground/60">
              <Sparkles className="w-4 h-4" />
              <span>支持婚礼、满月宴、乔迁宴等多种场景</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {banquets.map((b, i) => (
              <div key={b.id} className="animate-slide-up" style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}>
                <BanquetCard banquet={b} records={getRecords(b.id)} onDelete={deleteBanquet} onFreeze={freezeBanquet} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
