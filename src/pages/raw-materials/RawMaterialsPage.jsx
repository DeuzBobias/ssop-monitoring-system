import ModulePage from '../ModulePage';
import { getModule } from '../../utils/modules';

export default function RawMaterialsPage() {
  return <ModulePage module={getModule('raw-materials')} />;
}

