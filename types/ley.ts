import { Firmante } from './firmante';

// Base interface for common properties
export interface LeyBase {
    titulo: string;
    desEstado: string;
    fecPresentacion: string;
}

// Used in list views (leyesTab.tsx)
export interface LeyResumen extends LeyBase {
    pleyNum: number;
    autores: string;
}

// Used in detail view (detalle.tsx)
export interface LeyDetalle extends LeyBase {
    pleyId: string;
    desProponente: string;
    desGpar: string;
    sumilla: string;
    firmantes: Firmante[];
}

// Type guard to check if a Ley is a LeyDetalle
export function isLeyDetalle(ley: LeyBase): ley is LeyDetalle {
    return (ley as LeyDetalle).pleyId !== undefined;
}