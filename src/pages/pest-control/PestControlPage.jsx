import ModulePage from '../ModulePage';
import { getModule } from '../../utils/modules';

export default function PestControlPage() {
  return <ModulePage module={getModule('pest-control')} />;
}

