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
      className={`cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-border/60 animate-fade-in group ${banquet.frozen ? 'opacity-70' : ''}`}
      onClick={() => navigate(`/banquet/${banquet.id}`)}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{TYPE_EMOJI[banquet.type] || '🎉'}</span>
            <h3 className="text-xl font-semibold text-foreground">{banquet.name}</h3>
            {banquet.frozen && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <Archive className="w-3 h-3" /> 已归档
              </Badge>
            )}
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* 归档按钮 - 仅未归档时显示 */}
            {!banquet.frozen && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-primary"
                    onClick={e => e.stopPropagation()}
                  >
                    <Archive className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent onClick={e => e.stopPropagation()}>
                  <AlertDialogHeader>
                    <AlertDialogTitle>确认归档宴会</AlertDialogTitle>
                    <AlertDialogDescription>
                      确定要归档「{banquet.name}」吗？归档后将无法修改或删除其中的记录。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <AlertDialogAction onClick={e => { e.stopPropagation(); onFreeze(banquet.id); }}>
                      确认归档
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            {/* 删除按钮 - 仅未归档时显示 */}
            {!banquet.frozen && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={e => e.stopPropagation()}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent onClick={e => e.stopPropagation()}>
                  <AlertDialogHeader>
                    <AlertDialogTitle>确认删除宴会</AlertDialogTitle>
                    <AlertDialogDescription>
                      确定要永久删除「{banquet.name}」吗？所有关联的礼金记录也将被删除，此操作不可撤销。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={e => { e.stopPropagation(); onDelete(banquet.id); }}
                    >
                      永久删除
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
        <div className="space-y-1.5 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" /> {banquet.date}
          </div>
          {banquet.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" /> {banquet.location}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4 pt-3 border-t border-border/50">
          <div className="flex items-center gap-1.5 text-sm">
            <Users className="w-4 h-4 text-primary" />
            <span className="font-medium">{records.length}</span>
            <span className="text-muted-foreground">位来宾</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <Banknote className="w-4 h-4 text-gold" />
            <span className="font-medium text-gold">¥{totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
