import { useSelector } from 'react-redux';

export const useShiftPermissions = () => {
    const shiftPermissions: number[] = useSelector(
        (state: any) => state?.shiftPermissions?.shiftPermissions ?? []
    );
    const isLoading: boolean = useSelector(
        (state: any) => state?.shiftPermissions?.isLoading ?? false
    );
    const error: string | null = useSelector(
        (state: any) => state?.shiftPermissions?.error ?? null
    );

    const hasShiftPermission = (shiftId: number | string | undefined | null): boolean => {
        if (!shiftId) return false;
        return shiftPermissions.includes(Number(shiftId));
    };

    return {
        shiftPermissions,
        isLoading,
        error,
        hasShiftPermission,
    };
};
