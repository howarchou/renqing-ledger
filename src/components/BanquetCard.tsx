import { Banquet, GiftRecord } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Users, Banknote, Trash2, Archive } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Props {
  banquet: Banquet;
  records: GiftRecord[];
  onDelete: (id: string) => void;
  onFreeze: (id: string) => void;
}

const TYPE_EMOJI: Record<string, string> = {
  '婚礼': '💒',
  '满月宴': '👶',
  '乔迁宴': '🏠',
  '寿宴': '🎂',
  '升学宴': '🎓',
  '其他': '🎉',
};

export default function BanquetCard({ banquet, records, onDelete, onFreeze }: Props) {
  const navigate = useNavigate();
  const totalAmount = records.reduce((s, r) => s + r.amount, 0);

  return (
    <Card
      className={`cursor-pointer shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1.5 border-0 overflow-hidden group ${banquet.frozen ? 'opacity-65 grayscale-[20%]' : ''}`}
      onClick={() => navigate(`/banquet/${banquet.id}`)}
    >
      {/* Top accent bar */}
      <div className={`h-1.5 w-full ${banquet.frozen ? 'bg-muted-foreground/30' : 'gradient-festive'}`} />

      <CardContent className="p-5 pt-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-festive-light flex items-center justify-center text-2xl shrink-0">
              {TYPE_EMOJI[banquet.type] || '🎉'}
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-foreground truncate">{banquet.name}</h3>
              {banquet.frozen && (
                <Badge variant="secondary" className="gap-1 text-xs mt-0.5 bg-muted text-muted-foreground">
                  <Archive className="w-3 h-3" /> 已归档
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            {!banquet.frozen && (
              <>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={e => e.stopPropagation()}>
                      <Archive className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent onClick={e => e.stopPropagation()}>
                    <AlertDialogHeader>
                      <AlertDialogTitle>确认归档宴会</AlertDialogTitle>
                      <AlertDialogDescription>确定要归档「{banquet.name}」吗？归档后将无法修改或删除其中的记录。</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>取消</AlertDialogCancel>
                      <AlertDialogAction onClick={e => { e.stopPropagation(); onFreeze(banquet.id); }}>确认归档</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={e => e.stopPropagation()}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent onClick={e => e.stopPropagation()}>
                    <AlertDialogHeader>
                      <AlertDialogTitle>确认删除宴会</AlertDialogTitle>
                      <AlertDialogDescription>确定要永久删除「{banquet.name}」吗？所有关联的礼金记录也将被删除，此操作不可撤销。</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>取消</AlertDialogCancel>
                      <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={e => { e.stopPropagation(); onDelete(banquet.id); }}>永久删除</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>

        <div className="space-y-1.5 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>{banquet.date}</span>
          </div>
          {banquet.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate">{banquet.location}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-5 pt-3 border-t border-border/40">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
              <Users className="w-3.5 h-3.5 text-accent-foreground" />
            </div>
            <span>
              <span className="font-semibold text-foreground">{records.length}</span>
              <span className="text-muted-foreground ml-0.5">位</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-7 h-7 rounded-lg bg-gold-light/30 flex items-center justify-center">
              <Banknote className="w-3.5 h-3.5 text-gold-dark" />
            </div>
            <span className="font-bold text-gold-dark">¥{totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
