import ModulePage from '../ModulePage';
import { getModule } from '../../utils/modules';

export default function StockManagementPage() {
  return <ModulePage module={getModule('stock-management')} />;
}

