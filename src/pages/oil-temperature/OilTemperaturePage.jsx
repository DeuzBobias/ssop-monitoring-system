import ModulePage from '../ModulePage';
import { getModule } from '../../utils/modules';

export default function OilTemperaturePage() {
  return <ModulePage module={getModule('oil-temperature')} />;
}

