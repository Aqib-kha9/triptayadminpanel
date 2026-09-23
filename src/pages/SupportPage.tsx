
import SupportModule from '../components/modules/SupportModule';

export default function SupportPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Support Tickets</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage user and vendor support requests.</p>
        </div>
      </div>
      <SupportModule />
    </div>
  );
}
