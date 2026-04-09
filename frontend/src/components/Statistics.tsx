import type { GiftRecord } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Banknote, TrendingUp, Gift } from 'lucide-react';

interface Props {
  records: GiftRecord[];
}

export default function Statistics({ records }: Props) {
  const totalAmount = records.reduce((s, r) => s + r.amount, 0);
  const avgAmount = records.length ? Math.round(totalAmount / records.length) : 0;
  const guestCount = records.length;

  const giftCounts: Record<string, number> = {};
  records.forEach(r => r.gifts.forEach(g => { giftCounts[g] = (giftCounts[g] || 0) + 1; }));
  const topGifts = Object.entries(giftCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const topGuests = [...records].sort((a, b) => b.amount - a.amount).slice(0, 5);

  const stats = [
    { label: '总礼金', value: `¥${totalAmount.toLocaleString()}`, icon: Banknote, gradient: 'gradient-gold shadow-gold', textColor: 'text-gold-dark' },
    { label: '来宾数', value: guestCount, icon: Users, gradient: 'gradient-festive shadow-festive', textColor: 'text-primary' },
    { label: '平均礼金', value: `¥${avgAmount.toLocaleString()}`, icon: TrendingUp, gradient: 'bg-success', textColor: 'text-success' },
    { label: '礼品种类', value: Object.keys(giftCounts).length, icon: Gift, gradient: 'bg-secondary', textColor: 'text-secondary' },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Card key={s.label} className="border-0 shadow-card overflow-hidden animate-slide-up" style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}>
            <CardContent className="p-5 flex flex-col items-center text-center">
              <div className={`w-10 h-10 rounded-xl ${s.gradient} flex items-center justify-center mb-3`}>
                <s.icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.textColor}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {topGuests.length > 0 && (
          <Card className="border-0 shadow-card">
            <CardContent className="p-5">
              <h4 className="font-bold mb-4 flex items-center gap-2">
                <span className="text-lg">🏆</span> 礼金排行
              </h4>
              <div className="space-y-1">
                {topGuests.map((r, i) => (
                  <div key={r.id} className="flex justify-between items-center py-2.5 px-3 rounded-xl hover:bg-muted/50 transition-colors">
                    <span className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'gradient-gold text-primary-foreground' : i === 1 ? 'bg-muted-foreground/20 text-muted-foreground' : i === 2 ? 'bg-secondary/20 text-secondary' : 'bg-muted text-muted-foreground'}`}>
                        {i + 1}
                      </span>
                      <span className="font-medium">{r.guest_name}</span>
                    </span>
                    <span className="text-gold-dark font-bold">¥{r.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        {topGifts.length > 0 && (
          <Card className="border-0 shadow-card">
            <CardContent className="p-5">
              <h4 className="font-bold mb-4 flex items-center gap-2">
                <span className="text-lg">🎁</span> 礼品统计
              </h4>
              <div className="space-y-1">
                {topGifts.map(([name, count]) => (
                  <div key={name} className="flex justify-between items-center py-2.5 px-3 rounded-xl hover:bg-muted/50 transition-colors">
                    <span className="font-medium">{name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full gradient-festive" style={{ width: `${(count / records.length) * 100}%` }} />
                      </div>
                      <span className="text-sm text-muted-foreground w-12 text-right">{count} 份</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
