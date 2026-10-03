import '@/ui/settings.css';
import { mountSettings } from '@/ui/settings';

void mountSettings(document.querySelector<HTMLElement>('#app')!, { full: true });
