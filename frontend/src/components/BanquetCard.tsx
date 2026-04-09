import type { Banquet, GiftRecord } from '@/lib/api';
import type { DataSource } from '@/hooks/useBanquets';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Users, Banknote, Trash2, Archive, MoreHorizontal, Check, Cloud, Smartphone, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Props {
  banquet: Banquet;
  records: GiftRecord[];
  source: DataSource;
  onDelete: (id: string) => void;
  onFreeze: (id: string) => void;
  onPush?: (id: string) => void;
}

const TYPE_EMOJI: Record<string, string> = {
  '婚礼': '💒',
  '满月宴': '👶',
  '乔迁宴': '🏠',
  '寿宴': '🎂',
  '升学宴': '🎓',
  '其他': '🎉',
};

export default function BanquetCard({ banquet, records, source, onDelete, onFreeze, onPush }: Props) {
  const navigate = useNavigate();
  const totalAmount = records.reduce((s, r) => s + r.amount, 0);
  const [showActions, setShowActions] = useState(false);
  const [dialog, setDialog] = useState<'freeze' | 'delete' | 'push' | null>(null);

  return (
    <Card
      className={`cursor-pointer shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1.5 border-0 overflow-hidden ${
        banquet.frozen ? 'opacity-65 grayscale-[20%]' : ''
      }`}
      onClick={() => navigate(`/banquet/${banquet.id}?source=${source}`)}
    >
      <div className={`h-1.5 w-full ${banquet.frozen ? 'bg-muted-foreground/30' : 'gradient-festive'}`} />

      <CardContent className="p-5 pt-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-festive-light flex items-center justify-center text-2xl shrink-0">
              {TYPE_EMOJI[banquet.type] || '🎉'}
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-foreground truncate">{banquet.name}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                {banquet.frozen && (
                  <Badge variant="secondary" className="gap-1 text-xs bg-muted text-muted-foreground">
                    <Archive className="w-3 h-3" /> 已归档
                  </Badge>
                )}
                <Badge
                  variant="outline"
                  className={`gap-1 text-xs ${
                    source === 'local'
                      ? 'border-orange-300 text-orange-600 bg-orange-50'
                      : 'border-blue-300 text-blue-600 bg-blue-50'
                  }`}
                >
                  {source === 'local' ? (
                    <>
                      <Smartphone className="w-3 h-3" /> 本地
                    </>
                  ) : (
                    <>
                      <Cloud className="w-3 h-3" /> 云端
                    </>
                  )}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex gap-0.5 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              onClick={(e) => { e.stopPropagation(); setShowActions(!showActions); }}
            >
              {showActions ? <Check className="w-4 h-4" /> : <MoreHorizontal className="w-4 h-4" />}
            </Button>
            {showActions && (
              <div onClick={(e) => e.stopPropagation()}>
                {source === 'local' && !banquet.frozen && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-orange-500 hover:text-orange-600 hover:bg-orange-50"
                    onClick={(e) => { e.stopPropagation(); setDialog('push'); }}
                  >
                    <Upload className="w-4 h-4" />
                  </Button>
                )}
                {!banquet.frozen && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                    onClick={(e) => { e.stopPropagation(); setDialog('freeze'); }}
                  >
                    <Archive className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={(e) => { e.stopPropagation(); setDialog('delete'); }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
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

      <AlertDialog open={dialog === 'freeze'} onOpenChange={(open) => !open && setDialog(null)}>
        <AlertDialogContent className="sm:max-w-md rounded-2xl w-[calc(100%-2rem)] max-w-[calc(100%-2rem)]" onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>确认归档宴会</AlertDialogTitle>
            <AlertDialogDescription>
              确定要归档「{banquet.name}」吗？归档后将无法修改或删除其中的记录。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDialog(null)}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={() => { onFreeze(banquet.id); setDialog(null); }}>
              确认归档
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={dialog === 'delete'} onOpenChange={(open) => !open && setDialog(null)}>
        <AlertDialogContent className="sm:max-w-md rounded-2xl w-[calc(100%-2rem)] max-w-[calc(100%-2rem)]" onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除宴会</AlertDialogTitle>
            <AlertDialogDescription>
              确定要永久删除「{banquet.name}」吗？所有关联的礼金记录也将被删除，此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDialog(null)}>取消</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { onDelete(banquet.id); setDialog(null); }}
            >
              永久删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={dialog === 'push'} onOpenChange={(open) => !open && setDialog(null)}>
        <AlertDialogContent className="sm:max-w-md rounded-2xl w-[calc(100%-2rem)] max-w-[calc(100%-2rem)]" onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>确认上传到云端</AlertDialogTitle>
            <AlertDialogDescription>
              确定要将「{banquet.name}」上传到云端吗？上传后本地数据将被删除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDialog(null)}>取消</AlertDialogCancel>
            <AlertDialogAction
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => { onPush?.(banquet.id); setDialog(null); }}
            >
              上传
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
