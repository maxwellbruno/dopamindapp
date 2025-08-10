import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const NameSetupDialog: React.FC = () => {
  const { user, updateDisplayName } = useAuth();
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState('');

  React.useEffect(() => {
    if (!user) return;
    const key = `name_set_${user.id}`;
    const alreadySet = window.localStorage.getItem(key) === 'true';
    const needsName = !user.name || user.name === 'User';
    if (needsName && !alreadySet) {
      setOpen(true);
      setName('');
    }
  }, [user]);

  const handleSave = async () => {
    if (!name.trim()) return;
    await updateDisplayName(name.trim());
    try { window.localStorage.setItem(`name_set_${user?.id}`, 'true'); } catch {}
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set your display name</DialogTitle>
          <DialogDescription>This helps personalize your experience.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <label className="text-sm font-medium">Display name</label>
          <Input
            placeholder="e.g., Alex"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button onClick={handleSave} disabled={!name.trim()}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NameSetupDialog;
