import ModulePage from '../ModulePage';
import { getModule } from '../../utils/modules';

export default function DeliveryTruckPage() {
  return <ModulePage module={getModule('delivery-truck')} />;
}

